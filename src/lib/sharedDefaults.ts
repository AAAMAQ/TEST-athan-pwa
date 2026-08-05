import { isAppLanguage, loadLanguage, saveLanguage, type AppLanguage } from './i18n'
import {
  isTimeFormatPreference,
  loadShowSunnah,
  loadTimeFormatPreference,
  saveShowSunnah,
  saveTimeFormatPreference,
  type TimeFormatPreference
} from './preferences'
import {
  loadSettings,
  saveSettings,
  type HighLatKey,
  type MadhabKey,
  type MethodKey,
  type PrayerSettings
} from './prayer'

const SHARE_HASH_PREFIX = '#share-defaults='
const CALCULATION_MODE_KEY = 'athan.prayer.calculationMode.v1'
const REMINDER_OFFSET_KEY = 'reminderOffsetMin'
const ISHA_FIXED_KEY = 'ishaFixedTime'

const METHODS: MethodKey[] = ['MuslimWorldLeague', 'UmmAlQura', 'Egyptian', 'Karachi', 'Dubai', 'Qatar', 'Kuwait', 'MoonsightingCommittee', 'NorthAmerica', 'Singapore', 'Tehran', 'Turkey']
const MADHABS: MadhabKey[] = ['Shafi', 'Hanafi']
const HIGH_LAT_RULES: HighLatKey[] = ['MiddleOfTheNight', 'SeventhOfTheNight', 'TwilightAngle']

export type SharedDefaults = {
  app: 'Athan PWA defaults'
  version: 1
  prayer: PrayerSettings
  preferences: {
    language: AppLanguage
    timeFormat: TimeFormatPreference
    showSunnah: boolean
  }
  reminders: {
    offsetMinutes: number
    fixedIshaTime: string
  }
}

export function createSharedDefaults(): SharedDefaults {
  return {
    app: 'Athan PWA defaults',
    version: 1,
    prayer: loadSettings(),
    preferences: {
      language: loadLanguage(),
      timeFormat: loadTimeFormatPreference(),
      showSunnah: loadShowSunnah()
    },
    reminders: {
      offsetMinutes: readReminderOffset(),
      fixedIshaTime: readFixedIshaTime()
    }
  }
}

export function createSharedDefaultsUrl(baseUrl: string): string {
  const url = new URL(baseUrl)
  url.hash = `${SHARE_HASH_PREFIX.slice(1)}${encodePayload(createSharedDefaults())}`
  return url.toString()
}

export function parseSharedDefaultsUrl(urlValue: string): SharedDefaults | null {
  try {
    const url = new URL(urlValue)
    if (!url.hash.startsWith(SHARE_HASH_PREFIX)) return null
    return normalizeSharedDefaults(JSON.parse(decodePayload(url.hash.slice(SHARE_HASH_PREFIX.length))))
  } catch {
    return null
  }
}

export function applySharedDefaults(defaults: SharedDefaults): void {
  const safe = normalizeSharedDefaults(defaults)
  if (!safe) throw new Error('These shared defaults are invalid or unsupported.')

  saveSettings(safe.prayer)
  saveLanguage(safe.preferences.language)
  saveTimeFormatPreference(safe.preferences.timeFormat)
  saveShowSunnah(safe.preferences.showSunnah)
  localStorage.setItem(CALCULATION_MODE_KEY, 'manual')
  localStorage.setItem(REMINDER_OFFSET_KEY, String(safe.reminders.offsetMinutes))
  localStorage.setItem(ISHA_FIXED_KEY, safe.reminders.fixedIshaTime)
}

export function clearSharedDefaultsHash(): void {
  if (typeof window === 'undefined' || !window.location.hash.startsWith(SHARE_HASH_PREFIX)) return
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
}

function normalizeSharedDefaults(value: unknown): SharedDefaults | null {
  if (!value || typeof value !== 'object') return null
  const maybe = value as Partial<SharedDefaults>
  const prayer = maybe.prayer
  const preferences = maybe.preferences
  const reminders = maybe.reminders
  if (
    maybe.app !== 'Athan PWA defaults' || maybe.version !== 1 ||
    !prayer || !METHODS.includes(prayer.method) || !MADHABS.includes(prayer.madhab) || !HIGH_LAT_RULES.includes(prayer.highLatRule) ||
    !preferences || !isAppLanguage(preferences.language) || !isTimeFormatPreference(preferences.timeFormat) || typeof preferences.showSunnah !== 'boolean' ||
    !reminders || !Number.isInteger(reminders.offsetMinutes) || reminders.offsetMinutes < 1 || reminders.offsetMinutes > 180 ||
    typeof reminders.fixedIshaTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminders.fixedIshaTime)
  ) return null

  return {
    app: 'Athan PWA defaults',
    version: 1,
    prayer: { ...prayer },
    preferences: { ...preferences },
    reminders: { ...reminders }
  }
}

function readReminderOffset(): number {
  const value = Number.parseInt(localStorage.getItem(REMINDER_OFFSET_KEY) || '20', 10)
  return Number.isInteger(value) ? Math.min(180, Math.max(1, value)) : 20
}

function readFixedIshaTime(): string {
  const value = localStorage.getItem(ISHA_FIXED_KEY) || '22:00'
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : '22:00'
}

function encodePayload(value: SharedDefaults): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodePayload(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  return atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
}
