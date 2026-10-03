import { beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma'
import { getImportsForTournament } from '@/features/imports/queries'
import { getInstitutionsForTournament } from '@/features/institutions/queries'
import { confirmNormalizationAction } from '@/features/imports/actions/confirm-normalization'
import { applyDiffAction } from '@/features/imports/actions/apply-diff'
import { getImportRows } from '@/features/imports/queries'
import { getParticipantsForInstitution } from '@/features/participants/queries'
import { finalizeImportAction } from '@/features/imports/actions/finalize-import'
import { getAdjudicatorsForTournament } from '@/features/adjudicators/queries'
import type { Prisma } from '@prisma/client'
import type { ParsedRow } from '@/features/imports/types'

function row(rowIndex: number): ParsedRow {
  return {
    rowIndex,
    raw: {},
    registrationType: 'composite',
    institutionName: 'Import School',
    representative: { name: null, email: null, phone: null },
    teamsIntended: null,
    adjudicatorsIntended: null,
    logicalTeams: [
      {
        slotIndex: 1,
        teamName: 'Import Team',
        isNovice: false,
        debaters: [
          {
            slotIndex: 1,
            name: rowIndex === 0 ? 'First name' : 'Latest name',
            email: 'import-speaker@example.com',
            phone: null,
            institution: null,
          },
        ],
      },
    ],
    judges: [],
  }
}
async function createImport(rows = [row(0), row(1)], phaseLabel = 'Phase 2') {
  return prisma.csvImport.create({
    data: {
      tournamentId: 'fixture-tournament',
      uploaderId: 'owner',
      storagePath: 'fixture.csv',
      phaseLabel,
      status: 'PROCESSED',
      rows: {
        create: rows.map((parsed) => ({
          rowIndex: parsed.rowIndex,
          rawJson: parsed as unknown as Prisma.InputJsonValue,
          status: 'PENDING',
        })),
      },
    },
  })
}
function form(importId: string) {
  const data = new FormData()
  data.set('importId', importId)
  return data
}

beforeEach(async () => {
  await prisma.csvImport.deleteMany({ where: { tournamentId: 'fixture-tournament' } })
  await prisma.tournamentInstitution.deleteMany({
    where: { tournamentId: 'fixture-tournament', name: 'Import School' },
  })
  await prisma.institutionAlias.deleteMany({
    where: { tournamentId: 'fixture-tournament', alias: 'import school' },
  })
})

describe('import finalization actions', () => {
  it('reports committed totals and preserves the last repeated email update', async () => {
    const record = await createImport()
    const response = await finalizeImportAction(form(record.id))
    expect(response).toEqual({
      ok: true,
      data: {
        institutionsCreated: 1,
        teamsCreated: 1,
        participantsCreated: 1,
        adjudicatorsCreated: 0,
        recordsUpdatedViaReimport: 2,
        rowsImported: 2,
        rowsSkipped: 0,
      },
    })
    const institutions = await getInstitutionsForTournament('fixture-tournament')
    const institution = institutions.find((record) => record.name === 'Import School')!
    const participants = await getParticipantsForInstitution(institution.id)
    expect(participants.map((speaker) => speaker.displayName)).toEqual(['Latest name'])
  })

  it('rolls back the claim and every record if a write fails', async () => {
    const record = await createImport()
    await prisma.$executeRaw`CREATE OR REPLACE FUNCTION fixture_fail_import() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.email = 'import-speaker@example.com' THEN RAISE EXCEPTION 'Injected import failure'; END IF; RETURN NEW; END $$`
    await prisma.$executeRaw`CREATE TRIGGER fixture_fail_import BEFORE INSERT ON participants FOR EACH ROW EXECUTE FUNCTION fixture_fail_import()`
    try {
      expect(await finalizeImportAction(form(record.id))).toMatchObject({ ok: false })
      expect(
        (await getImportsForTournament('fixture-tournament')).find((item) => item.id === record.id)
          ?.status,
      ).toBe('PROCESSED')
      expect(
        (await getInstitutionsForTournament('fixture-tournament')).some(
          (item) => item.name === 'Import School',
        ),
      ).toBe(false)
    } finally {
      await prisma.$executeRaw`DROP TRIGGER fixture_fail_import ON participants`
      await prisma.$executeRaw`DROP FUNCTION fixture_fail_import()`
    }
  })

  it('keeps a normalization rejection attached to its original import rows', async () => {
    const record = await createImport()
    const data = form(record.id)
    data.set('rawName', 'Import School')
    data.set('decision', 'reject')
    expect(await confirmNormalizationAction(data)).toMatchObject({ ok: true })
    expect((await getImportRows(record.id)).map((row) => row.messages)).toEqual([
      ['NORMALIZATION_DECISION:reject'],
      ['NORMALIZATION_DECISION:reject'],
    ])
  })

  it('stores a review choice on the original row rather than its position in a page', async () => {
    const record = await createImport()
    const data = form(record.id)
    data.set('rowIndex', '1')
    data.set('mode', 'keep-existing')
    data.set('selectedFields', '[]')
    expect(await applyDiffAction(data)).toMatchObject({ ok: true })
    expect((await getImportRows(record.id)).map((row) => row.status)).toEqual([
      'PENDING',
      'SKIPPED',
    ])
  })

  it('commits one import when two finalize submissions race', async () => {
    const record = await createImport()
    const responses = await Promise.all([
      finalizeImportAction(form(record.id)),
      finalizeImportAction(form(record.id)),
    ])
    expect(responses.filter((result) => result.ok)).toHaveLength(1)
    expect(responses.find((result) => !result.ok)).toMatchObject({ ok: false, code: 'CONFLICT' })
  })

  it('imports phase-one intentions without rosters and marks missing registrations skipped', async () => {
    const first = {
      ...row(0),
      teamsIntended: 2,
      representative: { name: 'Representative', email: null, phone: null },
    }
    const latest = { ...row(1), teamsIntended: 4 }
    const missing = { ...row(2), registrationType: null }
    const record = await createImport([first, latest, missing], 'Phase 1 intentions')
    expect(await finalizeImportAction(form(record.id))).toMatchObject({
      ok: true,
      data: {
        institutionsCreated: 1,
        teamsCreated: 0,
        participantsCreated: 0,
        rowsImported: 2,
        rowsSkipped: 1,
      },
    })
    const institution = (await getInstitutionsForTournament('fixture-tournament')).find(
      (item) => item.name === 'Import School',
    )!
    expect(institution).toMatchObject({ teamsIntended: 4, contactName: 'Representative' })
    expect((await getImportRows(record.id)).map((item) => item.status)).toEqual([
      'IMPORTED',
      'IMPORTED',
      'SKIPPED',
    ])
  })

  it('uses a confirmed alias and honors a later rejection for this import', async () => {
    const record = await createImport()
    const data = form(record.id)
    data.set('rawName', 'Import School')
    data.set('decision', 'confirm')
    data.set('targetInstitutionId', 'institution-0')
    expect(await confirmNormalizationAction(data)).toMatchObject({ ok: true })
    expect(await finalizeImportAction(form(record.id))).toMatchObject({
      ok: true,
      data: { institutionsCreated: 0 },
    })
    expect(
      (await getParticipantsForInstitution('institution-0')).some(
        (item) => item.email === 'import-speaker@example.com',
      ),
    ).toBe(true)
    const separate = await createImport()
    data.set('importId', separate.id)
    data.set('decision', 'reject')
    expect(await confirmNormalizationAction(data)).toMatchObject({ ok: true })
    expect(await finalizeImportAction(form(separate.id))).toMatchObject({
      ok: true,
      data: { institutionsCreated: 1 },
    })
  })

  it('preserves independent adjudicators during phase-three corrections', async () => {
    const parsed: ParsedRow = {
      ...row(0),
      institutionName: null,
      registrationType: 'independent_adjudicator',
      logicalTeams: [],
      judges: [
        {
          name: 'Corrected independent',
          email: 'judge150@example.com',
          phone: null,
          institution: null,
        },
      ],
    }
    const record = await createImport([parsed], 'Phase 3 corrections')
    expect(await finalizeImportAction(form(record.id))).toMatchObject({
      ok: true,
      data: { adjudicatorsCreated: 0, recordsUpdatedViaReimport: 1 },
    })
    expect(
      (await getAdjudicatorsForTournament('fixture-tournament')).find(
        (item) => item.id === 'adjudicator-150',
      ),
    ).toMatchObject({
      displayName: 'Corrected independent',
      tournamentInstitutionId: null,
      status: 'WITHDRAWN',
    })
  })

  it('applies only a selected speaker field and keeps the other speaker unchanged', async () => {
    const original = row(0)
    original.logicalTeams[0].debaters.push({
      slotIndex: 2,
      name: 'Second speaker',
      email: 'second@example.com',
      phone: null,
      institution: null,
    })
    expect(await finalizeImportAction(form((await createImport([original])).id))).toMatchObject({
      ok: true,
    })
    const correction = row(1)
    correction.logicalTeams[0].debaters.push({
      slotIndex: 2,
      name: 'Unselected change',
      email: 'second@example.com',
      phone: null,
      institution: null,
    })
    const record = await createImport([correction], 'Phase 3')
    const data = form(record.id)
    data.set('rowIndex', '1')
    data.set('mode', 'apply-selected')
    data.set('selectedFields', '["debater_1_name"]')
    expect(await applyDiffAction(data)).toMatchObject({ ok: true })
    expect(await finalizeImportAction(form(record.id))).toMatchObject({ ok: true })
    const institution = (await getInstitutionsForTournament('fixture-tournament')).find(
      (item) => item.name === 'Import School',
    )!
    expect(
      (await getParticipantsForInstitution(institution.id)).map((item) => item.displayName),
    ).toEqual(['Latest name', 'Second speaker'])
  })

  it('uses the scoped email for selected fields when CSV and alphabetical order differ', async () => {
    const original = row(0)
    original.logicalTeams[0].debaters = [
      { slotIndex: 1, name: 'Alice', email: 'alice@example.com', phone: null, institution: null },
      { slotIndex: 2, name: 'Bob', email: 'bob@example.com', phone: null, institution: null },
    ]
    expect(await finalizeImportAction(form((await createImport([original])).id))).toMatchObject({
      ok: true,
    })
    const correction = row(1)
    correction.logicalTeams[0].debaters = [
      { slotIndex: 1, name: 'Robert', email: 'bob@example.com', phone: null, institution: null },
    ]
    const record = await createImport([correction], 'Phase 3')
    const fd = form(record.id)
    fd.set('rowIndex', '1')
    fd.set('mode', 'apply-selected')
    fd.set('selectedFields', '["debater_1_name"]')
    expect(await applyDiffAction(fd)).toMatchObject({ ok: true })
    expect(await finalizeImportAction(form(record.id))).toMatchObject({
      ok: true,
      data: { participantsCreated: 0 },
    })
    const institution = (await getInstitutionsForTournament('fixture-tournament')).find(
      (item) => item.name === 'Import School',
    )!
    expect(
      (await getParticipantsForInstitution(institution.id)).map((item) => ({
        name: item.displayName,
        email: item.email,
      })),
    ).toEqual([
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Robert', email: 'bob@example.com' },
    ])
  })
})
