import type { MadhabKey } from './prayer'

export type ManualPrayerTimetableRow = {
  fajr: string
  sunrise: string
  dhuhr: string
  asr?: string
  asrShafi?: string
  asrHanafi?: string
  maghrib: string
  isha?: string
  ishaShafi?: string
  ishaHanafi?: string
}

export type ManualPrayerTimetable = {
  formatVersion: 1
  sourceFileName: string
  sourceSheetName: string
  sourceLocation?: string
  sourceLatitude?: number
  sourceLongitude?: number
  importedAt: string
  rowCount: number
  rows: Record<string, ManualPrayerTimetableRow>
}

export type ManualPrayerTimes = {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

const MAX_WORKBOOK_BYTES = 5 * 1024 * 1024
const MIN_YEAR_ROWS = 300

export async function parseManualPrayerTimetableFile(file: File): Promise<ManualPrayerTimetable> {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    throw new Error('Choose an Excel .xlsx file.')
  }
  if (file.size > MAX_WORKBOOK_BYTES) {
    throw new Error('The Excel file is larger than 5 MB.')
  }

  const XLSX = await import('@e965/xlsx')
  const workbook = XLSX.read(await readFileArrayBuffer(file), {
    type: 'array',
    cellDates: true
  })

  const candidateSheets = [
    ...workbook.SheetNames.filter((name) => normalizeHeader(name) === 'alldays'),
    ...workbook.SheetNames.filter((name) => normalizeHeader(name) !== 'alldays')
  ]

  for (const sheetName of candidateSheets) {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: true,
      defval: ''
    })
    const parsed = parseSheetRows(rows)
    if (!parsed || Object.keys(parsed.rows).length < MIN_YEAR_ROWS) continue

    const sourceCoordinates = parseCoordinatesMetadata(findMetadataValue(rows, 'coordinates'))
    return {
      formatVersion: 1,
      sourceFileName: file.name,
      sourceSheetName: sheetName,
      sourceLocation: findMetadataValue(rows, 'location'),
      sourceLatitude: sourceCoordinates?.latitude,
      sourceLongitude: sourceCoordinates?.longitude,
      importedAt: new Date().toISOString(),
      rowCount: Object.keys(parsed.rows).length,
      rows: parsed.rows
    }
  }

  throw new Error(
    'No complete yearly prayer timetable was found. Include at least 300 dated rows with Fajr, Sunrise, Dhuhr/Zuhar, Asr, Maghrib, and Isha.'
  )
}

function readFileArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') return file.arrayBuffer()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result)
      else reject(new Error('The Excel file could not be read.'))
    }
    reader.onerror = () => reject(new Error('The Excel file could not be read.'))
    reader.readAsArrayBuffer(file)
  })
}

export function getManualPrayerTimes(
  timetable: ManualPrayerTimetable | undefined,
  date: Date,
  madhab: MadhabKey
): ManualPrayerTimes | null {
  if (!timetable) return null
  const row = timetable.rows[monthDayKey(date)]
  if (!row) return null

  const asr = madhab === 'Hanafi'
    ? row.asrHanafi || row.asr || row.asrShafi
    : row.asrShafi || row.asr || row.asrHanafi
  const isha = madhab === 'Hanafi'
    ? row.ishaHanafi || row.isha || row.ishaShafi
    : row.ishaShafi || row.isha || row.ishaHanafi
  if (!asr || !isha) return null

  return {
    fajr: dateAtTime(date, row.fajr),
    sunrise: dateAtTime(date, row.sunrise),
    dhuhr: dateAtTime(date, row.dhuhr),
    asr: dateAtTime(date, asr),
    maghrib: dateAtTime(date, row.maghrib),
    isha: dateAtTime(date, isha)
  }
}

export function normalizeManualPrayerTimetable(value: unknown): ManualPrayerTimetable | undefined {
  const maybe = value && typeof value === 'object' ? value as Partial<ManualPrayerTimetable> : null
  if (!maybe || !maybe.rows || typeof maybe.rows !== 'object') return undefined

  const rows: Record<string, ManualPrayerTimetableRow> = {}
  for (const [key, valueRow] of Object.entries(maybe.rows)) {
    if (!/^\d{2}-\d{2}$/.test(key)) continue
    const normalized = normalizeStoredRow(valueRow)
    if (normalized) rows[key] = normalized
  }
  const rowCount = Object.keys(rows).length
  if (rowCount < MIN_YEAR_ROWS) return undefined

  return {
    formatVersion: 1,
    sourceFileName: safeString(maybe.sourceFileName) || 'Imported timetable.xlsx',
    sourceSheetName: safeString(maybe.sourceSheetName) || 'Prayer Times',
    sourceLocation: safeString(maybe.sourceLocation) || undefined,
    sourceLatitude: finiteNumber(maybe.sourceLatitude),
    sourceLongitude: finiteNumber(maybe.sourceLongitude),
    importedAt: safeString(maybe.importedAt) || new Date().toISOString(),
    rowCount,
    rows
  }
}

