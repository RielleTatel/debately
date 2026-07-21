import type {
  Tournament,
  TournamentDirector,
  TournamentScheduleEntry,
  TournamentStatus,
  DebateFormat,
  ScheduleEntryKind,
  Organization,
} from '@prisma/client'

export type {
  Tournament,
  TournamentDirector,
  TournamentScheduleEntry,
  TournamentStatus,
  DebateFormat,
  ScheduleEntryKind,
}

export type TournamentId = string

export type FeeLine = {
  label: string
  amount: number
  unit: 'per_team' | 'per_adjudicator' | 'flat'
}

export type FeeStructure = {
  kind: 'none' | 'itemized'
  lines: FeeLine[]
}

export type FormatConfig = {
  speakerCount: number
  customEligibility: string
}

export type TournamentContext = {
  tournament: Tournament
  org: Organization
  role: 'OWNER' | 'MEMBER'
  isDirector: boolean
}

export type DirectorWithProfile = TournamentDirector & {
  profile: { id: string; displayName: string; avatarUrl: string | null }
}

export type TournamentListItem = Pick<
  Tournament,
  'id' | 'name' | 'slug' | 'status' | 'startDate' | 'endDate' | 'logoUrl'
> & { orgSlug: string; orgName: string }
