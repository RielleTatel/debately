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
} as const
