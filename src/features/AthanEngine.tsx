// src/features/AthanEngine.tsx

import { useState } from 'react'

type Props = {
  go?: (screen: string) => void
}

type EngineMethod =
  | 'MWL'
  | 'UmmAlQura'
  | 'Egypt'
  | 'Karachi/India'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'Moonsighting'
  | 'ISNA'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey'

type EngineMadhab = 'Shafi' | 'Hanafi'

type EngineLocation = {
  label: string
  latitude: number
  longitude: number
  timezone?: string
  offsetLabel?: string
}

type EnginePrayerRow = {
  date: string
  displayDate: string
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

type TimeFormat = '24h' | '12h'

const METHOD_OPTIONS: { value: EngineMethod; label: string }[] = [
  { value: 'MWL', label: 'Muslim World League' },
  { value: 'UmmAlQura', label: 'Umm Al-Qura' },
  { value: 'Egypt', label: 'Egyptian General Authority' },
  { value: 'Karachi/India', label: 'University of Islamic Sciences, Karachi/India' },
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Moonsighting', label: 'Moonsighting Committee' },
  { value: 'ISNA', label: 'ISNA' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Tehran', label: 'Tehran' },
  { value: 'Turkey', label: 'Turkey' }
]

const REMINDER_OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60]

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback
}

function formatEngineTime(value: string, format: TimeFormat) {
  const trimmed = value.trim()
  if (format === '24h') return trimmed

  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return trimmed

  let hour = Number(match[1])
  const minute = match[2]
  const period = hour >= 12 ? 'PM' : 'AM'

  hour = hour % 12
  if (hour === 0) hour = 12

  return `${hour}:${minute} ${period}`
}

async function loadEngine() {
  const engine = await import('../lib/engine')
  const module = engine as Record<string, unknown>

  const resolveLocation = module.resolveEngineLocation || module.resolveLocation || module.geocodeEngineLocation
  const getPrayerRows = module.getEnginePrayerRows || module.getPrayerRows
  const generateIcs = module.generateEngineIcs || module.generateIcs
  const downloadIcs = module.downloadEngineIcs || module.downloadIcs
  const makeIcsFilename = module.makeEngineIcsFilename || module.makeIcsFilename

  if (typeof resolveLocation !== 'function') {
    throw new Error(`Advanced Athan engine is missing a location search function. Available exports: ${Object.keys(engine).join(', ') || 'none'}`)
  }

  if (typeof getPrayerRows !== 'function') {
    throw new Error(`Advanced Athan engine is missing a prayer-row function. Available exports: ${Object.keys(engine).join(', ') || 'none'}`)
  }

  return {
    resolveLocation,
    getPrayerRows,
    generateIcs,
    downloadIcs,
    makeIcsFilename
  }
}

