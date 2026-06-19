import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(() => window.matchMedia?.('(display-mode: standalone)').matches ?? false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      setMessage('Athan PWA is installed.')
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function installApp() {
    if (!installPrompt) {
      setMessage('On iOS Safari, use Share, then Add to Home Screen.')
      return
    }
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    setMessage(choice.outcome === 'accepted' ? 'Install started.' : 'Install dismissed.')
    setInstallPrompt(null)
  }

  async function updateApp() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.update()))
      }
      setMessage('Checked for updates. Reload if your browser downloaded a new version.')
    } catch {
      setMessage('Could not check for updates right now.')
    }
  }

  return (
    <section className="rounded-lg bg-gray-800 p-4 space-y-3">
      <div>
        <h3 className="font-semibold">PWA Status</h3>
        <p className="text-xs text-gray-400">
          {online ? 'You are online.' : 'You are offline. Saved features remain available.'} {installed ? 'Installed mode detected.' : 'Install Athan PWA for quicker access.'}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={installApp} className="rounded bg-teal-600 hover:bg-teal-500 px-3 py-2 text-sm font-semibold">
          Install Athan PWA
        </button>
        <button type="button" onClick={updateApp} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">
          Check for Update
        </button>
      </div>
      {message && <p className="rounded bg-gray-900 p-2 text-xs text-teal-300">{message}</p>}
    </section>
  )
}
