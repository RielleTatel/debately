import { prisma } from '@/lib/prisma'
import type { ColumnMapping } from '@prisma/client'

export async function listMappingTemplates(orgId: string): Promise<ColumnMapping[]> {
  return prisma.columnMapping.findMany({ where: { orgId }, orderBy: { name: 'asc' } })
}

export async function getMappingTemplate(id: string): Promise<ColumnMapping | null> {
  return prisma.columnMapping.findUnique({ where: { id } })
}