function parseSheetRows(rows: unknown[][]) {
  const headerIndex = rows.findIndex((row) => isPrayerHeaderRow(row))
  if (headerIndex < 0) return null

  const headers = rows[headerIndex].map((value) => normalizeHeader(value))
  const dateIndex = findHeader(headers, ['date'])
  const monthIndex = findHeader(headers, ['monthnumber', 'month'])
  const dayIndex = findHeader(headers, ['day', 'dateofmonth'])
  const fajrIndex = findHeader(headers, ['fajr'])
  const sunriseIndex = findHeader(headers, ['sunrise', 'shuruq', 'ishraq'])
  const dhuhrIndex = findHeader(headers, ['dhuhr', 'zuhr', 'zuhar'])
  const asrIndex = findHeader(headers, ['asr'])
  const asrShafiIndex = findHeader(headers, ['asrshafi', 'asarshafi'])
  const asrHanafiIndex = findHeader(headers, ['asrhanafi', 'asarhanafi'])
  const maghribIndex = findHeader(headers, ['maghrib'])
  const ishaIndex = findHeader(headers, ['isha'])
  const ishaShafiIndex = findHeader(headers, ['ishashafi'])
  const ishaHanafiIndex = findHeader(headers, ['ishahanafi'])

  const hasDate = dateIndex >= 0 || (monthIndex >= 0 && dayIndex >= 0)
  const hasAsr = asrIndex >= 0 || asrShafiIndex >= 0 || asrHanafiIndex >= 0
  const hasIsha = ishaIndex >= 0 || ishaShafiIndex >= 0 || ishaHanafiIndex >= 0
  if (!hasDate || [fajrIndex, sunriseIndex, dhuhrIndex, maghribIndex].some((index) => index < 0) || !hasAsr || !hasIsha) {
    return null
  }

  const normalizedRows: Record<string, ManualPrayerTimetableRow> = {}
  for (const sourceRow of rows.slice(headerIndex + 1)) {
    const dateKey = dateIndex >= 0
      ? parseDateKey(sourceRow[dateIndex])
      : parseMonthDayKey(sourceRow[monthIndex], sourceRow[dayIndex])
    if (!dateKey) continue

    const row = normalizeImportedRow({
      fajr: sourceRow[fajrIndex],
      sunrise: sourceRow[sunriseIndex],
      dhuhr: sourceRow[dhuhrIndex],
      asr: asrIndex >= 0 ? sourceRow[asrIndex] : undefined,
      asrShafi: asrShafiIndex >= 0 ? sourceRow[asrShafiIndex] : undefined,
      asrHanafi: asrHanafiIndex >= 0 ? sourceRow[asrHanafiIndex] : undefined,
      maghrib: sourceRow[maghribIndex],
      isha: ishaIndex >= 0 ? sourceRow[ishaIndex] : undefined,
      ishaShafi: ishaShafiIndex >= 0 ? sourceRow[ishaShafiIndex] : undefined,
      ishaHanafi: ishaHanafiIndex >= 0 ? sourceRow[ishaHanafiIndex] : undefined
    })
    if (row) normalizedRows[dateKey] = row
  }

  return { rows: normalizedRows }
}

function normalizeImportedRow(value: Record<keyof ManualPrayerTimetableRow, unknown>): ManualPrayerTimetableRow | null {
  const row: ManualPrayerTimetableRow = {
    fajr: parseTime(value.fajr),
    sunrise: parseTime(value.sunrise),
    dhuhr: parseTime(value.dhuhr),
    asr: parseOptionalTime(value.asr),
    asrShafi: parseOptionalTime(value.asrShafi),
    asrHanafi: parseOptionalTime(value.asrHanafi),
    maghrib: parseTime(value.maghrib),
    isha: parseOptionalTime(value.isha),
    ishaShafi: parseOptionalTime(value.ishaShafi),
    ishaHanafi: parseOptionalTime(value.ishaHanafi)
  }
  if (!row.fajr || !row.sunrise || !row.dhuhr || !row.maghrib) return null
  if (!(row.asr || row.asrShafi || row.asrHanafi) || !(row.isha || row.ishaShafi || row.ishaHanafi)) return null
  return row
}

