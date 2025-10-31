import * as Adhan from 'adhan'
import type { CalculationParameters, PrayerTimes } from 'adhan'

// --- Public types ---
export type MethodKey =
  | 'MuslimWorldLeague' | 'UmmAlQura' | 'Egyptian' | 'Karachi' | 'Dubai' | 'Qatar' | 'Kuwait'
  | 'MoonsightingCommittee' | 'NorthAmerica' | 'Singapore' | 'Tehran' | 'Turkey'
export type MadhabKey = 'Shafi' | 'Hanafi'
export type HighLatKey = 'MiddleOfTheNight' | 'SeventhOfTheNight' | 'TwilightAngle'

export interface PrayerSettings {
  method: MethodKey
  madhab: MadhabKey
  highLatRule: HighLatKey
}

const DEFAULTS: PrayerSettings = {
  method: 'MuslimWorldLeague',
  madhab: 'Shafi',
  highLatRule: 'MiddleOfTheNight'
}

const KEYS = {
  method: 'method',
  madhab: 'madhab',
  highLatRule: 'highLatRule'
} as const

// --- Settings helpers (exported) ---
export function loadSettings(): PrayerSettings {
  return {
    method: (localStorage.getItem(KEYS.method) as MethodKey) || DEFAULTS.method,
    madhab: (localStorage.getItem(KEYS.madhab) as MadhabKey) || DEFAULTS.madhab,
    highLatRule: (localStorage.getItem(KEYS.highLatRule) as HighLatKey) || DEFAULTS.highLatRule
  }
}

export function saveSettings(s: PrayerSettings): void {
  localStorage.setItem(KEYS.method, s.method)
  localStorage.setItem(KEYS.madhab, s.madhab)
  localStorage.setItem(KEYS.highLatRule, s.highLatRule)
}

// --- Internal mappers ---
function methodParams(method: MethodKey): CalculationParameters {
  switch (method) {
    case 'MuslimWorldLeague': return Adhan.CalculationMethod.MuslimWorldLeague()
    case 'UmmAlQura': return Adhan.CalculationMethod.UmmAlQura()
    case 'Egyptian': return Adhan.CalculationMethod.Egyptian()
    case 'Karachi': return Adhan.CalculationMethod.Karachi()
    case 'Dubai': return Adhan.CalculationMethod.Dubai()
    case 'Qatar': return Adhan.CalculationMethod.Qatar()
    case 'Kuwait': return Adhan.CalculationMethod.Kuwait()
    case 'MoonsightingCommittee': return Adhan.CalculationMethod.MoonsightingCommittee()
    case 'NorthAmerica': return Adhan.CalculationMethod.NorthAmerica()
    case 'Singapore': return Adhan.CalculationMethod.Singapore()
    case 'Tehran': return Adhan.CalculationMethod.Tehran()
    case 'Turkey': return Adhan.CalculationMethod.Turkey()
  }
}

function mapMadhab(k: MadhabKey) {
  return k === 'Hanafi' ? Adhan.Madhab.Hanafi : Adhan.Madhab.Shafi
}

function mapHighLat(k: HighLatKey) {
  switch (k) {
    case 'SeventhOfTheNight': return Adhan.HighLatitudeRule.SeventhOfTheNight
    case 'TwilightAngle': return Adhan.HighLatitudeRule.TwilightAngle
    default: return Adhan.HighLatitudeRule.MiddleOfTheNight
  }
}

// --- Core helpers (exported) ---
export function computePrayerTimes(
  coords: { latitude: number; longitude: number },
  date = new Date(),
  settings: PrayerSettings = loadSettings()
): PrayerTimes {
  const params = methodParams(settings.method)
  params.madhab = mapMadhab(settings.madhab)
  params.highLatitudeRule = mapHighLat(settings.highLatRule)
  return new Adhan.PrayerTimes(new Adhan.Coordinates(coords.latitude, coords.longitude), date, params)
}

export function nextPrayer(prayerTimes: PrayerTimes): { name: string; time: Date } {
  const now = new Date()
  type PTMap = Pick<PrayerTimes, 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'>
  const pt = prayerTimes as PTMap
  const order: (keyof PTMap)[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
  for (const p of order) {
    const t = pt[p]
    if (now < t) return { name: p, time: t }
  }
  // next day fajr
  return { name: 'fajr', time: new Date(pt.fajr.getTime() + 24 * 60 * 60 * 1000) }
}
