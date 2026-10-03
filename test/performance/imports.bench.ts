import { it, expect } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { prisma, queries } from './prisma'
import { finalizeImportAction } from '@/features/imports/actions/finalize-import'
import { buildImportPreview } from '@/features/imports/services/build-preview'
import type { ParsedRow } from '@/features/imports/types'
import type { Prisma } from '@prisma/client'

it('records twenty preview and finalize samples for each import workload', async () => {
  const samples: Record<string, unknown>[] = []
  const label = process.env.PERFORMANCE_LABEL ?? 'after'
  for (const size of [50, 500, 1000])
    for (const names of ['repeated', 'distinct']) {
      for (let index = 0; index < 20; index++) {
        await prisma.tournamentInstitution.deleteMany({
          where: { tournamentId: 'fixture-tournament', name: { startsWith: 'Benchmark School' } },
        })
        const rows = Array.from({ length: size }, (_, n): ParsedRow => ({
          rowIndex: n,
          raw: {},
          registrationType: 'composite',
          institutionName: `Benchmark School ${names === 'repeated' ? 0 : n}`,
          representative: { name: null, email: null, phone: null },
          teamsIntended: null,
          adjudicatorsIntended: null,
          logicalTeams: [
            {
              slotIndex: 1,
              teamName: 'Benchmark Team',
              isNovice: false,
              debaters: [
                {
                  slotIndex: 1,
                  name: `Speaker ${n}`,
                  email: `benchmark${names === 'repeated' ? 0 : n}@example.com`,
                  phone: null,
                  institution: null,
                },
              ],
            },
          ],
          judges: [],
        }))
        const record = await prisma.csvImport.create({
          data: {
            tournamentId: 'fixture-tournament',
            uploaderId: 'owner',
            status: 'PROCESSED',
            phaseLabel: 'Phase 2',
            storagePath: 'fixture.csv',
            rows: {
              create: rows.map((row) => ({
                rowIndex: row.rowIndex,
                rawJson: row as unknown as Prisma.InputJsonValue,
                status: 'PENDING',
              })),
            },
          },
        })
        queries.length = 0
        const previewBegan = performance.now()
        await buildImportPreview(record.id)
        const previewMs = performance.now() - previewBegan
        const previewSqlCount = queries.length
        queries.length = 0
        const finalizeBegan = performance.now()
        const fd = new FormData()
        fd.set('importId', record.id)
        const result = await finalizeImportAction(fd)
        const finalizeMs = performance.now() - finalizeBegan
        expect(result.ok).toBe(true)
        samples.push({
          size,
          names,
          index,
          previewMs,
          previewSqlCount,
          finalizeMs,
          finalizeSqlCount: queries.length,
          sqlDurationMs: queries.reduce((sum, query) => sum + query.durationMs, 0),
        })
        await prisma.csvImport.delete({ where: { id: record.id } })
      }
      mkdirSync('docs/performance', { recursive: true })
      writeFileSync(
        `docs/performance/${label}-imports.json`,
        JSON.stringify(
          {
            label,
            environment:
              'local PostgreSQL; public Server Action; real transaction; verified Auth SDK adapter; no artificial query delay',
            repetitions: 20,
            samples,
          },
          null,
          2,
        ),
      )
      console.log(`${label}: ${size} rows, ${names} institutions: 20 samples`)
    }
  await prisma.$disconnect()
})
