import { DEFAULT_IQAMA_SETTINGS, IQAMA_PRAYERS, type IqamaPrayerName, type IqamaRule } from './iqama'

export type MasjidIqamaRule = {
  mode: 'fixed' | 'offset'
  fixedTime: string
  offsetMinutes: number
}

export type MasjidJummahSlot = {
  id: string
  label: string
  khutbahTime: string
  iqamaTime: string
  notes: string
}

export type MasjidProfile = {
  id: string
  name: string
  city: string
  cityProfileId?: string
  address: string
  notes: string
  iqamaRules: Record<IqamaPrayerName, MasjidIqamaRule>
  jummahSlots: MasjidJummahSlot[]
  createdAt: string
  updatedAt: string
}

export const MASJID_PROFILES_KEY = 'athan.masjid.profiles.v1'

export function loadMasjidProfiles(): MasjidProfile[] {
  try {
    const raw = localStorage.getItem(MASJID_PROFILES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalizeMasjidProfile) : []
  } catch {
    return []
  }
}

export function saveMasjidProfiles(profiles: MasjidProfile[]): void {
  try {
    localStorage.setItem(MASJID_PROFILES_KEY, JSON.stringify(profiles.map(normalizeMasjidProfile)))
  } catch {
    // Keep the app usable if localStorage is unavailable.
  }
}

export function createMasjidProfile(): MasjidProfile {
  const now = new Date().toISOString()
  return {
    id: makeId('masjid'),
    name: '',
    city: '',
    cityProfileId: undefined,
    address: '',
    notes: '',
    iqamaRules: makeDefaultIqamaRules(),
    jummahSlots: [createJummahSlot('First Jumu’ah')],
    createdAt: now,
    updatedAt: now
  }
}

export function updateMasjidProfile(profile: MasjidProfile, profiles = loadMasjidProfiles()): MasjidProfile[] {
  const normalized = normalizeMasjidProfile({
    ...profile,
    updatedAt: new Date().toISOString()
  })
  const exists = profiles.some((item) => item.id === normalized.id)
  const next = exists
    ? profiles.map((item) => item.id === normalized.id ? normalized : item)
    : [...profiles, normalized]
  saveMasjidProfiles(next)
  return next
}

export function deleteMasjidProfile(profileId: string, profiles = loadMasjidProfiles()): MasjidProfile[] {
  const next = profiles.filter((profile) => profile.id !== profileId)
  saveMasjidProfiles(next)
  return next
}

export function createJummahSlot(label = 'Jumu’ah'): MasjidJummahSlot {
  return {
    id: makeId('jummah'),
    label,
    khutbahTime: '12:30',
    iqamaTime: '13:00',
    notes: ''
  }
}

export function iqamaRuleToMasjidRule(rule: IqamaRule): MasjidIqamaRule {
  return {
    mode: rule.mode,
    fixedTime: rule.fixedTime,
    offsetMinutes: rule.offsetMinutes
  }
}

function makeDefaultIqamaRules(): Record<IqamaPrayerName, MasjidIqamaRule> {
  const rules = {} as Record<IqamaPrayerName, MasjidIqamaRule>
  for (const prayer of IQAMA_PRAYERS) {
    rules[prayer] = iqamaRuleToMasjidRule(DEFAULT_IQAMA_SETTINGS[prayer])
  }
  return rules
}

function normalizeMasjidProfile(value: unknown): MasjidProfile {
  const maybe = value && typeof value === 'object' ? value as Partial<MasjidProfile> : {}
  const now = new Date().toISOString()
  const defaults = makeDefaultIqamaRules()
  const sourceRules = maybe.iqamaRules && typeof maybe.iqamaRules === 'object' ? maybe.iqamaRules : {}
  const iqamaRules = {} as Record<IqamaPrayerName, MasjidIqamaRule>

  for (const prayer of IQAMA_PRAYERS) {
    iqamaRules[prayer] = normalizeMasjidIqamaRule((sourceRules as Partial<Record<IqamaPrayerName, MasjidIqamaRule>>)[prayer] ?? defaults[prayer])
  }

  return {
    id: safeString(maybe.id) || makeId('masjid'),
    name: safeString(maybe.name),
    city: safeString(maybe.city),
    cityProfileId: safeString(maybe.cityProfileId) || undefined,
    address: safeString(maybe.address),
    notes: safeString(maybe.notes),
    iqamaRules,
    jummahSlots: Array.isArray(maybe.jummahSlots) ? maybe.jummahSlots.map(normalizeJummahSlot) : [],
    createdAt: safeString(maybe.createdAt) || now,
    updatedAt: safeString(maybe.updatedAt) || now
  }
}

function normalizeMasjidIqamaRule(value: unknown): MasjidIqamaRule {
  const maybe = value && typeof value === 'object' ? value as Partial<MasjidIqamaRule> : {}
  const offsetMinutes = Number(maybe.offsetMinutes)
  return {
    mode: maybe.mode === 'fixed' ? 'fixed' : 'offset',
    fixedTime: safeString(maybe.fixedTime),
    offsetMinutes: Number.isFinite(offsetMinutes) ? Math.max(0, Math.min(1440, Math.round(offsetMinutes))) : 20
  }
}

function normalizeJummahSlot(value: unknown): MasjidJummahSlot {
  const maybe = value && typeof value === 'object' ? value as Partial<MasjidJummahSlot> : {}
  return {
    id: safeString(maybe.id) || makeId('jummah'),
    label: safeString(maybe.label) || 'Jumu’ah',
    khutbahTime: safeString(maybe.khutbahTime),
    iqamaTime: safeString(maybe.iqamaTime),
    notes: safeString(maybe.notes)
  }
}

function safeString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