function normalizeStoredRow(value: unknown): ManualPrayerTimetableRow | null {
  const maybe = value && typeof value === 'object' ? value as Partial<ManualPrayerTimetableRow> : {}
  return normalizeImportedRow({
    fajr: maybe.fajr,
    sunrise: maybe.sunrise,
    dhuhr: maybe.dhuhr,
    asr: maybe.asr,
    asrShafi: maybe.asrShafi,
    asrHanafi: maybe.asrHanafi,
    maghrib: maybe.maghrib,
    isha: maybe.isha,
    ishaShafi: maybe.ishaShafi,
    ishaHanafi: maybe.ishaHanafi
  })
}

function isPrayerHeaderRow(row: unknown[]) {
  const headers = row.map((value) => normalizeHeader(value))
  return headers.includes('fajr')
    && headers.some((value) => ['dhuhr', 'zuhr', 'zuhar'].includes(value))
    && headers.includes('maghrib')
}

function findHeader(headers: string[], aliases: string[]) {
  return headers.findIndex((header) => aliases.includes(header))
}

function normalizeHeader(value: unknown) {
  return safeString(value).toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function findMetadataValue(rows: unknown[][], label: string) {
  const target = normalizeHeader(label)
  for (const row of rows.slice(0, 12)) {
    if (normalizeHeader(row[0]) === target) return safeString(row[1]) || undefined
  }
  return undefined
}

function parseCoordinatesMetadata(value: string | undefined) {
  if (!value) return null
  const latitude = value.match(/latitude\s+(?:north|south)?\s*(-?\d+(?:\.\d+)?)/i)
  const longitude = value.match(/longitude\s+(?:east|west)?\s*(-?\d+(?:\.\d+)?)/i)
  if (!latitude || !longitude) return null
  const latitudeValue = Number(latitude[1]) * (/latitude\s+south/i.test(value) ? -1 : 1)
  const longitudeValue = Number(longitude[1]) * (/longitude\s+west/i.test(value) ? -1 : 1)
  if (!Number.isFinite(latitudeValue) || !Number.isFinite(longitudeValue)) return null
  return { latitude: latitudeValue, longitude: longitudeValue }
}

function parseDateKey(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return monthDayKey(value)
  const text = safeString(value).trim()
  const iso = text.match(/^\d{4}-(\d{1,2})-(\d{1,2})/)
  if (iso) return validMonthDay(Number(iso[1]), Number(iso[2]))
  const slash = text.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-]\d{2,4})?$/)
  if (slash) return validMonthDay(Number(slash[1]), Number(slash[2]))
  return null
}

function parseMonthDayKey(monthValue: unknown, dayValue: unknown) {
  const numericMonth = Number(monthValue)
  const month = Number.isFinite(numericMonth) && numericMonth >= 1 && numericMonth <= 12
    ? numericMonth
    : monthNameToNumber(safeString(monthValue))
  return validMonthDay(month, Number(dayValue))
}

function validMonthDay(month: number, day: number) {
  if (!Number.isInteger(month) || !Number.isInteger(day)) return null
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const check = new Date(2024, month - 1, day)
  if (check.getMonth() !== month - 1 || check.getDate() !== day) return null
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function monthNameToNumber(value: string) {
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  return months.indexOf(value.toLowerCase().trim()) + 1
}

function parseOptionalTime(value: unknown) {
  const parsed = parseTime(value)
  return parsed || undefined
}

function parseTime(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
  }
  if (typeof value === 'number' && value >= 0 && value < 1) {
    return minutesToTime(Math.round(value * 24 * 60))
  }

  const text = safeString(value).trim()
  const match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i)
  if (!match) return ''
  let hour = Number(match[1])
  const minute = Number(match[2])
  const period = match[3]?.toUpperCase()
  if (minute > 59 || hour > (period ? 12 : 23) || hour < (period ? 1 : 0)) return ''
  if (period === 'PM' && hour < 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0
  return minutesToTime(hour * 60 + minute)
}

function minutesToTime(total: number) {
  const normalized = ((total % 1440) + 1440) % 1440
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`
}

function dateAtTime(date: Date, value: string) {
  const [hour, minute] = value.split(':').map(Number)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0)
}

function monthDayKey(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function safeString(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

function finiteNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}
