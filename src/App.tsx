// src/App.tsx
import { useState } from 'react'
import PrayerTimes from './features/PrayerTimes'
import Qibla from './features/Qibla'
import Quran from './features/Quran'
import Settings from './features/Settings'
import Home from './features/Home'

const tabs = ['Home','Prayer', 'Qibla', 'Quran', 'Settings'] as const

export default function App() {
  const [tab, setTab] = useState<typeof tabs[number]>('Prayer')

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