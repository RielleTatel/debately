// Re-export Prisma-generated types once `prisma generate` has been run.
// Until then, these manual stubs satisfy imports.

export type Tournament = {
  id: string
  name: string
  slug: string
  format: string
  status: string
  organizationId: string
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export type Organization = {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export type Team = {
  id: string
  name: string
  tournamentId: string
  institutionId: string | null
  createdAt: Date
  updatedAt: Date
}

export type Participant = {
  id: string
  userId: string
  tournamentId: string
  teamId: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}
