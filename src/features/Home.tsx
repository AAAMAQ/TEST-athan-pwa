// src/features/Home.tsx
import { useEffect, useState } from 'react'
import type { Screen } from '../types/nav'
import { formatHijri } from '../lib/hijri'
import { getUserLocation } from '../lib/location'
import { computePrayerTimes, nextPrayer } from '../lib/prayer'


const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function Home({ go }: { go: (tab: Screen) => void }) {
  const [hijri, setHijri] = useState(formatHijri())
  const [next, setNext] = useState<{ name: string; time: Date } | null>(null)
  const [nextAt, setNextAt] = useState<string>('') // human local time for next prayer
  const [countdown, setCountdown] = useState('—:—:—')

  // refresh hijri each mount (and at midnight if you want later)
  useEffect(() => {
    setHijri(formatHijri())
  }, [])

  // compute next prayer from current location
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const loc = await getUserLocation()
        if (!loc || cancelled) return
        const pt = computePrayerTimes({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        })
        const n = nextPrayer(pt)
        setNext(n)
        setNextAt(n ? fmtTime(n.time) : '')
      } catch {
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
      </div>

      {/* Big Next-Prayer Countdown */}
      <div className="flex items-center justify-center gap-4 bg-gray-800 rounded-xl p-4">
        <div className="text-4xl leading-none">🕰️</div>
        <div className="text-center">
          <div className="text-lg text-gray-300">Next Prayer</div>
          <div className="text-3xl md:text-4xl font-extrabold tracking-wide">
            {next ? next.name.toUpperCase() : '—'}
          </div>
          <div className="text-sm text-gray-400">{next ? `at ${nextAt}` : ''}</div>
          <div className="text-xl md:text-2xl font-mono" aria-live="polite">{countdown}</div>
        </div>
      </div>

      {/* Simple vertical actions */}
      <div className="space-y-3">
        <HomeButton label="Quran" onClick={() => go('Quran')} />
        <HomeButton label="Qibla" onClick={() => go('Qibla')} />
        <HomeButton label="Track Salah" onClick={() => go('SalahTracker')} />
        <HomeButton label="Credits" onClick={() => go('Credits')} />
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