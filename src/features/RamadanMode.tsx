import { useEffect, useMemo, useState } from 'react'
import { getUserLocation } from '../lib/location'
import { computePrayerTimes } from '../lib/prayer'
import {
  formatDate,
  getDaysUntilEid,
  getRamadanDay,
  getRamadanStatus,
  loadRamadanFastRecords,
  loadRamadanSettings,
  saveRamadanSettings,
  updateFastRecord,
  type RamadanFastRecord,
  type RamadanFastStatus,
  type RamadanSettings
} from '../lib/ramadan'

type Props = {
  go?: (screen: string) => void
}

export default function RamadanMode({ go }: Props) {
  const [settings, setSettings] = useState<RamadanSettings>(() => loadRamadanSettings())
  const [records, setRecords] = useState<RamadanFastRecord[]>(() => loadRamadanFastRecords())
  const [today] = useState(() => new Date())
  const [countdown, setCountdown] = useState({ suhoor: '—', iftar: '—' })
  const [timesStatus, setTimesStatus] = useState('Loading local Fajr and Maghrib times…')
  const todayKey = formatDate(today)
  const todayRecord = records.find((record) => record.date === todayKey) ?? { date: todayKey, status: 'not-set' as RamadanFastStatus, notes: '' }

  const ramadanDay = getRamadanDay(settings, today)
  const daysUntilEid = getDaysUntilEid(settings, today)
  const status = getRamadanStatus(settings, today)

  useEffect(() => {
    saveRamadanSettings(settings)
  }, [settings])

  useEffect(() => {
    let cancelled = false
    let interval: ReturnType<typeof setInterval> | null = null

    async function loadTimes() {
      try {
        const location = await getUserLocation()
        if (!location || cancelled) return
        const pt = computePrayerTimes({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }, today)
        setTimesStatus('Using your current device location for Fajr and Maghrib.')

        const tick = () => {
          if (cancelled) return
          setCountdown({
            suhoor: formatCountdownTo(pt.fajr),
            iftar: formatCountdownTo(pt.maghrib)
          })
        }

        tick()
        interval = setInterval(tick, 1000)
      } catch {
        if (!cancelled) {
          setTimesStatus('Location unavailable. Suhoor and Iftar countdowns need local prayer times.')
        }
      }
    }

    loadTimes()
    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
    }
  }, [today])

  const statusText = useMemo(() => {
    if (status === 'not-configured') return 'Set Ramadan start and Eid dates to activate Ramadan Mode.'
    if (status === 'before') return 'Ramadan Mode is configured and waiting for the start date.'
    if (status === 'after') return 'Ramadan has passed for the saved dates.'
    return `Ramadan Day ${ramadanDay ?? '—'}`
  }, [ramadanDay, status])

  function updateSettings(next: Partial<RamadanSettings>) {
    setSettings((current) => ({ ...current, ...next }))
  }

  function updateToday(status: RamadanFastStatus, notes = todayRecord.notes) {
    const next = updateFastRecord(todayKey, status, notes)
    setRecords(next)
  }

  function goBack() {
    if (go) go('More')
    else window.location.hash = '#More'
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Ramadan Mode</h1>
        <p className="text-sm text-gray-300">{statusText}</p>
      </header>

      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">Manual Ramadan Dates</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-semibold">Ramadan start date</span>
            <input type="date" value={settings.ramadanStartDate} onChange={(event) => updateSettings({ ramadanStartDate: event.target.value })} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold">Eid date</span>
            <input type="date" value={settings.eidDate} onChange={(event) => updateSettings({ eidDate: event.target.value })} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
          </label>
        </div>
        <p className="text-xs text-gray-400">Dates are manual for this first version. No Islamic calendar API is used.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard title="Ramadan Day" value={ramadanDay ? String(ramadanDay) : '—'} detail={status} />
        <InfoCard title="Suhoor Countdown" value={countdown.suhoor} detail="until Fajr" />
        <InfoCard title="Iftar Countdown" value={countdown.iftar} detail="until Maghrib" />
        <InfoCard title="Eid Countdown" value={daysUntilEid !== null ? `${daysUntilEid} days` : '—'} detail="until Eid date" />
      </section>

      <section className="bg-gray-800 rounded-lg p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Today’s Fasting Status</h2>
          <p className="text-xs text-gray-400">{timesStatus}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(['fasted', 'missed', 'makeup', 'not-set'] as RamadanFastStatus[]).map((statusOption) => (
            <button
              key={statusOption}
              type="button"
              onClick={() => updateToday(statusOption)}
              aria-pressed={todayRecord.status === statusOption}
              className={`rounded border px-3 py-2 font-semibold capitalize ${todayRecord.status === statusOption ? 'border-teal-400 bg-teal-700' : 'border-gray-700 bg-gray-900 hover:bg-gray-700'}`}
            >
              {statusOption === 'not-set' ? 'Not set' : statusOption}
            </button>
          ))}
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-semibold">Notes</span>
          <textarea value={todayRecord.notes} onChange={(event) => updateToday(todayRecord.status, event.target.value)} rows={3} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
        </label>

        <p className="rounded bg-gray-900 p-3 text-xs text-gray-400">Your Ramadan tracker stays on this device.</p>
        <button type="button" onClick={goBack} className="rounded bg-gray-700 hover:bg-gray-600 px-4 py-2">Back</button>
      </section>
    </div>
  )
}

function InfoCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-bold text-teal-300">{value}</div>
      <div className="text-xs text-gray-500">{detail}</div>
    </div>
  )
}

function formatCountdownTo(target: Date) {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return 'Passed today'
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}
