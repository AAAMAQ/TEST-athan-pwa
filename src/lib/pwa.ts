import { ATHAN_RELEASE } from './release'

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallResult = 'accepted' | 'dismissed' | 'unavailable'

export const ATHAN_APP_VERSION = ATHAN_RELEASE.version
export const ATHAN_APP_UPDATED_AT = ATHAN_RELEASE.updatedAt

const INSTALLED_VERSION_KEY = 'athan.pwa.installedVersion.v1'
const LAST_UPDATE_CHECK_KEY = 'athan.pwa.lastUpdateCheck.v1'

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null
const installPromptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>()

function publishInstallPrompt(prompt: BeforeInstallPromptEvent | null) {
  deferredInstallPrompt = prompt
  installPromptListeners.forEach((listener) => listener(prompt))
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    publishInstallPrompt(event as BeforeInstallPromptEvent)
  })
  window.addEventListener('appinstalled', () => publishInstallPrompt(null))
}

export function subscribeInstallPrompt(listener: (prompt: BeforeInstallPromptEvent | null) => void): () => void {
  installPromptListeners.add(listener)
  listener(deferredInstallPrompt)
  return () => installPromptListeners.delete(listener)
}

export function isPwaInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches === true
    || ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
}

export function getInstalledVersion(): string {
  try {
    const saved = localStorage.getItem(INSTALLED_VERSION_KEY)
    if (saved) return saved
    localStorage.setItem(INSTALLED_VERSION_KEY, ATHAN_APP_VERSION)
  } catch {
    // Version display still works when storage is unavailable.
  }
  return ATHAN_APP_VERSION
}

export function getLastUpdateCheck(): string | null {
  try {
    return localStorage.getItem(LAST_UPDATE_CHECK_KEY)
  } catch {
    return null
  }
}

export async function requestPwaInstall(): Promise<InstallResult> {
  if (!deferredInstallPrompt) return 'unavailable'

  const prompt = deferredInstallPrompt
  await prompt.prompt()
  const choice = await prompt.userChoice
  publishInstallPrompt(null)
  return choice.outcome
}

export async function refreshAthanApp(
  onStatus?: (status: 'checking' | 'reloading' | 'fallback') => void
): Promise<void> {
  onStatus?.('checking')
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys()
      const appShellCaches = cacheNames.filter((cacheName) => {
        const normalized = cacheName.toLowerCase()
        return normalized !== 'quran-api' && !normalized.includes('quran')
      })
      await Promise.all(appShellCaches.map((cacheName) => caches.delete(cacheName)))
    }

    try {
      localStorage.setItem(INSTALLED_VERSION_KEY, ATHAN_APP_VERSION)
      localStorage.setItem(LAST_UPDATE_CHECK_KEY, new Date().toISOString())
    } catch {
      // Never make an update depend on localStorage.
    }

    onStatus?.('reloading')
    window.setTimeout(() => window.location.reload(), 250)
  } catch (error) {
    console.error('Failed to update Athan PWA', error)
    onStatus?.('fallback')
    window.setTimeout(() => window.location.reload(), 600)
  }
}
