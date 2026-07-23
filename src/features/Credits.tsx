import { useEffect, useState } from 'react'
import { formatDevNoteDate, loadDevNotes, type DevNote } from '../lib/devNotes'
import { refreshAthanApp, requestPwaInstall } from '../lib/pwa'
import { ATHAN_RELEASE } from '../lib/release'

type Props = {
  go?: (screen: string) => void
  backTarget?: string
}

export default function Credits({ go, backTarget }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState('')
  const [devNotes, setDevNotes] = useState<DevNote[]>([])
  const [devNotesError, setDevNotesError] = useState('')
  const [showAllNotes, setShowAllNotes] = useState(false)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const buyMeACoffee = 'https://buymeacoffee.com/bigmaqstudio'
  const visibleNotes = showAllNotes ? devNotes : devNotes.slice(0, 3)

  useEffect(() => {
    const controller = new AbortController()

    loadDevNotes(controller.signal)
      .then(setDevNotes)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Failed to load dev notes', error)
        setDevNotesError('Release notes could not be loaded right now.')
      })

    return () => controller.abort()
  }, [])

  async function shareApp(fallbackMessage = 'Link copied to clipboard.') {
    const shareData = {
      title: 'Athan PWA',
      text: 'Athan PWA keeps prayer times, Qibla, Quran, and daily tracking private and close at hand.',
      url: appUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setMessage('Shared Athan PWA.')
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
        setMessage(fallbackMessage)
      } else {
        setMessage(`Open your browser menu to share or install Athan PWA: ${shareData.url}`)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setMessage('Sharing is not available right now.')
    }
  }

  async function installApp() {
    try {
      const result = await requestPwaInstall()
      if (result === 'accepted') setMessage('Install started.')
      if (result === 'dismissed') setMessage('Install dismissed. You can try again later.')
      if (result === 'shared') setMessage('Use your device options to add Athan PWA to your Home Screen.')
      if (result === 'guidance') {
        setMessage('Open your browser menu, then choose Install App or Add to Home Screen.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setMessage('The install options could not be opened right now.')
    }
  }

  async function updateApp() {
    await refreshAthanApp((status) => {
      if (status === 'checking') setUpdateStatus('Checking for update…')
      if (status === 'reloading') setUpdateStatus('Reloading latest version…')
      if (status === 'fallback') setUpdateStatus('Could not fully clear cache. Reloading anyway.')
    })
  }

  function goOrHash(screen: string) {
    if (go) {
      go(screen)
      return
    }
    window.location.hash = `#${screen}`
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4">
      {go && backTarget && (
        <button
          type="button"
          onClick={() => go(backTarget)}
          className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:border-teal-700 hover:text-teal-300"
        >
          ← Back
        </button>
      )}

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase text-teal-400">About the app</p>
        <h1 className="text-2xl font-bold">Credits</h1>
        <p className="text-sm leading-6 text-gray-300">
          Athan PWA is a lightweight Islamic utility for prayer times, Qibla, Quran, Iqama, and daily
          tracking. It is built to remain useful offline without accounts, ads, or analytics.
        </p>
      </header>

      <section className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-400">Current version</p>
            <p className="font-semibold text-teal-300">
              v{ATHAN_RELEASE.version.replace(/^v/, '')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Release date</p>
            <p className="font-semibold text-gray-100">{formatDevNoteDate(ATHAN_RELEASE.updatedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Developer</p>
            <p className="font-semibold text-gray-100">BiG MAQ Studio</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Privacy</p>
            <p className="font-semibold text-gray-100">Local-first and ad-free</p>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <div>
          <h2 className="text-lg font-semibold">Keep Athan PWA close</h2>
          <p className="mt-1 text-sm text-gray-300">
            Install the app when your browser offers it. Otherwise, the install action opens your device&apos;s native
            Share flow so you can choose Add to Home Screen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={installApp}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
          >
            Install Athan PWA
          </button>
          <button
            type="button"
            onClick={() => shareApp()}
            className="rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-100 hover:bg-gray-600"
          >
            Share App
          </button>
        </div>
        {message && (
          <p role="status" className="rounded-md bg-gray-900 px-3 py-2 text-sm text-teal-300">
            {message}
          </p>
        )}
      </section>

      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold">Update</h2>
        <p className="text-sm text-gray-300">
          Check for the latest deployed version and refresh the app shell. Your settings, bookmarks, Iqama rules,
          and tracker data remain on this device.
        </p>
        <button
          type="button"
          onClick={updateApp}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
        >
          Check for Update
        </button>
        {updateStatus && <p role="status" className="text-sm text-teal-300">{updateStatus}</p>}
      </section>

      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold">Explore</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['NeedHelp', 'Need Help'],
            ['Vision', 'Our Vision'],
            ['Privacy', 'Privacy'],
          ].map(([screen, label]) => (
            <button
              key={screen}
              type="button"
              className="rounded-md bg-gray-700 px-3 py-2 text-sm text-gray-100 hover:bg-gray-600"
              onClick={() => goOrHash(screen)}
            >
              {label}
            </button>
          ))}
          <a
            className="rounded-md bg-gray-700 px-3 py-2 text-center text-sm text-gray-100 hover:bg-gray-600"
            href={buyMeACoffee}
            target="_blank"
            rel="noreferrer"
          >
            Support
          </a>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <div>
          <h2 className="text-lg font-semibold">Dev Notes</h2>
          <p className="mt-1 text-sm text-gray-300">
            Recent releases, fixes, and improvements. Detailed guidance remains available in Need Help.
          </p>
        </div>

        {devNotesError && <p role="alert" className="text-sm text-amber-300">{devNotesError}</p>}
        {!devNotesError && devNotes.length === 0 && (
          <p className="text-sm text-gray-400">Loading release notes…</p>
        )}

        <div className="space-y-4">
          {visibleNotes.map((note) => (
            <article key={note.id} className="space-y-2 border-l-2 border-teal-500 pl-3">
              <p className="text-xs text-gray-400">{formatDevNoteDate(note.date)}</p>
              <h3 className="font-semibold text-teal-300">
                {note.version ? `${note.version} · ` : ''}{note.title}
              </h3>
              {note.summary.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-6 text-gray-200">{paragraph}</p>
              ))}
            </article>
          ))}
        </div>

        {devNotes.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllNotes((current) => !current)}
            aria-expanded={showAllNotes}
            className="rounded-md border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-300 hover:bg-teal-950"
          >
            {showAllNotes ? 'Show Less' : 'Read More'}
          </button>
        )}
      </section>

      <footer className="space-y-1 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} BiG MAQ Studio. All rights reserved.</p>
        <p>Athan PWA keeps personal app data on your device.</p>
      </footer>
    </div>
  )
}
