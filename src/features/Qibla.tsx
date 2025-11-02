import { useEffect, useRef, useState } from 'react'
import { getUserLocation } from '../lib/location'

declare global {
  interface DeviceOrientationEvent {
    /** iOS Safari: heading relative to true north in degrees (0..360) */
    webkitCompassHeading?: number
  }
  interface DeviceOrientationEventConstructor {
    // iOS Safari permission API
    requestPermission?: () => Promise<'granted' | 'denied'>
  }
  interface Window {
    DeviceOrientationEvent?: DeviceOrientationEventConstructor
  }
}

// Great-circle initial bearing from point (lat, lon) to Kaaba (21.4225, 39.8262)
function bearingToKaaba(lat: number, lon: number) {
  const K = { lat: 21.4225, lon: 39.8262 }
  const φ1 = (lat * Math.PI) / 180
  const φ2 = (K.lat * Math.PI) / 180
  const Δλ = ((K.lon - lon) * Math.PI) / 180
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const θ = (Math.atan2(y, x) * 180) / Math.PI
  const brg = θ < 0 ? θ + 360 : θ
  return brg // degrees from TRUE north
}

function normalizeDeg(d: number) {
  let x = d % 360
  if (x < 0) x += 360
  return x
}

export default function Qibla() {
  const [bearing, setBearing] = useState<number | null>(null) // TRUE bearing to Kaaba
  const [heading, setHeading] = useState<number | null>(null) // device heading relative to TRUE north (degrees)
  const [status, setStatus] = useState<string>('')
  const [needsCompassPermission, setNeedsCompassPermission] = useState<boolean>(false)
  const watchIdRef = useRef<number | null>(null)

  // 1) Keep location fresh; recompute Qibla bearing as user moves
  useEffect(() => {
    const cancelled = { current: false }
    async function initLocation() {
      try {
        const loc = await getUserLocation()
        if (!loc) {
          setStatus('Location unavailable. Please allow location access.')
          return
        }
        if (!cancelled.current) {
          const { latitude, longitude } = loc.coords
          setBearing(bearingToKaaba(latitude, longitude))
        }

        // Also watch for movement
        if ('geolocation' in navigator) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              if (cancelled.current) return
              const { latitude, longitude } = pos.coords
              setBearing(bearingToKaaba(latitude, longitude))
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
          )
        }
      } catch {
        setStatus('Could not access location. Check permissions in browser settings.')
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

  // 2) Listen to device orientation to rotate needle as the device moves
  useEffect(() => {
    // iOS Safari requires user gesture permission
    const needsPermission = !!(window.DeviceOrientationEvent &&
      typeof window.DeviceOrientationEvent.requestPermission === 'function')
    setNeedsCompassPermission(needsPermission)

    // If permission is not required (Android/desktop), attach listener immediately
    if (!needsPermission) {
      const onOrient = (ev: DeviceOrientationEvent) => {
        // iOS Safari provides webkitCompassHeading already relative to TRUE north
        if (typeof ev.webkitCompassHeading === 'number') {
          setHeading(normalizeDeg(ev.webkitCompassHeading))
          return
        }
        // Some browsers provide absolute alpha = 0 at TRUE north, increasing clockwise
        if (ev.absolute === true && typeof ev.alpha === 'number') {
          // Convert alpha (0..360, clockwise from N) to heading degrees from TRUE north
          // Many implementations need 360 - alpha to match compass bearing
          setHeading(normalizeDeg(360 - ev.alpha))
          return
        }
        // Fallback: if we only get alpha, still try the common conversion
        if (typeof ev.alpha === 'number') {
          setHeading(normalizeDeg(360 - ev.alpha))
        }
      }
      window.addEventListener('deviceorientation', onOrient)
      return () => window.removeEventListener('deviceorientation', onOrient)
    }
  }, [])

  async function enableCompass() {
    try {
      const perm = await window.DeviceOrientationEvent?.requestPermission?.()
      if (perm === 'granted') {
        const onOrient = (ev: DeviceOrientationEvent) => {
          if (typeof ev.webkitCompassHeading === 'number') {
            setHeading(normalizeDeg(ev.webkitCompassHeading))
            return
          }
          if (ev.absolute === true && typeof ev.alpha === 'number') {
            setHeading(normalizeDeg(360 - ev.alpha))
            return
          }
          if (typeof ev.alpha === 'number') {
            setHeading(normalizeDeg(360 - ev.alpha))
          }
        }
        window.addEventListener('deviceorientation', onOrient)
      } else {
        setStatus('Compass permission denied. You can still follow the numeric bearing.')
      }
    } catch {
      setStatus('Compass permission flow failed. Try in Safari on iOS or Chrome on Android.')
    }
  }

  // Rotation logic:
  // If we have a device heading (TRUE-north referenced), rotate the needle by (bearing - heading)
  // Otherwise, show a static needle pointing to the TRUE bearing
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
            {/* dial */}
            <div className="absolute inset-2 rounded-full border border-gray-700" />
            {/* N marker */}
            <div className="absolute left-1/2 -top-3 -translate-x-1/2 text-xs">N</div>
            {/* Needle to Qibla (teal) */}
            <div
              className="absolute left-1/2 top-1/2 w-1 h-24 bg-teal-400 origin-bottom rounded"
              style={{ transform: `translate(-50%,-100%) rotate(${needleRotation}deg)` }}
            />
            {/* Tail */}
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
            Tip: hold the device flat and away from metal; recalibrate compass if asked.
          </p>
          {status && <p className="text-xs text-amber-500">{status}</p>}
        </>
      )}
    </div>
  )
}