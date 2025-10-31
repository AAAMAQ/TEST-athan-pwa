// src/features/SalahTracker.tsx
import { useEffect, useMemo, useState } from 'react'
import { computePrayerTimes } from '../lib/prayer'
import { getUserLocation } from '../lib/location'

type PrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' | 'Witr'
const PRAYERS: PrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Witr'] as const

type DayLog = Partial<Record<PrayerKey, boolean>>
type LogStore = Record<string, DayLog> // key: YYYY-MM-DD

const STORAGE_KEY = 'salahLogV1'

// ---------- small date helpers ----------
function pad2(n: number) { return n.toString().padStart(2, '0') }
function ymd(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}` }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0) }
function addMonths(d: Date, delta: number) { return new Date(d.getFullYear(), d.getMonth()+delta, 1) }
function sameDay(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate() }

// Returns a 6x7 matrix of Dates covering the calendar view (Sun..Sat rows)
function monthMatrix(forMonth: Date) {
  const first = startOfMonth(forMonth)
  const last = endOfMonth(forMonth)
  const firstWeekday = new Date(first).getDay() // 0 Sun .. 6 Sat
  const start = new Date(first); start.setDate(first.getDate() - firstWeekday)
  const matrix: Date[][] = []
  const cur = new Date(start)
  for (let r=0; r<6; r++) {
    const row: Date[] = []
    for (let c=0; c<7; c++) {
      row.push(new Date(cur))
      cur.setDate(cur.getDate()+1)
    }
    matrix.push(row)
  }
  return { matrix, monthFirst: first, monthLast: last }
}

// ---------- storage ----------
function loadStore(): LogStore {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}') as LogStore } catch { return {} }
}
function saveStore(store: LogStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export default function SalahTracker() {
  const [store, setStore] = useState<LogStore>(() => loadStore())
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<Date>(() => new Date())
  const [todayTimes, setTodayTimes] = useState<{[K in Exclude<PrayerKey,'Witr'>]?: string}>({})

  // persist
  useEffect(() => { saveStore(store) }, [store])

  // optional: compute today's prayer times (no network, from adhan + location)
  useEffect(() => {
    (async () => {
      try {
        const loc = await getUserLocation()
        if (!loc) return
        const pt = computePrayerTimes({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
        const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setTodayTimes({
          Fajr: fmt(pt.fajr),
          Dhuhr: fmt(pt.dhuhr),
          Asr: fmt(pt.asr),
          Maghrib: fmt(pt.maghrib),
          Isha: fmt(pt.isha)
        })
      } catch { /* ignore */ }
    })()
  }, [])

  const { matrix, monthFirst } = useMemo(() => monthMatrix(month), [month])
  const selKey = ymd(selected)
  const dayLog: DayLog = store[selKey] || {}

  const completedCount = (d: Date) => {
    const k = ymd(d)
    const log = store[k]
    if (!log) return 0
    let n = 0
    for (const p of PRAYERS) if (log[p]) n++
    return n
  }

  function toggle(prayer: PrayerKey) {
    setStore(prev => {
      const next = { ...prev }
      const cur = { ...(next[selKey] || {}) }
      cur[prayer] = !cur[prayer]
      next[selKey] = cur
      return next
    })
  }
  function markAll(val: boolean) {
    setStore(prev => {
      const next = { ...prev }
      const cur: DayLog = {}
      for (const p of PRAYERS) cur[p] = val
      next[selKey] = cur
      return next
    })
  }

  function prevMonth() { setMonth(m => addMonths(m, -1)) }
  function nextMonth() { setMonth(m => addMonths(m, +1)) }
  function goToday() { const t = new Date(); setMonth(startOfMonth(t)); setSelected(t) }

  // heat color: 0..6 mapped to gray -> teal
  function heatClass(n: number, inMonth: boolean) {
    const base = inMonth ? '' : 'opacity-40'
    switch (n) {
      case 0: return `bg-gray-800 ${base}`
      case 1: return `bg-teal-900 ${base}`
      case 2: return `bg-teal-800 ${base}`
      case 3: return `bg-teal-700 ${base}`
      case 4: return `bg-teal-600 ${base}`
      case 5: return `bg-teal-500 ${base}`
      case 6: return `bg-teal-400 text-black ${base}`
      default: return `bg-gray-800 ${base}`
    }
  }

  const monthLabel = month.toLocaleString(undefined, { month: 'long', year: 'numeric' })
  const selectedLabel = selected.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  const selectedScore = PRAYERS.reduce((n, p) => n + (dayLog[p] ? 1 : 0), 0)

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Track Salah</h1>

      {/* Month header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700">←</button>
          <div className="font-semibold">{monthLabel}</div>
          <button onClick={nextMonth} className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700">→</button>
        </div>
        <button onClick={goToday} className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">Today</button>
      </div>

      {/* Heatmap calendar */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w => (
          <div key={w} className="text-center text-gray-400 py-1">{w}</div>
        ))}
        {matrix.flat().map((d, i) => {
          const inMonth = d.getMonth() === monthFirst.getMonth()
          const n = completedCount(d)
          const isSelected = sameDay(d, selected)
          return (
            <button
              key={i}
              onClick={() => setSelected(d)}
              className={`aspect-square rounded flex flex-col items-center justify-center ${heatClass(n, inMonth)} ${isSelected ? 'ring-2 ring-yellow-300' : ''}`}
              title={`${d.toDateString()} • ${n}/6`}
            >
              <div className="text-[10px]">{d.getDate()}</div>
              <div className="text-[10px]">{n}/6</div>
            </button>
          )
        })}
      </div>

      {/* Daily editor */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-300">Selected day</div>
            <div className="text-lg font-semibold">{selectedLabel}</div>
          </div>
          <div className="text-sm text-gray-300">{selectedScore}/6 completed</div>
        </div>

        {/* Optional today times if the selected date is today */}
        {sameDay(selected, new Date()) && (
          <div className="text-xs text-gray-400">
            {['Fajr','Dhuhr','Asr','Maghrib','Isha'].map((p) => {
              const k = p as Exclude<PrayerKey, 'Witr'>
              const t = todayTimes[k]
              return t ? <span key={k} className="mr-3">{k}: {t}</span> : null
            })}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PRAYERS.map(p => {
            const on = !!dayLog[p]
            return (
              <button
                key={p}
                onClick={() => toggle(p)}
                className={`rounded px-3 py-3 font-semibold border ${on ? 'bg-teal-600 hover:bg-teal-500 border-teal-500' : 'bg-gray-900 hover:bg-gray-700 border-gray-700'}`}
              >
                {p} {on ? '✓' : ''}
              </button>
            )
          })}
        </div>

        <div className="flex gap-2">
          <button onClick={() => markAll(true)} className="px-3 py-2 rounded bg-teal-700 hover:bg-teal-600">Mark all</button>
          <button onClick={() => markAll(false)} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600">Clear all</button>
        </div>
      </div>

      {/* Stats for this month */}
      <MonthStats store={store} month={month} />
    </div>
  )
}

function MonthStats({ store, month }: { store: LogStore; month: Date }) {
  const first = startOfMonth(month)
  const last = endOfMonth(month)
  let days = 0, total = 0
  for (let d = new Date(first); d <= last; d.setDate(d.getDate()+1)) {
    days++
    const log = store[ymd(d)]
    if (!log) continue
    for (const p of PRAYERS) if (log[p]) total++
  }
  const max = days * PRAYERS.length
  const pct = max ? Math.round((total / max) * 100) : 0
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="font-semibold mb-1">This Month</div>
      <div className="text-sm text-gray-300">{total} / {max} prayers logged ({pct}%)</div>
      <div className="w-full h-2 bg-gray-700 rounded mt-2">
        <div className="h-2 bg-teal-500 rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}