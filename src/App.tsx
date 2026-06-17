// src/App.tsx
import { useEffect, useState } from 'react'
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
import AthanEngine from './features/AthanEngine'
import Iqama from './features/Iqama'
import { loadLanguage, t, type AppLanguage } from './lib/i18n'

// Primary tabs shown in the bottom nav (keep it simple for mobile)
const primaryTabs = ['Home', 'Prayer', 'Settings'] as const
type Tab = typeof primaryTabs[number]
type Screen = 'Home' | 'Prayer' | 'Settings' | 'Qibla' | 'Quran' | 'Credits' | 'Privacy' | 'Vision' | 'NeedHelp' | 'SalahTracker' | 'PrayerMonth' | 'AthanEngine' | 'Iqama'

export default function App() {
  // App should open on Home, not Prayer
  const [tab, setTab] = useState<Tab>('Home')
  const [screen, setScreen] = useState<Screen>('Home')
  const [language, setLanguage] = useState<AppLanguage>(() => loadLanguage())

  useEffect(() => {
    const onLanguageChange = () => setLanguage(loadLanguage())
    window.addEventListener('athan-language-change', onLanguageChange)
    return () => window.removeEventListener('athan-language-change', onLanguageChange)
  }, [])

  const isPrimary = (s: Screen): s is Tab => (primaryTabs as readonly string[]).includes(s)

  // Navigate from bottom tabs
  const goTab = (t: Tab) => { setTab(t); setScreen(t) }

  // Navigate to any screen (used by Home shortcuts)
  const go = (s: string) => {
    const target = (s === 'Help' ? 'NeedHelp' : s) as Screen
    setScreen(target)
    if (isPrimary(target)) setTab(target)
  }

  const screenLabels: Record<Screen, string> = {
    Home: t('home', language),
    Prayer: t('prayerTimes', language),
    Settings: t('settings', language),
    Qibla: t('qibla', language),
    Quran: t('quran', language),
    Credits: t('credits', language),
    Privacy: 'Privacy',
    Vision: 'Vision',
    NeedHelp: t('needHelp', language),
    SalahTracker: 'Salah Tracker',
    PrayerMonth: t('prayerTimes', language),
    AthanEngine: t('advancedAthan', language),
    Iqama: t('iqama', language)
  }

  const tabLabels: Record<Tab, string> = {
    Home: t('home', language),
    Prayer: t('prayer', language),
    Settings: t('settings', language)
  }

  const title = screenLabels[screen]

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
        ) : <span className="w-[64px]" />}
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
        {screen === 'AthanEngine' && <AthanEngine go={go} />}
        {screen === 'Iqama' && <Iqama go={go} />}
      </main>

      {/* Bottom navigation — ONLY three tabs */}
      <nav className="flex justify-around bg-gray-800 p-2">
        {primaryTabs.map(t => (
          <button
            key={t}
            onClick={() => goTab(t)}
            className={`flex-1 py-2 ${tab === t ? 'text-teal-400' : 'text-gray-400'}`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </nav>
    </div>
  )
}
