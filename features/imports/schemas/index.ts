import { z } from 'zod'
import type { SystemField } from '@/features/imports/types'

const SYSTEM_FIELDS: readonly SystemField[] = [
  'ignore', 'registration_type', 'institution_name',
  'representative_name', 'representative_email', 'representative_contact',
  'teams_intended', 'adjudicators_intended',
  'team_name', 'team_novice',
  'debater_name', 'debater_email', 'debater_contact', 'debater_institution',
  'judge_name', 'judge_email', 'judge_contact', 'judge_institution',
] as const

export const phaseLabelSchema = z.string().trim().min(1, 'Phase label is required').max(200)

export const columnMappingEntrySchema = z.object({
  header: z.string().max(500),
  field: z.enum(SYSTEM_FIELDS as unknown as [SystemField, ...SystemField[]]),
  slotIndex: z.number().int().min(1).max(20).optional(),
  repeatGroup: z.string().min(1).max(64).optional(),
})

export const mappingSpecSchema = z.object({
  entries: z.array(columnMappingEntrySchema),
  repeatGroups: z.array(z.object({
    name: z.string().min(1).max(64),
    repetitions: z.number().int().min(2).max(10),
  })),
})

export const startImportSchema = z.object({
  tournamentId: z.string().min(1),
  phaseLabel: phaseLabelSchema,
})

export const saveMappingSchema = z.object({
  importId: z.string().min(1),
  mapping: mappingSpecSchema,
})

export const saveMappingTemplateSchema = z.object({
  orgId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  mapping: mappingSpecSchema,
})

export const deleteMappingTemplateSchema = z.object({ templateId: z.string().min(1) })

export const applyDiffSchema = z.object({
  importId: z.string().min(1),
  rowIndex: z.number().int().min(0),
  mode: z.enum(['apply', 'apply-selected', 'keep-existing']),
  selectedFields: z.array(z.string()).default([]),
}).refine(
  (v) => v.mode !== 'apply-selected' || v.selectedFields.length > 0,
  { message: 'apply-selected requires at least one selected field', path: ['selectedFields'] }
)

export const confirmNormalizationSchema = z.object({
  importId: z.string().min(1),
  rawName: z.string().min(1),
  decision: z.enum(['confirm', 'reject']),
  targetInstitutionId: z.string().min(1).optional(),
}).refine(
  (v) => v.decision !== 'confirm' || !!v.targetInstitutionId,
  { message: 'confirm requires a targetInstitutionId', path: ['targetInstitutionId'] }
)

export const finalizeImportSchema = z.object({ importId: z.string().min(1) })
export const rollbackImportSchema = z.object({
  importId: z.string().min(1),
  confirm: z.literal(true),
})

export type StartImportInput = z.infer<typeof startImportSchema>
export type SaveMappingInput = z.infer<typeof saveMappingSchema>
export type SaveMappingTemplateInput = z.infer<typeof saveMappingTemplateSchema>
export type ApplyDiffInput = z.infer<typeof applyDiffSchema>
export type ConfirmNormalizationInput = z.infer<typeof confirmNormalizationSchema>
export type FinalizeImportInput = z.infer<typeof finalizeImportSchema>
export type RollbackImportInput = z.infer<typeof rollbackImportSchema>
