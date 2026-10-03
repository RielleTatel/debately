import { readPage, type SearchParams } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import type { CsvImport, CsvImportRow } from '@prisma/client'

export async function getImportsForTournament(tournamentId: string): Promise<CsvImport[]> {
  return prisma.csvImport.findMany({
    where: { tournamentId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getImportById(id: string): Promise<CsvImport | null> {
  return prisma.csvImport.findUnique({ where: { id } })
}

export async function getImportRows(importId: string): Promise<CsvImportRow[]> {
  return prisma.csvImportRow.findMany({
    where: { importId },
    orderBy: { rowIndex: 'asc' },
  })
}

export async function getImportHistoryPage(tournamentId: string, search: SearchParams = {}) {
  const paging = readPage(search)
  const [rows, total] = await Promise.all([
    prisma.csvImport.findMany({
      where: { tournamentId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: paging.skip,
      take: paging.pageSize,
      select: {
        id: true,
        phaseLabel: true,
        status: true,
        createdAt: true,
        uploader: { select: { displayName: true } },
      },
    }),
    prisma.csvImport.count({ where: { tournamentId } }),
  ])
  return {
    rows: rows.map((row) => ({ ...row, uploaderName: row.uploader.displayName })),
    total,
    paging,
  }
}
