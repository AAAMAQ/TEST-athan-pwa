export type PrayerCorrectionKey = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

export type PrayerTimeCorrections = Record<PrayerCorrectionKey, number>

export type CustomPrayerProfile = {
  id: string
  name: string
  scope: 'saved-city' | 'country' | 'global'
  cityId?: string
  countryCode?: string
  corrections: PrayerTimeCorrections
  notes?: string
  createdAt: string
  updatedAt: string
}

export const PRAYER_CORRECTION_KEYS: PrayerCorrectionKey[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
export const CUSTOM_PROFILES_KEY = 'athan.prayer.customProfiles.v1'

export const DEFAULT_PRAYER_CORRECTIONS: PrayerTimeCorrections = {
  Fajr: 0,
  Sunrise: 0,
  Dhuhr: 0,
  Asr: 0,
  Maghrib: 0,
  Isha: 0
}

export function normalizeCorrectionMinutes(value: unknown): number {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(-180, Math.min(180, Math.round(number))) : 0
}

export function formatSignedCorrection(value: unknown): string {
  const minutes = normalizeCorrectionMinutes(value)
  return minutes > 0 ? `+${minutes}` : String(minutes)
}

export function loadCustomPrayerProfiles(): CustomPrayerProfile[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROFILES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalizeProfile).filter(Boolean) as CustomPrayerProfile[] : []
  } catch {
    return []
  }
}

export function saveCustomPrayerProfiles(profiles: CustomPrayerProfile[]): void {
  try {
    localStorage.setItem(CUSTOM_PROFILES_KEY, JSON.stringify(profiles.map(normalizeProfile).filter(Boolean)))
  } catch {
    // Ignore storage failures.
  }
}

export function createCustomPrayerProfile(input: Omit<CustomPrayerProfile, 'id' | 'createdAt' | 'updatedAt'>): CustomPrayerProfile {
  const now = new Date().toISOString()
  return {
    ...input,
    id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    corrections: normalizeCorrections(input.corrections),
    createdAt: now,
    updatedAt: now
  }
}

type PrayerDateLike = {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

export function applyCorrections<T extends PrayerDateLike>(times: T, corrections: Partial<PrayerTimeCorrections> | undefined): T {
  if (!corrections) return times
  const next = { ...times }
  const map: Record<PrayerCorrectionKey, keyof PrayerDateLike> = {
    Fajr: 'fajr',
    Sunrise: 'sunrise',
    Dhuhr: 'dhuhr',
    Asr: 'asr',
    Maghrib: 'maghrib',
    Isha: 'isha'
  }

  for (const key of PRAYER_CORRECTION_KEYS) {
    const target = map[key] as keyof T
    const value = next[target]
    const minutes = corrections[key] ?? 0
    if (value instanceof Date && minutes !== 0) {
      next[target] = new Date(value.getTime() + minutes * 60_000) as T[keyof T]
    }
  }
  return next
}

export function normalizeCorrections(value: unknown): PrayerTimeCorrections {
  const maybe = value && typeof value === 'object' ? value as Partial<PrayerTimeCorrections> : {}
  const result = { ...DEFAULT_PRAYER_CORRECTIONS }
  for (const key of PRAYER_CORRECTION_KEYS) {
    result[key] = normalizeCorrectionMinutes(maybe[key])
  }
  return result
}

function normalizeProfile(value: unknown): CustomPrayerProfile | null {
  const maybe = value && typeof value === 'object' ? value as Partial<CustomPrayerProfile> : null
  if (!maybe) return null
  const now = new Date().toISOString()
  return {
    id: typeof maybe.id === 'string' ? maybe.id : `profile-${Date.now()}`,
    name: typeof maybe.name === 'string' ? maybe.name : 'Personal Custom Profile',
    scope: maybe.scope === 'country' || maybe.scope === 'global' ? maybe.scope : 'saved-city',
    cityId: typeof maybe.cityId === 'string' ? maybe.cityId : undefined,
    countryCode: typeof maybe.countryCode === 'string' ? maybe.countryCode : undefined,
    corrections: normalizeCorrections(maybe.corrections),
    notes: typeof maybe.notes === 'string' ? maybe.notes : undefined,
    createdAt: typeof maybe.createdAt === 'string' ? maybe.createdAt : now,
    updatedAt: typeof maybe.updatedAt === 'string' ? maybe.updatedAt : now
  }
}
