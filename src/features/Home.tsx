// src/features/Home.tsx
import { useEffect, useState } from 'react'
import type { Screen } from '../types/nav'
import { formatHijri } from '../lib/hijri'
import { loadLanguage, t, type AppLanguage } from '../lib/i18n'
import { getUserLocation } from '../lib/location'
import { computePrayerTimes, nextPrayer } from '../lib/prayer'


const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const msUntilNextMidnight = () => {
  const now = new Date()
  const nextMidnight = new Date(now)
  nextMidnight.setHours(24, 0, 0, 0)
  return nextMidnight.getTime() - now.getTime()
}

const reverseGeocodeLocation = async (latitude: number, longitude: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=10&addressdetails=1`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  })

  if (!response.ok) throw new Error('Unable to reverse geocode location')

  const data = await response.json()
  const address = data?.address ?? {}
  const city = address.city || address.town || address.village || address.hamlet || address.municipality || address.county
  const region = address.state || address.region
  const country = address.country

  const parts = [city, region, country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : data?.display_name || ''
}

export default function Home({ go }: { go: (tab: Screen) => void }) {
  const [hijri, setHijri] = useState(formatHijri())
  const [language] = useState<AppLanguage>(() => loadLanguage())
  const [locationLabel, setLocationLabel] = useState('Location not available')
  const [next, setNext] = useState<{ name: string; time: Date } | null>(null)
  const [nextAt, setNextAt] = useState<string>('') // human local time for next prayer
  const [countdown, setCountdown] = useState('—:—:—')

  // refresh hijri each mount and again at local midnight
  useEffect(() => {
    let midnightTimeout: ReturnType<typeof setTimeout> | null = null
    let dailyInterval: ReturnType<typeof setInterval> | null = null

    setHijri(formatHijri())

    midnightTimeout = setTimeout(() => {
      setHijri(formatHijri())
      dailyInterval = setInterval(() => {
        setHijri(formatHijri())
      }, 24 * 60 * 60 * 1000)
    }, msUntilNextMidnight())

    return () => {
      if (midnightTimeout) clearTimeout(midnightTimeout)
      if (dailyInterval) clearInterval(dailyInterval)
    }
  }, [])
  

  // compute next prayer from current location
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const loc = await getUserLocation()
        if (!loc || cancelled) return

        const latitude = loc.coords.latitude
        const longitude = loc.coords.longitude

        try {
          const readableLocation = await reverseGeocodeLocation(latitude, longitude)
          if (!cancelled) {
            setLocationLabel(readableLocation || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          }
        } catch {
          if (!cancelled) setLocationLabel(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }

        const pt = computePrayerTimes({
          latitude,
          longitude
        })
        const n = nextPrayer(pt)
        setNext(n)
        setNextAt(n ? fmtTime(n.time) : '')
      } catch {
        if (!cancelled) setLocationLabel('Location not available')
        // silently ignore; UI will show dashes
      }
    })()
    return () => { cancelled = true }
  }, [])

  // live countdown
  useEffect(() => {
    if (!next) return
    const id = setInterval(() => {
      const diff = Math.max(0, next.time.getTime() - Date.now())
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      const pad = (n: number) => n.toString().padStart(2, '0')
      setCountdown(`${pad(h)}:${pad(m)}:${pad(s)}`)
    }, 1000)
    return () => clearInterval(id)
  }, [next])

  // simple hard-nav for static pages (no router required)
 // const goPath = (path: string) => { window.location.href = path }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Athan App</h1>
        <p className="text-sm text-gray-300">{hijri}</p>
        <p className="text-bold text-gray-400">{locationLabel}</p>
      </div>

      {/* Big Next-Prayer Countdown */}
      <div className="flex items-center justify-center gap-4 bg-gray-800 rounded-xl p-4">
        <div className="text-4xl leading-none">🕰️</div>
        <div className="text-center">
          <div className="text-lg text-gray-300">Next {t('prayer', language)}</div>
          <div className="text-3xl md:text-4xl font-extrabold tracking-wide">
            {next ? next.name.toUpperCase() : '—'}
          </div>
          <div className="text-sm text-gray-400">{next ? `at ${nextAt}` : ''}</div>
          <div className="text-xl md:text-2xl font-mono" aria-live="polite">{countdown}</div>
        </div>
      </div>

      {/* Simple vertical actions */}
      <div className="space-y-3">
        <HomeButton label={t('quran', language)} onClick={() => go('Quran')} />
        <HomeButton label={t('qibla', language)} onClick={() => go('Qibla')} />
        <HomeButton label="Track Salah" onClick={() => go('SalahTracker')} />
        <HomeButton label={t('advancedAthan', language)} onClick={()=> go('AthanEngine')}/>
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
