export type RamadanSettings = {
  ramadanStartDate: string
  eidDate: string
  locationName?: string
}

export type RamadanFastStatus = 'fasted' | 'missed' | 'makeup' | 'not-set'

export type RamadanFastRecord = {
  date: string
  status: RamadanFastStatus
  notes: string
}

export const RAMADAN_SETTINGS_KEY = 'athan.ramadan.settings.v1'
export const RAMADAN_FASTS_KEY = 'athan.ramadan.fasts.v1'

export const DEFAULT_RAMADAN_SETTINGS: RamadanSettings = {
  ramadanStartDate: '',
  eidDate: ''
}

export function loadRamadanSettings(): RamadanSettings {
  try {
    const raw = localStorage.getItem(RAMADAN_SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_RAMADAN_SETTINGS }
    return normalizeSettings(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_RAMADAN_SETTINGS }
  }
}

export function saveRamadanSettings(settings: RamadanSettings): void {
  try {
    localStorage.setItem(RAMADAN_SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)))
  } catch {
    // Ignore storage failures.
  }
}

export function loadRamadanFastRecords(): RamadanFastRecord[] {
  try {
    const raw = localStorage.getItem(RAMADAN_FASTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalizeRecord).filter(Boolean) as RamadanFastRecord[] : []
  } catch {
    return []
  }
}

export function saveRamadanFastRecords(records: RamadanFastRecord[]): void {
  try {
    localStorage.setItem(RAMADAN_FASTS_KEY, JSON.stringify(records.map(normalizeRecord).filter(Boolean)))
  } catch {
    // Ignore storage failures.
  }
}

export function getRamadanDay(settings: RamadanSettings, date = new Date()): number | null {
  const start = parseDate(settings.ramadanStartDate)
  const eid = parseDate(settings.eidDate)
  if (!start || !eid) return null
  const today = startOfDay(date)
  if (today < start || today >= eid) return null
  return daysBetween(start, today) + 1
}

export function getDaysUntilEid(settings: RamadanSettings, date = new Date()): number | null {
  const eid = parseDate(settings.eidDate)
  if (!eid) return null
  return Math.max(0, daysBetween(startOfDay(date), eid))
}

export function getRamadanStatus(settings: RamadanSettings, date = new Date()): 'before' | 'active' | 'after' | 'not-configured' {
  const start = parseDate(settings.ramadanStartDate)
  const eid = parseDate(settings.eidDate)
  if (!start || !eid) return 'not-configured'
  const today = startOfDay(date)
  if (today < start) return 'before'
  if (today >= eid) return 'after'
  return 'active'
}

export function updateFastRecord(date: string, status: RamadanFastStatus, notes = ''): RamadanFastRecord[] {
  const records = loadRamadanFastRecords()
  const safeDate = isDateInput(date) ? date : formatDate(new Date())
  const nextRecord: RamadanFastRecord = {
    date: safeDate,
    status: normalizeStatus(status),
    notes
  }
  const exists = records.some((record) => record.date === safeDate)
  const next = exists
    ? records.map((record) => record.date === safeDate ? nextRecord : record)
    : [...records, nextRecord]
  saveRamadanFastRecords(next)
  return next
}

export function formatDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseDate(value: string): Date | null {
  if (!isDateInput(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function normalizeSettings(value: unknown): RamadanSettings {
  const maybe = value && typeof value === 'object' ? value as Partial<RamadanSettings> : {}
  return {
    ramadanStartDate: isDateInput(maybe.ramadanStartDate) ? maybe.ramadanStartDate : '',
    eidDate: isDateInput(maybe.eidDate) ? maybe.eidDate : '',
    locationName: typeof maybe.locationName === 'string' ? maybe.locationName : undefined
  }
}

function normalizeRecord(value: unknown): RamadanFastRecord | null {
  const maybe = value && typeof value === 'object' ? value as Partial<RamadanFastRecord> : {}
  if (!isDateInput(maybe.date)) return null
  return {
    date: maybe.date,
    status: normalizeStatus(maybe.status),
    notes: typeof maybe.notes === 'string' ? maybe.notes : ''
  }
}

function normalizeStatus(value: unknown): RamadanFastStatus {
  return value === 'fasted' || value === 'missed' || value === 'makeup' || value === 'not-set'
    ? value
    : 'not-set'
}

function isDateInput(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000)
}