export default function AthanEngine({ go }: Props) {
  const today = new Date()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState<EngineLocation | null>(null)
  const [rows, setRows] = useState<EnginePrayerRow[]>([])
  const [fromDate, setFromDate] = useState(toDateInputValue(today))
  const [toDate, setToDate] = useState(toDateInputValue(addDays(today, 13)))
  const [method, setMethod] = useState<EngineMethod>('MWL')
  const [madhab, setMadhab] = useState<EngineMadhab>('Shafi')
  const [reminderMinutes, setReminderMinutes] = useState(10)
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('24h')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const goIqama = () => {
    if (go) return go('Iqama')
    window.location.hash = '#Iqama'
  }


  async function handleSearch() {
    try {
      setLoading(true)
      setError('')
      setNotice('')

      const engine = await loadEngine()
      const resolvedLocation = await engine.resolveLocation(query) as EngineLocation
      const prayerRows = await engine.getPrayerRows({
        location: resolvedLocation,
        fromDate,
        toDate,
        method,
        madhab
      }) as EnginePrayerRow[]

      setLocation(resolvedLocation)
      setRows(prayerRows)
      setNotice(`Generated ${prayerRows.length} day${prayerRows.length === 1 ? '' : 's'} of prayer times for ${resolvedLocation.label}.`)
    } catch (err) {
      setLocation(null)
      setRows([])
      setError(getErrorMessage(err, 'Something went wrong while searching.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleRefreshRows() {
    if (!location) {
      setError('Please search a location first.')
      return
    }

    try {
      setError('')
      setNotice('')

      const engine = await loadEngine()
      const prayerRows = await engine.getPrayerRows({
        location,
        fromDate,
        toDate,
        method,
        madhab
      }) as EnginePrayerRow[]

      setRows(prayerRows)
      setNotice(`Updated prayer times using ${method}, ${madhab}, and ${reminderMinutes} minute reminders.`)
    } catch (err) {
      setRows([])
      setError(getErrorMessage(err, 'Could not refresh prayer times.'))
    }
  }

  async function handleDownloadIcs() {
    if (!location || rows.length === 0) {
      setError('Please generate prayer times before downloading an ICS file.')
      return
    }

    try {
      const engine = await loadEngine()

      if (typeof engine.generateIcs !== 'function' || typeof engine.downloadIcs !== 'function' || typeof engine.makeIcsFilename !== 'function') {
        throw new Error('Advanced Athan engine is missing one or more ICS export functions.')
      }

      const ics = engine.generateIcs({
        location,
        fromDate,
        toDate,
        method,
        madhab,
        rows,
        reminderMinutes
      })

      engine.downloadIcs(engine.makeIcsFilename(location, fromDate, toDate), ics)
      setError('')
      setNotice('Your custom ICS file has been downloaded.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not download the ICS file.'))
    }
  }

  const reminderEventCount = rows.length * 6

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Advanced Athan</h1>
        <p className="text-gray-300">
          Search any location and generate custom prayer-time calendar reminders.
        </p>
      </header>

      <section className="bg-gray-800 rounded-lg p-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="athan-engine-location" className="block text-sm font-semibold">
            Search location
          </label>
          <input
            id="athan-engine-location"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSearch()
            }}
            placeholder="City, country, or coordinates"
            className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white placeholder:text-gray-500"
          />
          <p className="text-xs text-gray-400">
            Examples: London, Makkah Saudi Arabia, or 21.4225, 39.8262.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1 text-sm">
            <span className="font-semibold">From date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold">To date</span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm block">
          <span className="font-semibold">Calculation method</span>
          <select
            value={method}
            onChange={(event) => setMethod(event.target.value as EngineMethod)}
            className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
          >
            {METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="space-y-1 text-sm">
            <span className="font-semibold">Madhab</span>
            <select
              value={madhab}
              onChange={(event) => setMadhab(event.target.value as EngineMadhab)}
              className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
            >
              <option value="Shafi">Shafi</option>
              <option value="Hanafi">Hanafi</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold">Reminder time</span>
            <select
              value={reminderMinutes}
              onChange={(event) => setReminderMinutes(Number(event.target.value))}
              className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
            >
              {REMINDER_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes === 0 ? 'At prayer time' : `${minutes} minutes before prayer`}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-1 text-sm">
            <span className="block font-semibold">Time format</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTimeFormat('24h')}
                aria-pressed={timeFormat === '24h'}
                className={`rounded border px-3 py-2 text-white ${
                  timeFormat === '24h'
                    ? 'border-teal-400 bg-teal-700'
                    : 'border-gray-700 bg-gray-900 hover:bg-gray-700'
                }`}
              >
                {timeFormat === '24h' ? '✓ ' : ''}24h
              </button>
              <button
                type="button"
                onClick={() => setTimeFormat('12h')}
                aria-pressed={timeFormat === '12h'}
                className={`rounded border px-3 py-2 text-white ${
                  timeFormat === '12h'
                    ? 'border-teal-400 bg-teal-700'
                    : 'border-gray-700 bg-gray-900 hover:bg-gray-700'
                }`}
              >
                {timeFormat === '12h' ? '✓ ' : ''}AM/PM
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full px-4 py-3 rounded bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold"
          >
            {loading ? 'Searching…' : 'Search & Generate Preview'}
          </button>

          <button
            onClick={handleRefreshRows}
            disabled={!location}
            className="w-full px-4 py-3 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold"
          >
            Refresh Current Preview
          </button>
        </div>

        {error && (
          <p className="rounded bg-red-950/40 border border-red-700 p-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {notice && (
          <p className="rounded bg-gray-900 p-3 text-sm text-teal-300">
            {notice}
          </p>
        )}
      </section>

      {location && (
        <section className="bg-gray-800 rounded-lg p-4 space-y-2">
          <h2 className="text-xl font-semibold">{location.label}</h2>
          <p className="text-sm text-gray-300">
            Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
          <p className="text-xs text-gray-400">
            This Advanced Athan setup is separate from the main Settings page.
          </p>
        </section>
      )}

      {rows.length > 0 && (
        <section className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Prayer-time preview</h2>
              <p className="text-sm text-gray-400">
                {rows.length} day{rows.length === 1 ? '' : 's'} selected · {reminderEventCount} prayer reminders
              </p>
            </div>
            <button
              onClick={handleDownloadIcs}
              className="px-4 py-3 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold"
            >
              Download Custom ICS
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Fajr</th>
                  <th className="py-2 pr-3">Sunrise</th>
                  <th className="py-2 pr-3">Dhuhr</th>
                  <th className="py-2 pr-3">Asr</th>
                  <th className="py-2 pr-3">Maghrib</th>
                  <th className="py-2 pr-3">Isha</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.date} className="border-b border-gray-700/60 last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.displayDate}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Fajr, timeFormat)}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Sunrise, timeFormat)}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Dhuhr, timeFormat)}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Asr, timeFormat)}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Maghrib, timeFormat)}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Isha, timeFormat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded bg-gray-900 p-3 text-xs text-gray-400 space-y-1">
            <p>Calendar alerts are handled by your calendar app, not by the PWA.</p>
            <p>The time format option only changes the preview table. Calendar export keeps machine-readable times.</p>
            <p>Avoid importing the same ICS file multiple times to prevent duplicate prayer reminders.</p>
          </div>
        </section>
      )}

      <button
        onClick={goIqama}
        className="w-full bg-gray-800 rounded-lg p-4 text-center font-semibold hover:bg-gray-700"
      >
        Generate Local Iqama
      </button>
    </div>
  )
}