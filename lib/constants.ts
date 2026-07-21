export const APP_NAME = 'Debately'
export const APP_DESCRIPTION = 'Debate tournament management'

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  tournaments: '/tournaments',
  organization: '/organization',
  account: '/account',
  settings: '/settings',
  tournamentSettings: (id: string) => `/tournaments/${id}/settings`,
  tournamentDashboard: (id: string) => `/tournaments/${id}`,
  imports: (tournamentId: string) => `/tournaments/${tournamentId}/imports`,
  importMapping: (tournamentId: string, importId: string) => `/tournaments/${tournamentId}/imports/${importId}/mapping`,
  importReview: (tournamentId: string, importId: string) => `/tournaments/${tournamentId}/imports/${importId}/review`,
  importSummary: (tournamentId: string, importId: string) => `/tournaments/${tournamentId}/imports/${importId}/summary`,
  expectations: (tournamentId: string) => `/tournaments/${tournamentId}/expectations`,
} as const
