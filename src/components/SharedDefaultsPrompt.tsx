import { useState } from 'react'
import {
  applySharedDefaults,
  clearSharedDefaultsHash,
  type SharedDefaults
} from '../lib/sharedDefaults'

type Props = {
  defaults: SharedDefaults
  onClose: () => void
}

export default function SharedDefaultsPrompt({ defaults, onClose }: Props) {
  const [error, setError] = useState('')

  function dismiss() {
    clearSharedDefaultsHash()
    onClose()
  }

  function apply() {
    try {
      applySharedDefaults(defaults)
      clearSharedDefaultsHash()
      window.location.reload()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'These defaults could not be applied.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="shared-defaults-title"
        className="w-full max-w-lg space-y-4 rounded-xl border border-teal-800 bg-gray-900 p-5 shadow-2xl"
      >
        <div>
          <p className="text-xs font-semibold uppercase text-teal-400">Private by design</p>
          <h2 id="shared-defaults-title" className="mt-1 text-xl font-bold text-white">Apply shared defaults?</h2>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            This link offers app preferences only. Nothing will change until you apply them. The shared prayer
            calculation will be saved as a Manual choice so it is not replaced by automatic country detection.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-gray-950 p-4 text-sm">
          <DefaultRow label="Method" value={defaults.prayer.method} />
          <DefaultRow label="Asr" value={defaults.prayer.madhab} />
          <DefaultRow label="High latitude" value={defaults.prayer.highLatRule} />
          <DefaultRow label="Language" value={defaults.preferences.language === 'ar' ? 'Arabic' : 'English'} />
          <DefaultRow label="Clock" value={clockLabel(defaults.preferences.timeFormat)} />
          <DefaultRow label="Sunnahs tile" value={defaults.preferences.showSunnah ? 'Shown' : 'Hidden'} />
          <DefaultRow label="Reminder" value={`${defaults.reminders.offsetMinutes} minutes before`} />
          <DefaultRow label="Fixed Isha" value={defaults.reminders.fixedIshaTime} />
        </dl>

        <p className="rounded-lg border border-emerald-900 bg-emerald-950/40 p-3 text-xs leading-5 text-emerald-200">
          Salah and Ramadan trackers, Quran progress and bookmarks, locations, saved cities, mosque profiles, and other personal data are never included.
        </p>

        {error && <p role="alert" className="text-sm text-amber-200">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={dismiss} className="min-h-11 rounded-lg border border-gray-700 bg-gray-800 font-semibold text-gray-200 hover:bg-gray-700">
            Not now
          </button>
          <button type="button" onClick={apply} className="min-h-11 rounded-lg bg-teal-600 font-semibold text-white hover:bg-teal-500">
            Apply defaults
          </button>
        </div>
      </section>
    </div>
  )
}

function DefaultRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-1 break-words font-medium text-gray-100">{value}</dd>
    </div>
  )
}

function clockLabel(value: SharedDefaults['preferences']['timeFormat']) {
  if (value === '12h') return 'AM/PM'
  if (value === '24h') return '24-hour'
  return 'Device default'
}
