import { PrismaClient } from '@prisma/client'
import type { CreateTournamentInput, UpdateTournamentInput } from '@/features/tournaments/types'

const prisma = new PrismaClient()

export const tournamentRepository = {
  async findAll(organizationId: string) {
    return prisma.tournament.findMany({
      where: { organizationId },
      orderBy: { startDate: 'desc' },
    })
  },

  async findById(id: string) {
    return prisma.tournament.findUnique({ where: { id } })
  },

  async findBySlug(slug: string) {
    return prisma.tournament.findUnique({ where: { slug } })
  },

  async create(data: CreateTournamentInput) {
    return prisma.tournament.create({
      data: {
        ...data,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
    })
  },

  async update({ id, ...data }: UpdateTournamentInput) {
    return prisma.tournament.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.tournament.delete({ where: { id } })
  },
}
