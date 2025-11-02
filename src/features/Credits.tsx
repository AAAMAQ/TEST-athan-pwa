// src/features/Credits.tsx
import { useState } from 'react'
type Props = {
  /** Optional navigation helper from App (screen name: 'NeedHelp' | 'Vision' | 'Privacy') */
  go?: (screen: string) => void
}

export default function Credits({ go }: Props) {
  const [shared, setShared] = useState<string | null>(null)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com'
  const buyMeACoffee = 'https://www.buymeacoffee.com/your-temp-link'

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

  const goOrHash = (screen: string) => {
    if (go) return go(screen)
    // Fallback: update hash so App can optionally listen in future
    window.location.hash = `#${screen}`
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Credits</h1>
        <p className="text-gray-300">Athan PWA — lightweight, privacy-friendly, and built for daily use.</p>
      </header>

      <section className="bg-gray-800 rounded-lg p-4 space-y-2">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-200">
          <p><span className="font-semibold">App:</span> Free Athan PWA</p>
          <p><span className="font-semibold">Version:</span> v1.01.1</p>
          <p><span className="font-semibold">Company:</span> BiG MAQ Studio</p>
          <p><span className="font-semibold">Copyright:</span> © {new Date().getFullYear()} All rights reserved.</p>
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
    </div>
  )
}