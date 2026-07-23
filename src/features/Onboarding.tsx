import { useState } from 'react'

const ONBOARDING_KEY = 'athan.onboarding.completed.v2'

type Props = {
  go?: (screen: string) => void
}

const STEPS = [
  {
    title: 'Prayer times that fit your location',
    body: 'Allow location access, then use Auto in Settings to choose the calculation method and high-latitude rule commonly used in your country.',
    action: 'Open Settings',
    screen: 'Settings',
    preview: 'prayer'
  },
  {
    title: 'Keep useful places ready',
    body: 'Save cities for travel, choose a method, and apply signed minute corrections when a local timetable differs.',
    action: 'Open City Mode',
    screen: 'SavedCities',
    preview: 'cities'
  },
  {
    title: 'Read without losing your place',
    body: 'Quran remembers your last ayah, recent Surahs, bookmarks, font size, and selected English translation on this device.',
    action: 'Open Quran',
    screen: 'Quran',
    preview: 'quran'
  },
  {
    title: 'Find Qibla with confidence',
    body: 'Simple mode gives clear turn guidance. Advanced mode shows the numeric bearing. Enable motion access and calibrate away from metal.',
    action: 'Open Qibla',
    screen: 'Qibla',
    preview: 'qibla'
  },
  {
    title: 'Private by design',
    body: 'Prayer, Quran, tracker, Iqama, mosque, and Ramadan settings stay local. Backup and Restore lets you carry them to another device.',
    action: 'Finish',
    screen: 'Home',
    preview: 'privacy'
  }
] as const

export default function Onboarding({ go }: Props) {
  const [step, setStep] = useState(0)
  const item = STEPS[step]

  function finish(target = 'Home') {
    try {
      localStorage.setItem(ONBOARDING_KEY, new Date().toISOString())
    } catch {
      // The walkthrough remains usable when storage is restricted.
    }
    go?.(target)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Guide {step + 1} of {STEPS.length}</span>
        <button type="button" onClick={() => finish()} className="rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800">Skip</button>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
        <div className="h-full rounded-full bg-teal-400 transition-[width]" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <section className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
        <OnboardingPreview kind={item.preview} />
        <div className="space-y-3 p-5">
          <h2 className="text-xl font-bold">{item.title}</h2>
          <p className="text-sm leading-6 text-gray-300">{item.body}</p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          className="min-h-11 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-semibold disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => step === STEPS.length - 1 ? finish() : setStep((current) => current + 1)}
          className="min-h-11 rounded-lg bg-teal-600 px-4 py-2 font-semibold hover:bg-teal-500"
        >
          {step === STEPS.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>

      {step < STEPS.length - 1 && (
        <button type="button" onClick={() => finish(item.screen)} className="w-full rounded-lg px-4 py-2 text-sm text-teal-300 hover:bg-gray-800">
          {item.action} now
        </button>
      )}
    </div>
  )
}

function OnboardingPreview({ kind }: { kind: typeof STEPS[number]['preview'] }) {
  const content = {
    prayer: ['Auto method', 'MWL · Early Asr', 'Location matched'],
    cities: ['Chennai  +2 min', 'Makkah  -1 min', 'London  Auto'],
    quran: ['Continue: Al-Baqarah 2:45', 'Bookmarks', 'Translation'],
    qibla: ['W  ·  🕋  ·  N', 'Turn slightly right', 'Bearing 292°'],
    privacy: ['On-device storage', 'No account', 'Export backup']
  }[kind]

  return (
    <div className="border-b border-gray-700 bg-gray-950/80 p-5" aria-label="Feature preview">
      <div className="mx-auto max-w-sm rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-xl">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          <span className="h-2 w-2 rounded-full bg-amber-200" />
          <span className="h-2 w-2 rounded-full bg-gray-600" />
        </div>
        <div className="space-y-2">
          {content.map((line, index) => (
            <div key={line} className={`rounded-md border border-gray-700 px-3 py-2 text-sm ${index === 0 ? 'bg-teal-950/60 text-teal-200' : 'bg-gray-800 text-gray-300'}`}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
