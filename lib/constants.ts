export const APP_NAME = 'Debately'
export const APP_DESCRIPTION = 'Debate tournament management'

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

export const TOURNAMENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  REGISTRATION_OPEN: 'registration_open',
  REGISTRATION_CLOSED: 'registration_closed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const DEBATE_FORMATS = ['BP', 'AP', 'WSDC', 'CP', 'CUSTOM'] as const

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  tournaments: '/tournaments',
  organization: '/organization',
  account: '/account',
  settings: '/settings',
} as const
