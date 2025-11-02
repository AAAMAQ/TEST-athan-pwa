// src/types/nav.ts
// Single source of truth for navigation tabs and screen names

export const PRIMARY_TABS = ['Home', 'Prayer', 'Settings'] as const
export type Tab = typeof PRIMARY_TABS[number]

export type Screen =
  | 'Home'
  | 'Prayer'
  | 'Settings'
  | 'Qibla'
  | 'Quran'
  | 'Credits'
  | 'Privacy'
  | 'Vision'
  | 'NeedHelp'
  | 'SalahTracker'
  | 'PrayerMonth'