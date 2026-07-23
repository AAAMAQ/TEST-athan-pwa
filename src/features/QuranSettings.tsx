import { useEffect, useState } from 'react'
import { fetchSurah } from '../lib/quran'
import { clearQuranProgress } from '../lib/quranProgress'
import {
  downloadQuranOffline,
  loadQuranOfflineStatus,
  removeQuranOfflineData,
  type QuranOfflineStatus
} from '../lib/quranOffline'
import { isQuranTranslation, QURAN_TRANSLATIONS, type QuranTranslation } from '../lib/quranProviders'

type Ayah = { number: number; text: string }
type ViewMode = 'ar' | 'ar-en'

const BOOKMARKS_KEY = 'quranBookmarks'
const FONT_SIZE_KEY = 'quranFontPct'
const VIEW_MODE_KEY = 'quranViewMode'
const TRANSLATION_KEY = 'athan.quran.translation.v1'
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function loadTranslation(): QuranTranslation['id'] {
  const stored = localStorage.getItem(TRANSLATION_KEY) || 'en.asad'
  return isQuranTranslation(stored) ? stored : 'en.asad'
}

export default function QuranSettings() {
  const [fontPct, setFontPct] = useState(() => {
    const stored = Number(localStorage.getItem(FONT_SIZE_KEY))
    return Number.isFinite(stored) && stored > 0 ? clamp(stored, 80, 180) : 100
  })
  const [mode, setMode] = useState<ViewMode>(() => localStorage.getItem(VIEW_MODE_KEY) === 'ar' ? 'ar' : 'ar-en')
  const [edition, setEdition] = useState<QuranTranslation['id']>(loadTranslation)
  const [arabicPreview, setArabicPreview] = useState<Ayah[]>([])
  const [englishPreview, setEnglishPreview] = useState<Ayah[]>([])
  const [previewLoading, setPreviewLoading] = useState(true)
  const [offlineStatus, setOfflineStatus] = useState<QuranOfflineStatus>(loadQuranOfflineStatus)
  const [offlineMessage, setOfflineMessage] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => localStorage.setItem(FONT_SIZE_KEY, String(fontPct)), [fontPct])
  useEffect(() => localStorage.setItem(VIEW_MODE_KEY, mode), [mode])

  useEffect(() => {
    localStorage.setItem(TRANSLATION_KEY, edition)
    setPreviewLoading(true)
    fetchSurah(1, edition)
      .then((result) => {
        setArabicPreview(result.arabic.slice(0, 5))
        setEnglishPreview(result.english.slice(0, 5))
      })
      .catch(() => {
        setArabicPreview([])
        setEnglishPreview([])
      })
      .finally(() => setPreviewLoading(false))
  }, [edition])

  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(() => setMessage(''), 4500)
    return () => window.clearTimeout(timeout)
  }, [message])

  async function downloadOffline() {
    setDownloading(true)
    setOfflineMessage('Preparing offline Quran…')
    try {
      const next = await downloadQuranOffline(({ current, total }) => {
        setOfflineMessage(`Checking Surah ${current} of ${total}…`)
      }, edition)
      setOfflineStatus(next)
      setOfflineMessage(next.complete
        ? 'Quran is ready for offline reading.'
        : next.error || 'Some Surahs remain. Tap Download again to resume.')
    } catch {
      setOfflineStatus(loadQuranOfflineStatus())
      setOfflineMessage('The download could not start. Check storage access and try again.')
    } finally {
      setDownloading(false)
    }
  }

  async function removeOffline() {
    if (!window.confirm('Remove downloaded Quran text? Reading progress and bookmarks will stay.')) return
    setOfflineStatus(await removeQuranOfflineData())
    setOfflineMessage('Offline Quran text removed. Your progress and bookmarks were kept.')
  }

  function clearProgress() {
    if (!window.confirm('Clear Quran reading progress on this device? Bookmarks will stay.')) return
    clearQuranProgress()
    setMessage('Quran reading progress was cleared.')
  }

  function clearBookmarks() {
    let count = 0
    try {
      const parsed = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]')
      count = Array.isArray(parsed) ? parsed.length : 0
    } catch {
      count = 0
    }
    if (!count) {
      setMessage('There are no bookmarks to clear.')
      return
    }
    if (!window.confirm(`Clear all ${count} Quran bookmark${count === 1 ? '' : 's'}?`)) return
    localStorage.setItem(BOOKMARKS_KEY, '[]')
    setMessage('All Quran bookmarks were cleared.')
  }

  const currentTranslation = QURAN_TRANSLATIONS.find((item) => item.id === edition) ?? QURAN_TRANSLATIONS[0]

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      <header className="px-1">
        <h2 className="text-2xl font-bold text-white">Quran Settings</h2>
        <p className="mt-1 text-sm text-gray-400">Choose a comfortable reading view and manage offline text.</p>
      </header>

      <section className="rounded-lg border border-gray-700 bg-gray-800/80 p-4">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="quran-font-size" className="text-sm font-medium text-gray-200">Font size</label>
          <span className="text-xs font-semibold text-teal-300">{fontPct}%</span>
        </div>
        <input id="quran-font-size" type="range" min="80" max="180" step="10" value={fontPct} onChange={(event) => setFontPct(Number(event.target.value))} className="w-full accent-teal-500" />
        <p className="mt-4 mb-2 text-sm font-medium text-gray-200">Reading view</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setMode('ar-en')} className={`min-h-11 rounded-md px-3 text-sm ${mode === 'ar-en' ? 'bg-teal-600 text-white' : 'bg-gray-900 text-gray-300'}`}>Arabic + English</button>
          <button type="button" onClick={() => setMode('ar')} className={`min-h-11 rounded-md px-3 text-sm ${mode === 'ar' ? 'bg-teal-600 text-white' : 'bg-gray-900 text-gray-300'}`}>Arabic only</button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-700 bg-gray-800/80 p-4">
        <h3 className="font-semibold text-white">Translation / Tafsir</h3>
        <p className="mt-1 text-xs leading-5 text-gray-400">Compare five Ayahs before choosing a translation.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {QURAN_TRANSLATIONS.map((translation) => (
            <button key={translation.id} type="button" onClick={() => setEdition(translation.id)} className={`rounded-md border p-3 text-left ${edition === translation.id ? 'border-teal-500 bg-teal-950/40' : 'border-gray-700 bg-gray-900/50'}`}>
              <span className="block text-sm font-semibold text-white">{translation.label}</span>
              <span className="mt-1 block text-xs leading-5 text-gray-400">{translation.description}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-4 rounded-md border border-gray-700 bg-gray-950/60 p-3">
          <p className="text-xs font-semibold text-teal-300">{currentTranslation.label} preview · Al-Fatihah 1–5</p>
          {previewLoading ? <p className="text-sm text-gray-400">Loading preview…</p> : englishPreview.length ? englishPreview.map((ayah, index) => (
            <article key={ayah.number} className="border-b border-gray-800 pb-3 last:border-0 last:pb-0">
              <p dir="rtl" className="text-right text-xl leading-loose text-gray-100">{arabicPreview[index]?.text}</p>
              <p className="mt-2 text-sm leading-6 text-gray-300"><span className="text-teal-400">{ayah.number}.</span> {ayah.text}</p>
            </article>
          )) : <p className="text-sm text-amber-200">Connect once to load this translation preview.</p>}
        </div>
      </section>

      <section className="rounded-lg border border-gray-700 bg-gray-800/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">Offline Quran</h3>
            <p className="mt-1 text-xs text-gray-400">Saved only in this browser.</p>
          </div>
          <span className="text-xs text-gray-400">{offlineStatus.complete ? 'Downloaded' : `${offlineStatus.downloadedSurahs}/114`}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button disabled={downloading} type="button" onClick={downloadOffline} className="min-h-11 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white disabled:opacity-60">
            {downloading ? 'Downloading…' : offlineStatus.available ? 'Resume Download' : 'Download All Surahs'}
          </button>
          {offlineStatus.available && <button disabled={downloading} type="button" onClick={removeOffline} className="min-h-11 rounded-md bg-gray-900 px-4 text-sm text-gray-200">Remove Download</button>}
        </div>
        {offlineMessage && <p role="status" className="mt-3 text-xs leading-5 text-teal-300">{offlineMessage}</p>}
      </section>

      <section className="rounded-lg border border-gray-700 bg-gray-800/80 p-4">
        <h3 className="font-semibold text-white">Reading data</h3>
        <p className="mt-1 text-xs leading-5 text-gray-400">These actions affect Quran data only.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={clearProgress} className="min-h-10 rounded-md bg-gray-900 px-3 text-sm text-gray-200">Reset Progress</button>
          <button type="button" onClick={clearBookmarks} className="min-h-10 rounded-md bg-gray-900 px-3 text-sm text-gray-200 hover:bg-red-950/60">Clear Bookmarks</button>
        </div>
        {message && <p role="status" className="mt-3 rounded-md bg-gray-950 px-3 py-2 text-xs text-teal-200">{message}</p>}
      </section>
    </div>
  )
}
