import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const getFilledTeamSlots = cache((tournamentId: string) =>
  prisma.team.count({ where: { institution: { tournamentId } } }),
)
