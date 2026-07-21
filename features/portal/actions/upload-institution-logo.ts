'use server'

import { prisma } from '@/lib/prisma'
import { toApi } from '@/lib/errors'
import { activityLog } from '@/services/activity-log'
import { institutionLogoStorage } from '@/services/storage'
import { requireInstitutionRep } from '@/features/portal/permissions'
import type { ApiResponse } from '@/types/api'

export async function uploadInstitutionLogoAction(
  formData: FormData,
): Promise<ApiResponse<{ logoUrl: string }>> {
  try {
    const institutionId = String(formData.get('institutionId') ?? '')
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return { ok: false, error: 'File is required', code: 'VALIDATION_ERROR' }
    }
    const { me, institution, tournament } = await requireInstitutionRep(institutionId)
    const url = await institutionLogoStorage.upload(institution.id, file)
    await prisma.tournamentInstitution.update({
      where: { id: institution.id }, data: { logoUrl: url },
    })
    await activityLog.record({
      code: 'INSTITUTION_LOGO_UPLOADED',
      tournamentId: tournament.id, actorId: me.id,
      data: { institutionId: institution.id, logoUrl: url },
    })
    return { ok: true, data: { logoUrl: url } }
  } catch (e) {
    return toApi(e)
  }
}
