export const APPLICATION_TABS = {
  OPEN: 'open',
  CLOSED: 'closed',
} as const

export type ApplicationTab = (typeof APPLICATION_TABS)[keyof typeof APPLICATION_TABS]

export const isApplicationTab = (value: unknown): value is ApplicationTab =>
  value === APPLICATION_TABS.OPEN || value === APPLICATION_TABS.CLOSED

export const APP_SCOPES = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const

export type AppScope = (typeof APP_SCOPES)[keyof typeof APP_SCOPES]
