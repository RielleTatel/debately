'use server'

import { prisma } from '@/lib/prisma'
import { toApi } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { requireInstitutionRep } from '@/features/portal/permissions'
import { updateInstitutionProfileSchema } from '@/features/portal/schemas'
import type { ApiResponse } from '@/types/api'

export async function updateInstitutionProfileAction(
  formData: FormData,
): Promise<ApiResponse<{ institutionId: string }>> {
  try {
    const parsed = updateInstitutionProfileSchema.parse({
      institutionId: formData.get('institutionId'),
      contactName: formData.get('contactName') ?? undefined,
      contactEmail: formData.get('contactEmail') ?? undefined,
      contactPhone: formData.get('contactPhone') ?? undefined,
    })
    const { me, institution, tournament } = await requireInstitutionRep(parsed.institutionId)
    await prisma.tournamentInstitution.update({
      where: { id: institution.id },
      data: {
        contactName: parsed.contactName ?? undefined,
        contactEmail: parsed.contactEmail ?? undefined,
        contactPhone: parsed.contactPhone ?? undefined,
      },
    })
    await activityLog.record({
      code: 'INSTITUTION_PROFILE_UPDATED',
      tournamentId: tournament.id, actorId: me.id,
      data: { institutionId: institution.id },
    })
    return { ok: true, data: { institutionId: institution.id } }
  } catch (e) {
    return toApi(e)
  }
}
