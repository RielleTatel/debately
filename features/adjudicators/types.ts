export type AdjudicatorId = string

export type RegisterAdjudicatorInput = {
  userId: string
  tournamentId: string
  score?: number
}
