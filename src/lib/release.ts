export const ATHAN_RELEASE = {
  version: String(import.meta.env.VITE_APP_VERSION || '3.2.4'),
  updatedAt: String(import.meta.env.VITE_APP_UPDATED_AT || '2026-08-05')
} as const
