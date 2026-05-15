export const APP_NAME = 'Data Center Intelligence'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
export const PUBLIC_API_BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'

export const USER_ROLES = {
  VIEW_ONLY: 'view-only',
  DOWNLOAD: 'download'
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  EXPLORER: '/home',
  COMPANIES: '/companies',
  IT_LOAD: '/it-load',
  ANALYTICS: '/analytics',
  NEWS: '/news',
  REPORTS: '/reports',
  PROFILE: '/profile',
  ASSET_DETAIL: '/asset',
  MYRA: '/dcx-ai'
} as const

export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel'
} as const

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
