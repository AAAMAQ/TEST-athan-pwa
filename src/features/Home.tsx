// src/features/Home.tsx
import { useEffect, useState } from 'react'
import type { Screen } from '../types/nav'
import { formatHijri } from '../lib/hijri'
import { loadLanguage, t, type AppLanguage } from '../lib/i18n'
import { getPrimaryPrayerContext, loadPrimarySavedCity } from '../lib/primaryPrayerSource'
import { getRamadanDay, getRamadanStatus, loadRamadanSettings } from '../lib/ramadan'
import { formatAppTime } from '../lib/preferences'
import { getPrayerProgress, getPrayerWindow, type PrayerWindow } from '../lib/prayerWindow'


const msUntilNextMidnight = () => {
  const now = new Date()
  const nextMidnight = new Date(now)
  nextMidnight.setHours(24, 0, 0, 0)
  return nextMidnight.getTime() - now.getTime()
}

export default function Home({ go }: { go: (tab: Screen) => void }) {
  const [language] = useState<AppLanguage>(() => loadLanguage())
  const [hijri, setHijri] = useState(() => formatHijri(new Date(), language))
  const [savedCity] = useState(loadPrimarySavedCity)
  const [locationLabel, setLocationLabel] = useState('Location not available')
  const [prayerWindow, setPrayerWindow] = useState<PrayerWindow | null>(null)
  const [prayerSchedule, setPrayerSchedule] = useState<Awaited<ReturnType<typeof getPrimaryPrayerContext>> | null>(null)
  const [nextAt, setNextAt] = useState<string>('') // human local time for next prayer
  const [countdown, setCountdown] = useState('—:—:—')
  const [ramadanDay] = useState(() => {
    const settings = loadRamadanSettings()
    return getRamadanStatus(settings) === 'active' ? getRamadanDay(settings) : null
  })
  const isFriday = new Date().getDay() === 5

  // refresh hijri each mount and again at local midnight
  useEffect(() => {
    let midnightTimeout: ReturnType<typeof setTimeout> | null = null
    let dailyInterval: ReturnType<typeof setInterval> | null = null

    setHijri(formatHijri(new Date(), language))

    midnightTimeout = setTimeout(() => {
      setHijri(formatHijri(new Date(), language))
      dailyInterval = setInterval(() => {
        setHijri(formatHijri(new Date(), language))
      }, 24 * 60 * 60 * 1000)
    }, msUntilNextMidnight())

    return () => {
      if (midnightTimeout) clearTimeout(midnightTimeout)
      if (dailyInterval) clearInterval(dailyInterval)
    }
  }, [language])
  

  // Compute the active prayer source selected in Settings.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const context = await getPrimaryPrayerContext()
        if (cancelled) return
        setLocationLabel(context.locationLabel)
        setPrayerSchedule(context)
      } catch {
        if (!cancelled) setLocationLabel('Location not available')
        // silently ignore; UI will show dashes
      }
    })()
    return () => { cancelled = true }
  }, [savedCity])

  useEffect(() => {
    if (!prayerSchedule) return
    const updatePrayerWindow = () => {
      const window = getPrayerWindow(prayerSchedule.times, new Date(), prayerSchedule.nextFajr)
      setPrayerWindow(window)
      setNextAt(formatAppTime(window.nextTime, {
        hour: '2-digit',
        timezone: prayerSchedule.savedCity?.timezone
      }))
    }
    updatePrayerWindow()
    const interval = window.setInterval(updatePrayerWindow, 30_000)
    return () => window.clearInterval(interval)
  }, [prayerSchedule])

  // live countdown
  useEffect(() => {
    if (!prayerWindow) return
    const updateCountdown = () => {
      const diff = Math.max(0, prayerWindow.nextTime.getTime() - Date.now())
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      const pad = (n: number) => n.toString().padStart(2, '0')
      setCountdown(`${pad(h)}:${pad(m)}:${pad(s)}`)
    }
    updateCountdown()
    const id = setInterval(updateCountdown, 1000)
    return () => clearInterval(id)
  }, [prayerWindow])

  // simple hard-nav for static pages (no router required)
 // const goPath = (path: string) => { window.location.href = path }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Athan App</h1>
        <p className="text-sm text-gray-300">{hijri}</p>
        {isFriday && (
          <p className="mt-2 rounded-lg border border-teal-700 bg-teal-950/40 px-3 py-2 text-sm font-semibold text-teal-200">
            Jumu’ah Mubarak
          </p>
        )}
        <p className={`mt-1 text-sm ${savedCity ? 'font-semibold text-teal-300' : 'text-gray-400'}`}>
          {savedCity ? `Saved City: ${locationLabel}` : locationLabel}
        </p>
      </div>

      <section className="rounded-lg border border-gray-700 bg-gray-800 p-4" aria-labelledby="current-prayer-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div id="current-prayer-title" className="text-xs font-semibold uppercase text-gray-400">Current Prayer</div>
            <div className="mt-1 text-2xl font-bold text-white">
              {prayerWindow ? prayerWindow.currentName : '—'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Next: {prayerWindow?.nextName ?? '—'} {nextAt && `at ${nextAt}`}</div>
            <div className="font-mono text-lg text-teal-300" aria-live="polite">{countdown}</div>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full rounded-full bg-teal-400 transition-[width] duration-1000"
            style={{ width: `${getPrayerProgress(prayerWindow)}%` }}
          />
        </div>
      </section>

      {ramadanDay && (
        <button
          type="button"
          onClick={() => go('RamadanMode')}
          className="w-full rounded-lg border border-teal-700 bg-teal-950/40 p-4 text-left hover:bg-teal-900/40"
        >
          <div className="text-sm text-teal-200">Ramadan Mode</div>
          <div className="text-xl font-bold">Ramadan Day {ramadanDay}</div>
          <div className="text-xs text-gray-300">Open Ramadan Mode for Suhoor, Iftar, fasting, and Eid tracking.</div>
        </button>
      )}

      {/* Simple vertical actions */}
      <div className="space-y-3">
        <HomeButton label={t('quran', language)} onClick={() => go('Quran')} />
        <HomeButton label={t('qibla', language)} onClick={() => go('Qibla')} />
        <HomeButton label="More" onClick={() => go('More')} />
        <HomeButton label={t('credits', language)} onClick={() => go('Credits')} />
        
      </div>
    </div>
  )
}

function HomeButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-800 rounded-lg p-4 text-center font-semibold hover:bg-gray-700"
    > 
      {label}
    </button>
  )
}
