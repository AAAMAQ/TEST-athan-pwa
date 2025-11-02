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
import SalahTracker from './features/SalahTracker'

// Primary tabs shown in the bottom nav (keep it simple for mobile)
const primaryTabs = ['Home', 'Prayer', 'Settings'] as const
type Tab = typeof primaryTabs[number]
type Screen = 'Home' | 'Prayer' | 'Settings' | 'Qibla' | 'Quran' | 'Credits' | 'Privacy' | 'Vision' | 'NeedHelp' | 'SalahTracker' | 'PrayerMonth'

export default function App() {
  // App should open on Home, not Prayer
  const [tab, setTab] = useState<Tab>('Home')
  const [screen, setScreen] = useState<Screen>('Home')

  const isPrimary = (s: Screen): s is Tab => (primaryTabs as readonly string[]).includes(s)

  // Navigate from bottom tabs
  const goTab = (t: Tab) => { setTab(t); setScreen(t) }

  // Navigate to any screen (used by Home shortcuts)
  const go = (s: string) => {
    const target = (s === 'Help' ? 'NeedHelp' : s) as Screen
    setScreen(target)
    if (isPrimary(target)) setTab(target)
  }

  const title = screen

  return (
    <div className="flex flex-col h-full">
      {/* Header with optional Back on secondary screens */}
      <header className="p-4 bg-gray-800 flex items-center justify-between">
        {!isPrimary(screen) ? (
          <button
            className="px-3 py-1 rounded bg-gray-700 text-gray-200"
            onClick={() => { setScreen('Home'); setTab('Home') }}
          >
            ← Back
          </button>
        ) : <span />}
        <h1 className="text-xl font-bold text-center flex-1">{title}</h1>
        <span className="w-[64px]" />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4">
        {screen === 'Home' && <Home go={go} />}
        {screen === 'Prayer' && <PrayerTimes />}
        {screen === 'Settings' && <Settings />}
        {screen === 'Qibla' && <Qibla />}
        {screen === 'Quran' && <Quran />}
        {screen === 'Credits' && <Credits go={go} />}
        {screen === 'Privacy' && <Privacy />}
        {screen === 'Vision' && <Vision />}
        {screen === 'NeedHelp' && <NeedHelp />}
        {/* Optional future screens */} 
        {screen === 'SalahTracker' && <SalahTracker />}
      </main>

      {/* Bottom navigation — ONLY three tabs */}
      <nav className="flex justify-around bg-gray-800 p-2">
        {primaryTabs.map(t => (
          <button
            key={t}
            onClick={() => goTab(t)}
            className={`flex-1 py-2 ${tab === t ? 'text-teal-400' : 'text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </nav>
    </div>
  )
}