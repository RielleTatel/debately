'use server'

import { prisma } from '@/lib/prisma'
import { toApi, Errors } from '@/lib/errors'
import {
  saveMappingTemplateSchema,
  deleteMappingTemplateSchema,
} from '@/features/imports/schemas'
import { requireOrgMember } from '@/features/organizations/permissions'
import type { ApiResponse } from '@/types/api'

export async function saveMappingTemplateAction(
  formData: FormData,
): Promise<ApiResponse<{ templateId: string }>> {
  try {
    const parsed = saveMappingTemplateSchema.parse({
      orgId: formData.get('orgId'),
      name: formData.get('name'),
      mapping: JSON.parse(String(formData.get('mapping') ?? '{}')),
    })
    await requireOrgMember(parsed.orgId)
    const t = await prisma.columnMapping.create({
      data: { orgId: parsed.orgId, name: parsed.name, mappingJson: parsed.mapping as never },
    })
    return { ok: true, data: { templateId: t.id } }
  } catch (e) {
    return toApi(e)
  }
}

export async function deleteMappingTemplateAction(
  formData: FormData,
): Promise<ApiResponse<{ templateId: string }>> {
  try {
    const parsed = deleteMappingTemplateSchema.parse({ templateId: formData.get('templateId') })
    const existing = await prisma.columnMapping.findUnique({ where: { id: parsed.templateId } })
    if (!existing) throw Errors.notFound('Template not found')
    await requireOrgMember(existing.orgId)
    await prisma.columnMapping.delete({ where: { id: parsed.templateId } })
    return { ok: true, data: { templateId: parsed.templateId } }
  } catch (e) {
    return toApi(e)
  }
}
