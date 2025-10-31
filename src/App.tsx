// src/App.tsx
import { useState } from 'react'
import PrayerTimes from './features/PrayerTimes'
import Qibla from './features/Qibla'
import Quran from './features/Quran'
import Settings from './features/Settings'
import Home from './features/Home'
import Credits from './features/Credits'
import Privacy from './features/Privacy'
import Vision from './features/Vision'
import NeedHelp from './features/NeedHelp'

// near your tab definitions in App.tsx
const tabs = [
  'Home',
  'Prayer',
  'Qibla',
  'Quran',
  'Settings',
  'Credits',
  'Privacy',
  'Vision',
  'NeedHelp',
  'SalahTracker',
  'PrayerMonth'
] as const

export type TabName = typeof tabs[number]

export default function App() {
  const [tab, setTab] = useState<TabName>('Prayer')

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 text-center bg-gray-800">
        <h1 className="text-xl font-bold">Athan PWA</h1>
      </header>

      <main className="flex-1 overflow-auto p-4">
        {tab === 'Prayer' && <PrayerTimes />}
        {tab === 'Qibla' && <Qibla />}
        {tab === 'Quran' && <Quran />}
        {tab === 'Settings' && <Settings />}
        {tab === 'Credits' && <Credits />}
        {tab === 'Privacy' && <Privacy />}
        {tab === 'Vision' && <Vision />}
        {tab === 'NeedHelp' && <NeedHelp />}
        {tab === 'Home' && <Home go={(t) => setTab(t)} />}
      </main>

      <nav className="flex justify-around bg-gray-800 p-2">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 ${tab === t ? 'text-teal-400' : 'text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </nav>
    </div>
  )
}