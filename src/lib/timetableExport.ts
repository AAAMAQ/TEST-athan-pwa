import { computePrayerTimes, type PrayerSettings } from './prayer'
import { PRAYER_CORRECTION_KEYS, applyCorrections, formatSignedCorrection, type PrayerTimeCorrections } from './prayerCorrections'
import { formatAppTime } from './preferences'

export type TimetableRow = {
  date: string
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

export type TimetableOptions = {
  locationName: string
  coords: { latitude: number; longitude: number }
  fromDate: Date
  toDate: Date
  settings: PrayerSettings
  corrections?: PrayerTimeCorrections
  prayerTimesForDate?: (date: Date) => {
    fajr: Date
    sunrise: Date
    dhuhr: Date
    asr: Date
    maghrib: Date
    isha: Date
  }
  sourceDescription?: string
}

export function getTimetableRows(options: TimetableOptions): TimetableRow[] {
  const rows: TimetableRow[] = []
  const current = startOfDay(options.fromDate)
  const end = startOfDay(options.toDate)
  while (current <= end) {
    const times = options.prayerTimesForDate
      ? options.prayerTimesForDate(current)
      : applyCorrections(computePrayerTimes(options.coords, current, options.settings), options.corrections)
    rows.push({
      date: formatDate(current),
      Fajr: formatTime(times.fajr),
      Sunrise: formatTime(times.sunrise),
      Dhuhr: formatTime(times.dhuhr),
      Asr: formatTime(times.asr),
      Maghrib: formatTime(times.maghrib),
      Isha: formatTime(times.isha)
    })
    current.setDate(current.getDate() + 1)
  }
  return rows
}

export function buildTimetableText(options: TimetableOptions): string {
  const rows = getTimetableRows(options)
  const correctionSummary = options.corrections
    ? PRAYER_CORRECTION_KEYS.map((prayer) => `${prayer} ${formatSignedCorrection(options.corrections?.[prayer])}`).join(', ')
    : 'None'
  return [
    'Athan PWA Prayer Timetable',
    `Location: ${options.locationName}`,
    `Date range: ${formatDate(options.fromDate)} to ${formatDate(options.toDate)}`,
    `Source: ${options.sourceDescription || options.settings.method}`,
    `Madhab: ${options.settings.madhab}`,
    `High latitude rule: ${options.settings.highLatRule}`,
    `Corrections (minutes): ${correctionSummary}`,
    '',
    ...rows.map((row) => `${row.date} Fajr: ${row.Fajr} Sunrise: ${row.Sunrise} Dhuhr: ${row.Dhuhr} Asr: ${row.Asr} Maghrib: ${row.Maghrib} Isha: ${row.Isha}`)
  ].join('\n')
}

export function buildTimetableCsv(options: TimetableOptions): string {
  const rows = getTimetableRows(options)
  return [
    'Date,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha',
    ...rows.map((row) => [row.date, row.Fajr, row.Sunrise, row.Dhuhr, row.Asr, row.Maghrib, row.Isha].map(csvCell).join(','))
  ].join('\n')
}

export function downloadTextFile(filename: string, text: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function shareTimetable(text: string) {
  if (navigator.share) {
    await navigator.share({ title: 'Athan PWA Prayer Timetable', text })
    return 'Shared timetable.'
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    return 'Copied timetable to clipboard.'
  }
  return 'Sharing is not supported in this browser.'
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatTime(date: Date) {
  return formatAppTime(date, { hour: '2-digit' })
}
