import { PrismaClient } from '@prisma/client'
import { browserEnvironment } from './environment'

export async function seedBrowserDatabase() {
  const db = new PrismaClient({ datasourceUrl: browserEnvironment.DATABASE_URL })
  try {
    await db.organization.deleteMany({ where: { id: { in: ['fixture-org', 'other-org'] } } })
    for (const role of [
      'owner',
      'director',
      'member',
      'rep',
      'wrong-rep',
      'unrelated',
      'unverified',
    ]) {
      await db.profile.upsert({
        where: { id: role },
        update: {},
        create: { id: role, userId: role, displayName: role },
      })
    }
    await db.organization.create({
      data: {
        id: 'fixture-org',
        name: 'Fixture Organization',
        slug: 'fixture-org',
        ownerId: 'owner',
        members: {
          create: ['owner', 'director', 'member', 'unverified'].map((profileId) => ({
            profileId,
            role: profileId === 'owner' ? 'OWNER' : 'MEMBER',
          })),
        },
      },
    })
    await db.tournament.create({
      data: {
        id: 'fixture-tournament',
        orgId: 'fixture-org',
        name: 'Performance Tournament',
        slug: 'performance',
        format: 'BP',
        status: 'ACTIVE',
        startDate: new Date('2027-01-01'),
        endDate: new Date('2027-01-02'),
        registrationDeadline: new Date('2027-01-01'),
        venue: 'Fixture venue',
        address: 'Fixture address',
        maxTeamSlots: 1200,
        currency: 'PHP',
        publicPageEnabled: true,
        directors: { create: { profileId: 'director' } },
      },
    })
    await db.tournamentInstitution.createMany({
      data: Array.from({ length: 150 }, (_, n) => ({
        id: `institution-${n}`,
        tournamentId: 'fixture-tournament',
        name: `School ${String(n).padStart(3, '0')}`,
      })),
    })
    await db.institutionClaim.create({
      data: { tournamentInstitutionId: 'institution-0', profileId: 'rep' },
    })
    await db.team.createMany({
      data: Array.from({ length: 1000 }, (_, n) => ({
        id: `team-${n}`,
        tournamentInstitutionId: n < 120 ? 'institution-0' : `institution-${n % 150}`,
        name: `Team ${String(n).padStart(4, '0')}`,
        importPhase: 'phase2',
        createdAt: new Date(n < 500 ? '2026-01-01T23:59:59Z' : '2026-01-02T00:00:00Z'),
      })),
    })
    await db.participant.createMany({
      data: Array.from({ length: 3000 }, (_, n) => ({
        id: `participant-${n}`,
        teamId: `team-${Math.floor(n / 3)}`,
        tournamentInstitutionId:
          Math.floor(n / 3) < 120 ? 'institution-0' : `institution-${Math.floor(n / 3) % 150}`,
        displayName: `Speaker ${String(Math.floor(n / 3)).padStart(4, '0')}`,
        email: `speaker${n}@example.com`,
        importPhase: 'phase2',
      })),
    })
    await db.adjudicator.createMany({
      data: Array.from({ length: 170 }, (_, n) => ({
        id: `adjudicator-${n}`,
        tournamentId: 'fixture-tournament',
        tournamentInstitutionId: n < 120 ? 'institution-0' : null,
        displayName: `Judge ${String(Math.floor(n / 2)).padStart(3, '0')}`,
        email: `judge${n}@example.com`,
        importPhase: 'phase2',
        status: n < 150 ? 'ACTIVE' : 'WITHDRAWN',
      })),
    })
    await db.teamValidationFlag.createMany({
      data: [
        { teamId: 'team-0', kind: 'INCOMPLETE', note: 'Fixture' },
        { teamId: 'team-0', kind: 'MISSING_JUDGE', note: 'Fixture' },
      ],
    })

    for (const size of ['empty', 'small']) {
      const tournamentId = `fixture-${size}`
      await db.tournament.create({
        data: {
          id: tournamentId,
          orgId: 'fixture-org',
          name: `${size} tournament`,
          slug: size,
          format: 'BP',
          status: 'ACTIVE',
          startDate: new Date('2027-01-01'),
          endDate: new Date('2027-01-02'),
          registrationDeadline: new Date('2027-01-01'),
          venue: 'Fixture',
          address: 'Fixture',
          maxTeamSlots: 100,
          directors: { create: { profileId: 'director' } },
        },
      })
      await db.tournamentInstitution.create({
        data: {
          id: `${size}-institution`,
          tournamentId,
          name: 'School 000',
          claim: { create: { profileId: 'rep' } },
        },
      })
      if (size === 'small') {
        await db.team.createMany({
          data: Array.from({ length: 4 }, (_, n) => ({
            id: `small-team-${n}`,
            tournamentInstitutionId: 'small-institution',
            name: `Small team ${n}`,
            importPhase: 'phase2',
          })),
        })
        await db.participant.createMany({
          data: Array.from({ length: 12 }, (_, n) => ({
            id: `small-speaker-${n}`,
            tournamentInstitutionId: 'small-institution',
            teamId: `small-team-${Math.floor(n / 3)}`,
            displayName: `Small speaker ${n}`,
            importPhase: 'phase2',
          })),
        })
      }
    }

    for (const [index, totalMinor, currency] of [
      [0, 10000, 'PHP'],
      [1, 20000, 'PHP'],
      [2, 0, 'PHP'],
      [3, 5000, 'USD'],
    ] as const) {
      await db.invoice.create({
        data: {
          id: `invoice-${index}`,
          tournamentInstitutionId: `institution-${index}`,
          invoiceNumber: `FIXTURE-${index}`,
          totalMinor,
          currency,
        },
      })
    }
    for (const [index, amountMinor] of [
      [0, 2500],
      [1, 22000],
      [2, 100],
      [3, 5000],
    ] as const) {
      await db.paymentReceipt.create({
        data: {
          invoiceId: `invoice-${index}`,
          uploaderId: 'owner',
          amountMinor,
          paymentDate: new Date('2026-01-01'),
          referenceNumber: `FIXTURE-${index}`,
          method: 'BANK_TRANSFER',
          storagePath: 'fixture.pdf',
          status: 'APPROVED',
        },
      })
    }
    await db.paymentReceipt.create({
      data: {
        invoiceId: 'invoice-0',
        uploaderId: 'owner',
        amountMinor: 9000,
        paymentDate: new Date('2026-01-01'),
        referenceNumber: 'PENDING',
        method: 'BANK_TRANSFER',
        storagePath: 'fixture.pdf',
        status: 'SUBMITTED',
      },
    })
    await db.tournamentPayment.createMany({
      data: [
        {
          tournamentId: 'fixture-tournament',
          tournamentInstitutionId: 'institution-0',
          amountMinor: 1000,
          currency: 'PHP',
          status: 'PENDING',
        },
        {
          tournamentId: 'fixture-tournament',
          tournamentInstitutionId: 'institution-0',
          amountMinor: 2000,
          currency: 'USD',
          status: 'CONFIRMED',
        },
        {
          tournamentId: 'fixture-tournament',
          tournamentInstitutionId: 'institution-0',
          amountMinor: 4000,
          currency: 'PHP',
          status: 'VOIDED',
        },
      ],
    })
    await db.request.createMany({
      data: [
        {
          tournamentId: 'fixture-tournament',
          tournamentInstitutionId: 'institution-0',
          submitterId: 'rep',
          sequenceNumber: 1,
          type: 'OTHER',
          status: 'APPROVED',
          description: 'Fixture',
          payload: {},
          createdAt: new Date('2026-01-01T00:00Z'),
          resolvedAt: new Date('2026-01-01T02:00Z'),
        },
        {
          tournamentId: 'fixture-tournament',
          tournamentInstitutionId: 'institution-0',
          submitterId: 'rep',
          sequenceNumber: 2,
          type: 'OTHER',
          status: 'REJECTED',
          description: 'Fixture',
          payload: {},
          createdAt: new Date('2026-01-01T00:00Z'),
          resolvedAt: new Date('2026-01-01T04:00Z'),
        },
      ],
    })
    await db.csvImport.create({
      data: {
        id: 'fixture-import',
        tournamentId: 'fixture-tournament',
        uploaderId: 'owner',
        phaseLabel: 'Phase 2',
        storagePath: 'fixture.csv',
        status: 'PROCESSED',
        mappingJson: {
          entries: [
            { header: 'Type', field: 'registration_type' },
            { header: 'Institution', field: 'institution_name' },
            { header: 'Team', field: 'team_name', repeatGroup: 'teams' },
            { header: 'Debater 1', field: 'debater_name', slotIndex: 1, repeatGroup: 'teams' },
          ],
          repeatGroups: [{ name: 'teams', repetitions: 2 }],
        },
        rows: {
          create: Array.from({ length: 110 }, (_, n) => ({
            rowIndex: n + 200,
            status: 'RESUBMISSION',
            rawJson: {
              rowIndex: n + 200,
              raw: {},
              registrationType: 'composite',
              institutionName: 'School 000',
              representative: { name: null, email: null, phone: null },
              teamsIntended: null,
              adjudicatorsIntended: null,
              logicalTeams: [
                {
                  slotIndex: 1,
                  teamName: `Team ${String(n + 10).padStart(4, '0')}`,
                  isNovice: false,
                  debaters: [
                    {
                      slotIndex: 1,
                      name: `Reviewed speaker ${n}`,
                      email: `speaker${(n + 10) * 3}@example.com`,
                      phone: null,
                      institution: null,
                    },
                  ],
                },
              ],
              judges: [],
            },
          })),
        },
      },
    })
  } finally {
    await db.$disconnect()
  }
}
