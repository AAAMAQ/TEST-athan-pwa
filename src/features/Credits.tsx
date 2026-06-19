// src/features/Credits.tsx
import { useState } from 'react'
type Props = {
  /** Optional navigation helper from App (screen name: 'NeedHelp' | 'Vision' | 'Privacy') */
  go?: (screen: string) => void
}

export default function Credits({ go }: Props) {
  const [shared, setShared] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState('')

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com'
  const buyMeACoffee = 'https://buymeacoffee.com/bigmaqstudio'

  async function onShare() {
    const shareData = {
      title: 'Athan PWA',
      text: 'Check out Athan PWA — prayer times, Qibla, and Quran in a clean, fast app.',
      url: appUrl,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setShared('Shared!')
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
        setShared('Link copied to clipboard')
      } else {
        setShared('Copy this link: ' + shareData.url)
      }
      setTimeout(() => setShared(null), 2000)
    } catch {
      // user canceled share; ignore
    }
  }

  async function updateApp() {
    setUpdateStatus('Checking for update…')

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.unregister()))
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      }

      setUpdateStatus('Reloading latest version…')
      window.setTimeout(() => window.location.reload(), 250)
    } catch (error) {
      console.error('Failed to update app', error)
      setUpdateStatus('Could not fully clear cache. Reloading anyway.')
      window.setTimeout(() => window.location.reload(), 600)
    }
  }

  const goOrHash = (screen: string) => {
    if (go) return go(screen)
    // Fallback: update hash so App can optionally listen in future
    window.location.hash = `#${screen}`
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Credits</h1>
        <p className="text-gray-300">Athan PWA is a lightweight, fast Islamic app designed for daily use — showing accurate prayer times, Qibla direction, full Quran in Uthmani script, and a Salah tracker. Works offline, privacy-friendly, and takes almost no storage.</p>
      </header>

      <section className="bg-gray-800 rounded-lg p-4 space-y-2">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-200">
          <p><span className="font-semibold">App:</span> Athan PWA App</p>
          <p><span className="font-semibold">Version:</span> v3.0.0</p>
          <p><span className="font-semibold">Date of Current Version:</span> June 19, 2026</p>
          <p><span className="font-semibold">Latest Update:</span> Unified v3.0.0 app update with Qibla modes, Saved Cities and Travel Mode, Quran progress/offline controls, Masjid/Iqama integration, PWA status, timetable exports, and v3 help updates.</p>
          <p><span className="font-semibold">Company:</span> BiG MAQ Studio</p>
          <p><span className="font-semibold">Copyright:</span> The content of this software is copyrighted © {new Date().getFullYear()} by BiG MAQ Studio. All rights reserved. The software code and accompanying documentation are protected by copyright law, prohibiting unauthorized reproduction or distribution without the explicit permission of the copyright owner.</p>
        </div>
      </section>

      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h2 className="text-xl font-semibold">Support the Project</h2>
        <p className="text-gray-300">If this app helps you, consider buying me a coffee.</p>
        <a
          className="inline-block px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white"
          href={buyMeACoffee}
          target="_blank"
          rel="noreferrer"
        >
          Buy Me a Coffee
        </a>
      </section>

      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h2 className="text-xl font-semibold">Update</h2>
        <p className="text-gray-300 text-sm">
          Check for the latest version of Athan PWA and reload the app when available.
        </p>
        <button
          type="button"
          onClick={updateApp}
          className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold"
        >
          Update
        </button>
        {updateStatus && <p className="text-sm text-teal-300">{updateStatus}</p>}
        <p className="text-xs text-gray-400">
          This refreshes the app shell and caches only. Your prayer settings, Iqama settings, Quran bookmarks, and tracker data stay on this device.
        </p>
      </section>

      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h2 className="text-xl font-semibold">More</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
            onClick={() => goOrHash('NeedHelp')}
          >
            Need Help
          </button>
          <button
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
            onClick={() => goOrHash('Vision')}
          >
            Our Vision
          </button>
          <button
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
            onClick={() => goOrHash('Privacy')}
          >
            Privacy
          </button>
          <button
            className="px-3 py-2 rounded bg-teal-700 hover:bg-teal-600 text-white"
            onClick={onShare}
          >
            Share App
          </button>
        </div>
        {shared && <p className="text-sm text-teal-300">{shared}</p>}
      </section>
      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h2 className="text-xl font-semibold">Dev Notes</h2>
        <p className="text-gray-300 text-sm">
          Small development notes about recent updates, fixes, and improvements in the app. For detailed instructions,
          troubleshooting, and feature explanations, please read the Need Help section.
        </p>

        <div className="space-y-3 text-sm text-gray-200">
          <article className="border-l-2 border-teal-500 pl-3 space-y-1">
            <p className="text-xs text-gray-400">June 19, 2026</p>
            <h3 className="font-semibold text-teal-300">Version v3.0.0 — Unified app update</h3>
            <p>
              Version v3.0.0 brings major improvements across Athan PWA, including Saved Cities and Travel Mode,
              automatic country-based prayer settings, manual prayer corrections, smarter Quran progress, Quran offline
              support controls, improved Qibla modes and calibration guidance, Masjid and Iqama integration, expanded
              calendar and timetable exports, Salah insights, Friday Jumu’ah updates, PWA improvements, visual
              consistency, performance optimization, and bug fixes.
            </p>
            <p>
              Some advanced Quran study features, such as bundled Tafsir, word-by-word data, and recitation providers,
              now have safe UI structure but still need real datasets or provider configuration in a future update.
            </p>
          </article>

          <article className="border-l-2 border-teal-500 pl-3 space-y-1">
            <p className="text-xs text-gray-400">June 17, 2026</p>
            <h3 className="font-semibold text-teal-300">Version v2.03.0 release</h3>
            <p>
              Refreshed the PWA icon set with proper install, maskable, Apple touch, and favicon assets. Added a Credits
              page Update button so users can clear the app shell cache and reload the latest deployed version without
              deleting local settings or tracker data.
            </p>
            <p>
              Added Iqama calendar export for local device prayer times, including date ranges, included-prayer controls,
              fixed-time and Athan-offset rules, and optional Friday morning Jumu’ah reminders. The local Prayer Times
              screen now shows Jumu’ah instead of Dhuhr on Fridays as a display-only label.
            </p>
            <p>
              Started basic language preference support with English, Arabic, Urdu, and Hindi for core navigation and
              prayer labels, saved privately on the device for future translation expansion.
            </p>
          </article>

          <article className="border-l-2 border-teal-500 pl-3 space-y-1">
            <p className="text-xs text-gray-400">May 29, 2026</p>
            <h3 className="font-semibold text-teal-300">Iqama Times update</h3>
            <p>
              Added early Iqama Times support inside Advanced Athan. Users can now set Iqama rules for each prayer using
              either minutes after Athan or a fixed time, with AM/PM and 24-hour display options. This feature is still
              being improved and currently focuses on local device prayer times.
            </p>
          </article>
          <article className="border-l-2 border-teal-500 pl-3 space-y-1">
            <p className="text-xs text-gray-400">May 18, 2026</p>
            <h3 className="font-semibold text-teal-300">Version v2.01.1 and URL update</h3>
            <p>
              Reached a new update milestone with version v2.01.1. The public app URL/domain is being updated so the
              app can move away from the older test link and use a cleaner release address.
            </p>
          </article>

          <article className="border-l-2 border-teal-500 pl-3 space-y-1">
            <p className="text-xs text-gray-400">May 18, 2026</p>
            <h3 className="font-semibold text-teal-300">Advanced Athan improvements</h3>
            <p>
              Added support for searching locations, previewing prayer times, choosing calculation settings, and exporting
              custom calendar reminder files for selected date ranges.
            </p>
          </article>

          <article className="border-l-2 border-teal-500 pl-3 space-y-1">
            <p className="text-xs text-gray-400">May 18, 2026</p>
            <h3 className="font-semibold text-teal-300">Location and timezone handling</h3>
            <p>
              Improved searched-location handling so Advanced Athan can better display prayer times for different cities
              and countries instead of relying only on the user&apos;s current device location.
            </p>
          </article>

          <article className="border-l-2 border-teal-500 pl-3 space-y-1">
            <p className="text-xs text-gray-400">May 18, 2026</p>
            <h3 className="font-semibold text-teal-300">Calendar reminder export</h3>
            <p>
              Updated the custom .ics export experience so users can create calendar reminders for a chosen location,
              calculation method, Madhab, reminder offset, and date range.
            </p>
          </article>
        </div>
      </section>
      <section className="text-center text-sm text-gray-500 mt-6 font-bold">
        <p>© {new Date().getFullYear()} BiG MAQ Studio. All rights reserved.</p>
        <p>Install Athan PWA by opening it in your browser, tapping Share/Menu, and choosing Add to Home Screen.</p>
        </section> 
    </div>

  )
}
