import { useEffect, useState } from 'react'
import { refreshDeviceLocation } from '../lib/locationStore'
import { computePrayerTimes } from '../lib/prayer'

const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
type PrayerName = typeof PRAYERS[number]
type Row = { date: number } & Record<PrayerName, string>

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function PrayerMonth() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    ;(async () => {
      const location = await refreshDeviceLocation()
      if (!location.location) throw new Error('Location unavailable')
      const results: Row[] = []
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day)
        const times = computePrayerTimes({
          latitude: location.location.latitude,
          longitude: location.location.longitude
        }, date)
        results.push({
          date: day,
          Fajr: formatTime(times.fajr),
          Sunrise: formatTime(times.sunrise),
          Dhuhr: formatTime(times.dhuhr),
          Asr: formatTime(times.asr),
          Maghrib: formatTime(times.maghrib),
          Isha: formatTime(times.isha)
        })
      }
      if (!cancelled) setRows(results)
    })()
      .catch(() => {
        if (!cancelled) setError('Location permission is needed for the monthly timetable.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [month, year])

  const monthName = new Date(2000, month, 1).toLocaleString([], { month: 'long' })
  const previousMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((value) => value - 1)
    } else {
      setMonth((value) => value - 1)
    }
  }
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((value) => value + 1)
    } else {
      setMonth((value) => value + 1)
    }
  }

  return (
    <div className="space-y-4">
      <header className="px-1">
        <p className="text-xs font-semibold uppercase text-teal-400">Monthly Timetable</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{monthName} {year}</h2>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-700 bg-gray-800 p-3">
        <button type="button" aria-label="Previous month" className="h-10 w-10 rounded-md bg-gray-900 text-gray-200 hover:bg-gray-700" onClick={previousMonth}>←</button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <span className="font-semibold text-gray-100">{monthName}</span>
          <select
            aria-label="Timetable year"
            className="rounded-md border border-gray-700 bg-gray-950 px-2 py-2 text-sm text-gray-100"
            value={year}
            onChange={(event) => setYear(Number.parseInt(event.target.value, 10))}
          >
            {Array.from({ length: 11 }, (_, index) => today.getFullYear() - 5 + index).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
        <button type="button" aria-label="Next month" className="h-10 w-10 rounded-md bg-gray-900 text-gray-200 hover:bg-gray-700" onClick={nextMonth}>→</button>
      </section>

      <section className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800/80">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-400">Calculating monthly prayer times…</p>
        ) : error ? (
          <p role="alert" className="p-8 text-center text-sm text-amber-200">{error}</p>
        ) : (
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-gray-900/80 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-3 py-3">Day</th>
                {PRAYERS.map((prayer) => <th key={prayer} className="px-3 py-3">{prayer}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/70">
              {rows.map((row) => (
                <tr key={row.date} className={row.date === today.getDate() && month === today.getMonth() && year === today.getFullYear() ? 'bg-teal-950/35' : ''}>
                  <td className="px-3 py-3 font-semibold text-teal-300">{row.date}</td>
                  {PRAYERS.map((prayer) => <td key={prayer} className="whitespace-nowrap px-3 py-3 text-gray-200">{row[prayer]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
