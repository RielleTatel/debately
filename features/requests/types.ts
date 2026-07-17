export type RequestType = 'team_registration' | 'participant_registration' | 'adjudicator_registration' | 'custom'
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted'

export type CreateRequestInput = {
  tournamentId: string
  requesterEmail: string
  type: RequestType
  notes?: string
}
