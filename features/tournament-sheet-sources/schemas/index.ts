import { z } from 'zod'

const phaseSchema = z.enum(['INSTITUTIONS', 'TEAMS', 'ADJUDICATORS'])

const spreadsheetIdSchema = z.string().min(20).max(100).regex(/^[a-zA-Z0-9_-]+$/)

export const createSourceSchema = z.object({
  tournamentId: z.string().min(1),
  phase: phaseSchema,
  spreadsheetId: spreadsheetIdSchema,
  sheetTabName: z.string().min(1).max(100).optional().nullable(),
})
export type CreateSourceInput = z.infer<typeof createSourceSchema>

export const updateMappingSchema = z.object({
  sourceId: z.string().min(1),
  columnMapping: z.record(z.string(), z.string()).refine(
    (m) => Object.keys(m).length > 0,
    { message: 'Column mapping must include at least one field.' },
  ),
})
export type UpdateMappingInput = z.infer<typeof updateMappingSchema>

export const toggleActiveSchema = z.object({
  sourceId: z.string().min(1),
  active: z.boolean(),
})
export type ToggleActiveInput = z.infer<typeof toggleActiveSchema>

export const deleteSourceSchema = z.object({
  sourceId: z.string().min(1),
})
export type DeleteSourceInput = z.infer<typeof deleteSourceSchema>

export const testSourceSchema = z.object({
  spreadsheetId: spreadsheetIdSchema,
  sheetTabName: z.string().min(1).max(100).optional().nullable(),
})
export type TestSourceInput = z.infer<typeof testSourceSchema>
