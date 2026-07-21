import { z } from 'zod'
import { slugSchema } from '@/lib/validation'

const RESERVED_TOURNAMENT_SLUGS = new Set(['settings', 'create', 'activity', 'exports'])

const tournamentSlug = slugSchema.refine((s) => !RESERVED_TOURNAMENT_SLUGS.has(s), {
  message: 'This slug is reserved. Choose another.',
})

const name = z.string().min(3).max(120)
const description = z.string().max(2000).optional().or(z.literal(''))
const venue = z.string().min(1).max(200)
const address = z.string().min(1).max(500)
const format = z.enum(['BP', 'AP', 'WSDC', 'CP', 'CUSTOM'])
const currency = z.string().length(3).regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter ISO code')

const feeLine = z.object({
  label: z.string().min(1).max(120),
  amount: z.number().nonnegative(),
  unit: z.enum(['per_team', 'per_adjudicator', 'flat']),
})

const feeStructure = z.object({
  kind: z.enum(['none', 'itemized']),
  lines: z.array(feeLine).max(20),
})

const formatConfig = z.object({
  speakerCount: z.number().int().min(1).max(10),
  customEligibility: z.string().max(2000),
})

export const createTournamentSchema = z
  .object({
    name,
    slug: tournamentSlug,
    format,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    registrationDeadline: z.coerce.date(),
    paymentDeadline: z.coerce.date().optional(),
    venue,
    address,
    maxTeamSlots: z.coerce.number().int().min(1).max(10_000),
    description,
  })
  .refine((d) => d.endDate > d.startDate, { message: 'End date must be after start date', path: ['endDate'] })
  .refine((d) => d.registrationDeadline <= d.startDate, {
    message: 'Registration deadline must be on or before start date',
    path: ['registrationDeadline'],
  })

export const updateTournamentBasicSchema = z
  .object({
    name,
    slug: tournamentSlug,
    description,
    venue,
    address,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((d) => d.endDate > d.startDate, { message: 'End date must be after start date', path: ['endDate'] })

export const updateRegistrationSettingsSchema = z.object({
  registrationOpen: z.coerce.boolean(),
  maxTeamSlots: z.coerce.number().int().min(1).max(10_000),
  maxTeamsPerInstitution: z.coerce.number().int().min(1).max(1000).optional(),
  maxAdjudicatorsPerInstitution: z.coerce.number().int().min(1).max(1000).optional(),
  registrationDeadline: z.coerce.date(),
})

export const updateFinanceSettingsSchema = z.object({
  currency,
  feeStructure,
  paymentDeadline: z.coerce.date().optional(),
})

export const updatePortalSettingsSchema = z.object({
  portalActive: z.coerce.boolean(),
})

export const updateFormatSettingsSchema = z.object({
  format,
  formatConfig,
})

export const archiveTournamentSchema = z.object({
  confirmName: z.string().min(1),
})

export const assignDirectorSchema = z.object({
  profileId: z.string().min(1),
})

export const removeDirectorSchema = z.object({
  profileId: z.string().min(1),
  confirm: z.literal('true'),
})

export const scheduleEntrySchema = z
  .object({
    label: z.string().min(1).max(200),
    kind: z.enum(['DEADLINE', 'ROUND', 'CEREMONY', 'BREAK', 'OTHER']),
    startAt: z.coerce.date(),
    endAt: z.coerce.date().optional(),
    description: z.string().max(2000).optional().or(z.literal('')),
  })
  .refine((d) => !d.endAt || d.endAt > d.startAt, { message: 'End must be after start', path: ['endAt'] })

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>
export type UpdateTournamentBasicInput = z.infer<typeof updateTournamentBasicSchema>
export type UpdateRegistrationSettingsInput = z.infer<typeof updateRegistrationSettingsSchema>
export type UpdateFinanceSettingsInput = z.infer<typeof updateFinanceSettingsSchema>
export type UpdatePortalSettingsInput = z.infer<typeof updatePortalSettingsSchema>
export type UpdateFormatSettingsInput = z.infer<typeof updateFormatSettingsSchema>
export type ScheduleEntryInput = z.infer<typeof scheduleEntrySchema>
