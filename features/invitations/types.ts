export type InvitationId = string

export type CreateInvitationInput = {
  email: string
  role: string
  tournamentId?: string
}
