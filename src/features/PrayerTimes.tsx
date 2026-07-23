import { useEffect, useMemo, useState } from 'react'
import { formatHijri } from '../lib/hijri'
import { loadLanguage, t, type AppLanguage } from '../lib/i18n'
import { loadCachedLocation, refreshDeviceLocation } from '../lib/locationStore'
import { computePrayerTimes, loadSettings, nextPrayer } from '../lib/prayer'
import PrayerMonth from './PrayerMonth.tsx'

type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
type PrayerTimesState = Partial<Record<PrayerKey, Date>>

const PRAYER_ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatLocation() {
  const location = loadCachedLocation()
  if (!location) return 'Current device location'
  const place = [location.city, location.country].filter(Boolean).join(', ')
  return place || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
}

export default function PrayerTimes() {
  const [times, setTimes] = useState<PrayerTimesState>({})
  const [next, setNext] = useState<{ name: string; time: Date } | null>(null)
  const [language] = useState<AppLanguage>(() => loadLanguage())
  const [countdown, setCountdown] = useState('00:00:00')
  const [showMonth, setShowMonth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [locationLabel] = useState(formatLocation)
  const isFriday = new Date().getDay() === 5
  const settings = useMemo(loadSettings, [])

  const prayerLabels: Record<PrayerKey, string> = {
    fajr: t('fajr', language),
    sunrise: t('sunrise', language),
    dhuhr: isFriday ? t('jumuah', language) : t('dhuhr', language),
    asr: t('asr', language),
    maghrib: t('maghrib', language),
    isha: t('isha', language)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const location = await refreshDeviceLocation()
      if (!location.location || cancelled) {
        if (!cancelled) {
          setError('Location permission is needed to calculate local prayer times.')
          setLoading(false)
        }
        return
      }
      const calculated = computePrayerTimes({
        latitude: location.location.latitude,
        longitude: location.location.longitude
      })
      if (cancelled) return
      setTimes({
        fajr: calculated.fajr,
        sunrise: calculated.sunrise,
        dhuhr: calculated.dhuhr,
        asr: calculated.asr,
        maghrib: calculated.maghrib,
        isha: calculated.isha
      })
      setNext(nextPrayer(calculated))
      setLoading(false)
    })().catch(() => {
      if (!cancelled) {
        setError('Prayer times could not be calculated. Try refreshing your location.')
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!next) return
    const update = () => {
      const difference = Math.max(0, next.time.getTime() - Date.now())
      const hours = Math.floor(difference / 3_600_000)
      const minutes = Math.floor((difference % 3_600_000) / 60_000)
      const seconds = Math.floor((difference % 60_000) / 1_000)
      setCountdown([hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':'))
    }
    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [next])

  if (showMonth) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <button
          type="button"
          onClick={() => setShowMonth(false)}
          className="min-h-10 rounded-md border border-gray-700 bg-gray-800 px-3 text-sm text-gray-200 hover:border-teal-700"
        >
          ← Today
        </button>
        <PrayerMonth />
      </div>
    )
  }

  const nextKey = next?.name as PrayerKey | undefined

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      <header className="px-1">
        <p className="text-xs font-semibold uppercase text-teal-400">Today</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{t('prayerTimes', language)}</h2>
        <p className="mt-1 text-sm text-gray-400">{formatHijri(new Date(), language)}</p>
        <p className="mt-1 text-xs text-gray-500">{locationLabel}</p>
      </header>

      {next && nextKey && (
        <section className="rounded-lg border border-teal-900/80 bg-gray-800 p-4" aria-label="Next prayer">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Next Prayer</p>
              <h3 className="mt-1 text-2xl font-bold text-teal-300">{prayerLabels[nextKey]}</h3>
              <p className="mt-1 text-sm text-gray-300">{formatTime(next.time)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Time remaining</p>
              <p className="font-mono text-xl font-semibold text-white" aria-live="polite">{countdown}</p>
            </div>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800/80">
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-gray-400">Requesting location and calculating prayer times…</p>
        ) : error ? (
          <p role="alert" className="px-4 py-8 text-center text-sm text-amber-200">{error}</p>
        ) : (
          <div className="divide-y divide-gray-700/80">
            {PRAYER_ORDER.map((key) => {
              const time = times[key]
              const isNext = key === nextKey
              return (
                <div key={key} className={`flex min-h-16 items-center gap-3 px-4 py-3 ${isNext ? 'bg-teal-950/35' : ''}`}>
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${isNext ? 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.7)]' : 'bg-gray-600'}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium ${isNext ? 'text-teal-200' : 'text-gray-100'}`}>{prayerLabels[key]}</p>
                    {key === 'sunrise' && <p className="text-xs text-gray-500">Solar time</p>}
                  </div>
                  <time className={`text-lg font-semibold ${isNext ? 'text-teal-300' : 'text-gray-200'}`}>
                    {time ? formatTime(time) : '—'}
                  </time>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-700 bg-gray-800/60 p-4">
        <div>
          <p className="text-sm font-semibold text-gray-100">Calculation</p>
          <p className="mt-1 text-xs text-gray-400">{settings.method} · {settings.madhab}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowMonth(true)}
          className="min-h-11 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-600"
        >
          Monthly View
        </button>
      </div>
    </div>
  )
}
