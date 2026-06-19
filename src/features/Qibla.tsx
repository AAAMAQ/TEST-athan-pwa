import { useEffect, useMemo, useRef, useState } from 'react'
import { refreshDeviceLocation } from '../lib/locationStore'

declare global {
  interface DeviceOrientationEvent {
    webkitCompassHeading?: number
  }
  interface DeviceOrientationEventConstructor {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }
  interface Window {
    DeviceOrientationEvent?: DeviceOrientationEventConstructor
  }
}

type QiblaMode = 'simple' | 'advanced'
type PermissionStatusText = 'unknown' | 'granted' | 'denied' | 'unavailable'

const KAABA = { lat: 21.4225, lon: 39.8262 }
const MODE_KEY = 'athan.qibla.mode.v1'
const HAPTICS_KEY = 'athan.qibla.haptics.v1'
const STATUS_KEY = 'athan.qibla.status.v1'
const ALIGNMENT_THRESHOLD = 5

function bearingToKaaba(lat: number, lon: number) {
  const phi1 = (lat * Math.PI) / 180
  const phi2 = (KAABA.lat * Math.PI) / 180
  const deltaLambda = ((KAABA.lon - lon) * Math.PI) / 180
  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)
  const theta = (Math.atan2(y, x) * 180) / Math.PI
  return normalizeDeg(theta)
}

