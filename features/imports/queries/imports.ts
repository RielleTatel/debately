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
