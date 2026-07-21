import { z } from 'zod'

export const createAnnouncementSchema = z.object({
  tournamentId: z.string().min(1),
  title: z.string().min(3).max(200),
  bodyHtml: z.string().min(1).max(50000),
  isAllInstitutions: z.boolean(),
  institutionIds: z.array(z.string().min(1)).max(1000),
  scheduledFor: z.union([z.coerce.date(), z.null()]).optional(),
  isPublic: z.boolean(),
}).refine((v) => v.isAllInstitutions || v.institutionIds.length > 0, { path: ['institutionIds'], message: 'Pick at least one institution.' })
  .refine((v) => v.scheduledFor == null || v.scheduledFor.getTime() > Date.now(), { path: ['scheduledFor'], message: 'Scheduled time must be in the future.' })
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>

export const updateAnnouncementSchema = z.object({
  announcementId: z.string().min(1), title: z.string().min(3).max(200),
  bodyHtml: z.string().min(1).max(50000), isPublic: z.boolean(),
})
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>

export const retractAnnouncementSchema = z.object({ announcementId: z.string().min(1), note: z.string().min(3).max(1000) })
export type RetractAnnouncementInput = z.infer<typeof retractAnnouncementSchema>

export const markAsReadSchema = z.object({ announcementId: z.string().min(1) })
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>
