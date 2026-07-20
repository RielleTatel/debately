import { z } from 'zod'
import { slugSchema } from '@/lib/validation'

const name = z.string().min(2).max(120)
const description = z.string().max(1000).optional().or(z.literal(''))

export const createOrganizationSchema = z.object({ name, slug: slugSchema, description })
export const updateOrganizationSchema = z.object({ name, slug: slugSchema, description })
export const transferOwnershipSchema = z.object({ toProfileId: z.string().min(1) })
export const deleteOrganizationSchema = z.object({ confirmName: z.string().min(1) })
export const removeMemberSchema = z.object({ profileId: z.string().min(1) })

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>
export type DeleteOrganizationInput = z.infer<typeof deleteOrganizationSchema>
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>
