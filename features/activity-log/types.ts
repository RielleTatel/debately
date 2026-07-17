export type ActivityLogEntry = {
  id: string
  tournamentId: string | null
  actorId: string | null
  action: string
  resourceType: string
  resourceId: string | null
  metadata: Record<string, unknown> | null
  createdAt: Date
}

export type LogActivity = {
  tournamentId?: string
  actorId?: string
  action: string
  resourceType: string
  resourceId?: string
  metadata?: Record<string, unknown>
}