function distanceToKaabaKm(lat: number, lon: number) {
  const earthKm = 6371
  const dLat = ((KAABA.lat - lat) * Math.PI) / 180
  const dLon = ((KAABA.lon - lon) * Math.PI) / 180
  const phi1 = (lat * Math.PI) / 180
  const phi2 = (KAABA.lat * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) ** 2
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function normalizeDeg(degrees: number) {
  const normalized = degrees % 360
  return normalized < 0 ? normalized + 360 : normalized
}

function signedAngle(degrees: number) {
  const normalized = normalizeDeg(degrees)
  return normalized > 180 ? normalized - 360 : normalized
}

function loadMode(): QiblaMode {
  try {
    return localStorage.getItem(MODE_KEY) === 'advanced' ? 'advanced' : 'simple'
  } catch {
    return 'simple'
  }
}

function loadHaptics() {
  try {
    return localStorage.getItem(HAPTICS_KEY) === 'true'
  } catch {
    return false
  }
}

export default function Qibla() {
  const [mode, setMode] = useState<QiblaMode>(() => loadMode())
  const [haptics, setHaptics] = useState(() => loadHaptics())
  const [bearing, setBearing] = useState<number | null>(null)
  const [heading, setHeading] = useState<number | null>(null)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [status, setStatus] = useState('Finding your location…')
  const [locationStatus, setLocationStatus] = useState<PermissionStatusText>('unknown')
  const [compassStatus, setCompassStatus] = useState<PermissionStatusText>('unknown')
  const [needsCompassPermission, setNeedsCompassPermission] = useState(false)
  const alignedRef = useRef(false)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode)
    } catch {
      // Ignore localStorage failures.
    }
  }, [mode])

  useEffect(() => {
    try {
      localStorage.setItem(HAPTICS_KEY, String(haptics))
    } catch {
      // Ignore localStorage failures.
    }
  }, [haptics])

  useEffect(() => {
    const cancelled = { current: false }

    async function initLocation() {
      try {
        const locState = await refreshDeviceLocation()
        if (!locState.location) {
          setLocationStatus('denied')
          setStatus('Location unavailable. Please allow location access.')
          return
        }

        const updateFromCoords = (latitude: number, longitude: number) => {
          const nextBearing = bearingToKaaba(latitude, longitude)
          setBearing(nextBearing)
          setDistanceKm(distanceToKaabaKm(latitude, longitude))
          setLocationStatus('granted')
          setStatus('Location ready. Waiting for compass heading.')
        }

        if (!cancelled.current) updateFromCoords(locState.location.latitude, locState.location.longitude)

        if ('geolocation' in navigator) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              if (cancelled.current) return
              updateFromCoords(pos.coords.latitude, pos.coords.longitude)
            },
            () => setLocationStatus('denied'),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
          )
        }
      } catch {
        setLocationStatus('denied')
        setStatus('Could not access location. Check browser permissions.')
      }
    }

    initLocation()
    return () => {
      cancelled.current = true
      if (watchIdRef.current != null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      watchIdRef.current = null
    }
  }, [])

  useEffect(() => {
    const needsPermission = !!(window.DeviceOrientationEvent &&
      typeof window.DeviceOrientationEvent.requestPermission === 'function')
    setNeedsCompassPermission(needsPermission)

    if (!window.DeviceOrientationEvent) {
      setCompassStatus('unavailable')
      return
    }

    if (!needsPermission) {
      const onOrient = (event: DeviceOrientationEvent) => {
        const next = headingFromOrientation(event)
        if (next !== null) {
          setHeading(next)
          setCompassStatus('granted')
        }
      }
      window.addEventListener('deviceorientation', onOrient)
      return () => window.removeEventListener('deviceorientation', onOrient)
    }
  }, [])

  const turn = useMemo(() => {
    if (bearing === null || heading === null) return null
    return signedAngle(bearing - heading)
  }, [bearing, heading])

  const aligned = turn !== null && Math.abs(turn) <= ALIGNMENT_THRESHOLD
  const instruction = makeInstruction(turn)

  useEffect(() => {
    if (bearing === null) return
    const nextStatus = {
      compassSupported: Boolean(window.DeviceOrientationEvent),
      compassPermissionNeeded: needsCompassPermission,
      compassStatus,
      locationStatus,
      bearing,
      heading,
      aligned
    }
    try {
      localStorage.setItem(STATUS_KEY, JSON.stringify(nextStatus))
    } catch {
      // Ignore status persistence failures.
    }
  }, [aligned, bearing, compassStatus, heading, locationStatus, needsCompassPermission])

  useEffect(() => {
    if (!haptics || !('vibrate' in navigator)) return
    if (aligned && !alignedRef.current) {
      navigator.vibrate?.(60)
      alignedRef.current = true
    }
    if (!aligned) alignedRef.current = false
  }, [aligned, haptics])

  async function enableCompass() {
    try {
      const permission = await window.DeviceOrientationEvent?.requestPermission?.()
      if (permission === 'granted') {
        setCompassStatus('granted')
        const onOrient = (event: DeviceOrientationEvent) => {
          const next = headingFromOrientation(event)
          if (next !== null) setHeading(next)
        }
        window.addEventListener('deviceorientation', onOrient)
      } else {
        setCompassStatus('denied')
        setStatus('Compass permission denied. You can still follow the numeric Qibla bearing.')
      }
    } catch {
      setCompassStatus('denied')
      setStatus('Compass permission failed. Check motion/orientation permissions.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-2 space-y-4">
      <div className="mx-auto flex w-fit rounded-full border border-gray-700 bg-gray-900 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('simple')}
          aria-pressed={mode === 'simple'}
          className={`rounded-full px-4 py-2 ${mode === 'simple' ? 'bg-teal-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          {mode === 'simple' ? '✓ ' : ''}Simple
        </button>
        <button
          type="button"
          onClick={() => setMode('advanced')}
          aria-pressed={mode === 'advanced'}
          className={`rounded-full px-4 py-2 ${mode === 'advanced' ? 'bg-teal-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          {mode === 'advanced' ? '✓ ' : ''}Advanced
        </button>
      </div>

      {mode === 'simple' ? (
        <SimpleQibla
          aligned={aligned}
          bearing={bearing}
          compassStatus={compassStatus}
          distanceKm={distanceKm}
          enableCompass={enableCompass}
          haptics={haptics}
          heading={heading}
          instruction={instruction}
          needsCompassPermission={needsCompassPermission}
          setHaptics={setHaptics}
          status={status}
          turn={turn}
        />
      ) : (
        <AdvancedQibla
          bearing={bearing}
          compassStatus={compassStatus}
          enableCompass={enableCompass}
          heading={heading}
          needsCompassPermission={needsCompassPermission}
          status={status}
        />
      )}
    </div>
  )
}

function SimpleQibla({
  aligned,
  bearing,
  compassStatus,
  distanceKm,
  enableCompass,
  haptics,
  heading,
  instruction,
  needsCompassPermission,
  setHaptics,
  status,
  turn
}: {
  aligned: boolean
  bearing: number | null
  compassStatus: PermissionStatusText
  distanceKm: number | null
  enableCompass: () => void
  haptics: boolean
  heading: number | null
  instruction: { muted: string; strong: string }
  needsCompassPermission: boolean
  setHaptics: (enabled: boolean) => void
  status: string
  turn: number | null
}) {
  const markerRotation = turn ?? bearing ?? 0
  const compassRotation = heading === null ? 0 : -heading

  return (
    <div className="rounded-lg bg-gray-800 px-4 py-5 text-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400">Location</div>
          <div className="mt-1 inline-flex rounded-lg bg-gray-900 px-3 py-2 text-xl font-bold text-gray-100">
            Current location
          </div>
        </div>
        <a
          href="#qibla"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-teal-300 hover:bg-gray-700"
          title="Qibla help"
        >
          i
        </a>
      </div>

      <div className="mt-10 flex flex-col items-center gap-6">
        <div className={`relative h-64 w-64 rounded-full border ${aligned ? 'border-teal-300 shadow-[0_0_28px_rgba(20,184,166,0.35)]' : 'border-amber-100/80'} bg-gray-50 text-gray-300 transition-all ring-8 ${aligned ? 'ring-teal-500/15' : 'ring-amber-200/25'}`}>
          <div
            className="absolute inset-7 rounded-full"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            <CompassLetter label="N" className="left-1/2 top-2 -translate-x-1/2" />
            <CompassLetter label="E" className="right-3 top-1/2 -translate-y-1/2" />
            <CompassLetter label="S" className="bottom-2 left-1/2 -translate-x-1/2" />
            <CompassLetter label="W" className="left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div
            className="absolute left-1/2 top-1/2 h-[286px] w-[286px] -translate-x-1/2 -translate-y-1/2"
            style={{ transform: `translate(-50%, -50%) rotate(${markerRotation}deg)` }}
          >
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-xl drop-shadow">🕋</div>
          </div>

          <div className="absolute left-1/2 top-1/2 h-24 w-6 -translate-x-1/2 -translate-y-1/2">
            <div className="mx-auto h-24 w-6 rounded-full bg-teal-500/80 shadow-[inset_0_10px_16px_rgba(255,255,255,0.28)]" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-400">
            {instruction.muted} <span className="text-teal-300">{instruction.strong}</span>
          </p>
          <p className="mt-2 text-sm text-gray-300">
            {bearing !== null ? `Qibla ${bearing.toFixed(1)}°` : 'Qibla bearing loading'}
            {heading !== null ? ` · Heading ${heading.toFixed(0)}°` : ''}
          </p>
          <p className="text-sm text-gray-400">
            {distanceKm !== null ? `${Math.round(distanceKm).toLocaleString()} km to the Ka‘bah` : 'Distance appears after location is available'}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          {needsCompassPermission && heading === null && (
            <button
              type="button"
              onClick={enableCompass}
              className="w-full rounded bg-teal-600 px-4 py-3 font-semibold hover:bg-teal-500"
            >
              Enable Compass
            </button>
          )}

          <label className="flex items-center justify-between rounded bg-gray-900 px-4 py-3 text-sm text-gray-200">
            <span>Haptic feedback when aligned</span>
            <input
              type="checkbox"
              checked={haptics}
              onChange={(event) => setHaptics(event.target.checked)}
              className="h-4 w-4 accent-teal-500"
            />
          </label>

          <p className="rounded bg-gray-900 p-3 text-xs text-gray-400">
            {compassStatus === 'unavailable' ? 'Compass sensors are not available in this browser. Use the numeric bearing.' : status}
          </p>
        </div>
      </div>
    </div>
  )
}

function AdvancedQibla({
  bearing,
  compassStatus,
  enableCompass,
  heading,
  needsCompassPermission,
  status
}: {
  bearing: number | null
  compassStatus: PermissionStatusText
  enableCompass: () => void
  heading: number | null
  needsCompassPermission: boolean
  status: string
}) {
  const needleRotation = (() => {
    if (bearing == null) return 0
    if (heading == null) return normalizeDeg(bearing)
    return normalizeDeg(bearing - heading)
  })()

  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Qibla Direction</h2>

      {bearing === null ? (
        <p>Calculating location…</p>
      ) : (
        <>
          <p>
            🕋 Qibla: <strong>{bearing.toFixed(1)}°</strong> from True North
            {heading != null && (
              <>
                {' '}· Your heading: <strong>{heading.toFixed(0)}°</strong>
              </>
            )}
          </p>

          <div className="mx-auto w-56 h-56 rounded-full border border-gray-600 relative select-none">
            <div className="absolute inset-2 rounded-full border border-gray-700" />
            <div className="absolute left-1/2 -top-3 -translate-x-1/2 text-xs">N</div>
            <div
              className="absolute left-1/2 top-1/2 w-1 h-24 bg-teal-400 origin-bottom rounded"
              style={{ transform: `translate(-50%,-100%) rotate(${needleRotation}deg)` }}
            />
            <div
              className="absolute left-1/2 top-1/2 w-1 h-10 bg-gray-500 origin-top rounded"
              style={{ transform: `translate(-50%,0) rotate(${needleRotation}deg)` }}
            />
          </div>

          {needsCompassPermission && heading == null && (
            <button
              onClick={enableCompass}
              className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white"
            >
              Enable Compass
            </button>
          )}

          <p className="text-xs text-gray-400">
            Compass status: {compassStatus}. Hold the device flat and away from metal; recalibrate compass if asked.
          </p>
          {status && <p className="text-xs text-amber-500">{status}</p>}
        </>
      )}
    </div>
  )
}

function CompassLetter({ label, className }: { label: string; className: string }) {
  return <span className={`absolute text-xl font-semibold text-gray-300/80 ${className}`}>{label}</span>
}

function headingFromOrientation(event: DeviceOrientationEvent) {
  if (typeof event.webkitCompassHeading === 'number') {
    return normalizeDeg(event.webkitCompassHeading)
  }
  if (event.absolute === true && typeof event.alpha === 'number') {
    return normalizeDeg(360 - event.alpha)
  }
  if (typeof event.alpha === 'number') {
    return normalizeDeg(360 - event.alpha)
  }
  return null
}

function makeInstruction(turn: number | null) {
  if (turn === null) return { muted: 'Enable compass to', strong: 'align' }
  const abs = Math.abs(turn)
  if (abs <= ALIGNMENT_THRESHOLD) return { muted: 'You’re facing', strong: 'Makkah' }
  if (abs <= 18) return { muted: 'Turn slightly', strong: turn > 0 ? 'right' : 'left' }
  return { muted: 'Turn to your', strong: turn > 0 ? 'right' : 'left' }
}
