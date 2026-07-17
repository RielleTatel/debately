import { tournamentRepository } from '@/features/tournaments/repositories'
import { Errors } from '@/lib/errors'
import type { CreateTournamentInput, UpdateTournamentInput } from '@/features/tournaments/types'

export const tournamentService = {
  async list(organizationId: string) {
    return tournamentRepository.findAll(organizationId)
  },

  async getById(id: string) {
    const tournament = await tournamentRepository.findById(id)
    if (!tournament) throw Errors.notFound('Tournament')
    return tournament
  },

  async create(input: CreateTournamentInput) {
    return tournamentRepository.create(input)
  },

  async update(input: UpdateTournamentInput) {
    await tournamentService.getById(input.id)
    return tournamentRepository.update(input)
  },

  async delete(id: string) {
    await tournamentService.getById(id)
    return tournamentRepository.delete(id)
  },
}
