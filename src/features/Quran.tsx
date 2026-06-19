import { useEffect, useState } from 'react'
import { fetchSurahs, fetchSurah } from '../lib/quran'
import {
  clearQuranProgress,
  loadQuranProgress,
  markAyahRead,
  toggleFavoriteSurah,
  type QuranProgress
} from '../lib/quranProgress'
import { downloadQuranOffline, loadQuranOfflineStatus, removeQuranOfflineData, type QuranOfflineStatus } from '../lib/quranOffline'
import {
  RECITERS,
  fetchRecitationAudio,
  getRecitationMessage,
  getTafsirMessage,
  getWordByWordMessage,
  splitArabicWords,
  type QuranStudyMode
} from '../lib/quranProviders'

// Local view types (UI only)
type SurahItem = {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
}

type Ayah = { number: number; text: string }

type ViewMode = 'ar' | 'ar-en'

const BK_KEY = 'quranBookmarks'
const FS_KEY = 'quranFontPct'
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const keyFor = (surah: number, ayah: number) => `${surah}:${ayah}`
const parseBookmarks = (): Set<string> => {
  try { return new Set<string>(JSON.parse(localStorage.getItem(BK_KEY) || '[]')) } catch { return new Set() }
}
const saveBookmarks = (s: Set<string>) => localStorage.setItem(BK_KEY, JSON.stringify(Array.from(s)))

export default function Quran(){
  const [surahs,setSurahs]=useState<SurahItem[]>([])
  const [selected,setSelected]=useState<number| null>(1)
  const [arabic,setArabic]=useState<Ayah[]>([])
  const [english,setEnglish]=useState<Ayah[]>([])
  const [bismillah,setBismillah]=useState<string | null>(null)
  const [loading,setLoading]=useState(false)
  const [edition,setEdition]=useState('en.asad')
  const [mode,setMode]=useState<ViewMode>(() => (localStorage.getItem('quranViewMode') as ViewMode) || 'ar-en')
  const [progress,setProgress]=useState<QuranProgress>(() => loadQuranProgress())
  const [studyMode,setStudyMode]=useState<QuranStudyMode>('translation')
  const [offlineStatus,setOfflineStatus]=useState<QuranOfflineStatus>(() => loadQuranOfflineStatus())
  const [offlineMessage,setOfflineMessage]=useState('')
  const [selectedReciter,setSelectedReciter]=useState(RECITERS[0]?.id ?? 'ar.alafasy')
  const [audioUrl,setAudioUrl]=useState('')
  const [audioStatus,setAudioStatus]=useState('')
  useEffect(()=>{ localStorage.setItem('quranViewMode', mode) },[mode])

  const [bookmarks,setBookmarks]=useState<Set<string>>(()=>parseBookmarks())
  const [showOnlyBookmarks,setShowOnlyBookmarks]=useState(false)
  const [fontPct,setFontPct]=useState<number>(()=> {
    const raw = localStorage.getItem(FS_KEY)
    const n = raw ? parseInt(raw) : 100
    return Number.isFinite(n) ? clamp(n, 80, 180) : 100
  })
  useEffect(()=>{ localStorage.setItem(FS_KEY, String(fontPct)) },[fontPct])

  useEffect(()=>{(async()=>{ setSurahs(await fetchSurahs()) })()},[])
useEffect(() => {
  if (!selected) return;
  setLoading(true);
  fetchSurah(selected, edition)
    .then(r => {
      let ar = r.arabic;
      let bism: string | null = r.bismillah ?? null;

      // For all surahs except 1 and 9, ensure Bismillah is separated
      if (selected !== 1 && selected !== 9 && ar.length > 0) {
        const firstText = ar[0].text || '';

        if (bism && firstText.startsWith(bism)) {
          // If the text from the API/lib still has Bismillah prefixed to ayah 1,
          // strip it out so Bismillah appears only in the header.
          const rest = firstText.slice(bism.length).trimStart();
          ar = [{ ...ar[0], text: rest || ar[0].text }, ...ar.slice(1)];
        } else if (!bism && firstText.length >= 38) {
          // Fallback: treat the first 38 characters of ayah 1 as Bismillah.
          const b = firstText.slice(0, 38);
          const rest = firstText.slice(38).trimStart();
          bism = b;
          ar = [{ ...ar[0], text: rest || ar[0].text }, ...ar.slice(1)];
        }
      }

      setArabic(ar);
      setEnglish(r.english);
      setBismillah(bism);
    })
    .finally(() => setLoading(false));
}, [selected, edition]);

  const isBookmarked = (s: number, a: number) => bookmarks.has(keyFor(s,a))
  const toggleBookmark = (s: number, a: number) => {
    const k = keyFor(s,a)
    const next = new Set(bookmarks)
    if (next.has(k)) next.delete(k); else next.add(k)
    setBookmarks(next); saveBookmarks(next)
  }
  const clearBookmarks = () => { const empty = new Set<string>(); setBookmarks(empty); saveBookmarks(empty) }
  const selectedSurah = surahs.find((surah) => surah.number === selected)
  const continueSurah = progress.lastReadSurah ? surahs.find((surah) => surah.number === progress.lastReadSurah) : null
  const currentSurahProgress = selected ? progress.perSurahProgress[String(selected)] : null
  const fallbackStudyAyah = selected === progress.lastReadSurah ? progress.lastReadAyah : 1
  const studyAyahNumber = currentSurahProgress?.lastAyah ?? fallbackStudyAyah ?? 1
  const studyAyah = arabic.find((ayah) => ayah.number === studyAyahNumber) ?? arabic[0] ?? null
  const studyWords = splitArabicWords(studyAyah?.text ?? '')

  function recordRead(ayah: number) {
    if (!selected) return
    setProgress(markAyahRead(selected, ayah, selectedSurah?.englishName, selectedSurah?.numberOfAyahs))
  }

  function continueReading() {
    if (!progress.lastReadSurah) return
    setSelected(progress.lastReadSurah)
    window.setTimeout(() => {
      const target = document.getElementById(`ayah-${progress.lastReadSurah}-${progress.lastReadAyah}`)
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 500)
  }

  function toggleFavorite() {
    if (!selected) return
    setProgress(toggleFavoriteSurah(selected))
  }

  async function downloadOffline() {
    try {
      setOfflineMessage('Preparing Quran offline download…')
      const status = await downloadQuranOffline((item) => {
        setOfflineMessage(`Downloading Surahs: ${item.current} of ${item.total}`)
      })
      setOfflineStatus(status)
      setOfflineMessage(status.complete ? 'Quran available offline.' : 'Offline Quran data is not complete.')
    } catch {
      setOfflineMessage('Offline download was interrupted. Please retry when online.')
      setOfflineStatus(loadQuranOfflineStatus())
    }
  }

  async function removeOffline() {
    const status = await removeQuranOfflineData()
    setOfflineStatus(status)
    setOfflineMessage('Offline Quran text removed. Bookmarks and progress were kept.')
  }

  async function loadRecitation() {
    if (!selected || !studyAyah) return
    try {
      setAudioStatus('Loading recitation audio…')
      const audio = await fetchRecitationAudio(selected, studyAyah.number, selectedReciter)
      setAudioUrl(audio.audio)
      setAudioStatus(`Ready: ${audio.reciter}, Surah ${selected}, Ayah ${studyAyah.number}`)
    } catch {
      setAudioUrl('')
      setAudioStatus('Could not load recitation audio. Check your connection and try again.')
    }
  }

  function clearProgress() {
    if (!window.confirm('Clear Quran reading progress on this device? Bookmarks will stay.')) return
    setProgress(clearQuranProgress())
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Quran</h2>
      {progress.lastReadSurah && progress.lastReadAyah && (
        <section className="bg-gray-800 rounded-lg p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-teal-300">Continue Reading</h3>
            <p className="text-sm text-gray-300">
              {continueSurah ? `Surah ${continueSurah.englishName}` : `Surah ${progress.lastReadSurah}`}, Ayah {progress.lastReadAyah}
            </p>
          </div>
          <button type="button" onClick={continueReading} className="rounded bg-teal-600 hover:bg-teal-500 px-4 py-2 font-semibold">
            Continue
          </button>
        </section>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
          <span className="text-sm text-gray-300">Font</span>
          <button className="px-2 py-0.5 rounded bg-gray-700" onClick={()=>setFontPct(p=>clamp(p-10,80,180))}>−</button>
          <span className="w-10 text-center text-sm">{fontPct}%</span>
          <button className="px-2 py-0.5 rounded bg-gray-700" onClick={()=>setFontPct(p=>clamp(p+10,80,180))}>+</button>
        </div>
        <button
          className={`px-3 py-1 rounded ${showOnlyBookmarks ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-200'}`}
          onClick={()=>setShowOnlyBookmarks(v=>!v)}
          title="Show only bookmarked ayahs"
        >
          {showOnlyBookmarks ? 'Showing Bookmarks' : 'View Bookmarks'}
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-700 text-gray-200"
          onClick={clearBookmarks}
          title="Remove all bookmarks"
        >
          Clear Bookmarks
        </button>
        <button
          className={`px-3 py-1 rounded ${selected && progress.favoriteSurahs.includes(selected) ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-200'}`}
          onClick={toggleFavorite}
          title="Favorite this Surah"
        >
          {selected && progress.favoriteSurahs.includes(selected) ? 'Favorited' : 'Favorite Surah'}
        </button>
        <button className="px-3 py-1 rounded bg-gray-700 text-gray-200" onClick={clearProgress}>
          Clear Progress
        </button>
      </div>
      <section className="rounded-lg bg-gray-800 p-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-teal-300">Offline Quran</h3>
            <p className="text-xs text-gray-400">
              {offlineStatus.complete ? 'Quran available offline.' : offlineStatus.available ? `Offline Quran data is not complete (${offlineStatus.downloadedSurahs}/${offlineStatus.totalSurahs}).` : 'Offline Quran data is not complete.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={downloadOffline} className="rounded bg-teal-600 hover:bg-teal-500 px-3 py-2 text-sm font-semibold">Download Quran for Offline Use</button>
            <button type="button" onClick={removeOffline} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">Remove Offline Quran Data</button>
          </div>
        </div>
        {offlineMessage && <p className="rounded bg-gray-900 p-2 text-xs text-teal-300">{offlineMessage}</p>}
      </section>
      <div className="flex flex-wrap justify-center gap-2">
        {(['translation', 'tafsir', 'word-by-word', 'recitation'] as QuranStudyMode[]).map((item) => (
          <button key={item} type="button" onClick={() => setStudyMode(item)} className={`rounded px-3 py-2 text-sm font-semibold capitalize ${studyMode === item ? 'bg-teal-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
            {item === 'word-by-word' ? 'Word by Word' : item}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        <button
          className={`px-3 py-1 rounded ${mode==='ar-en' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-200'}`}
          onClick={()=>setMode('ar-en')}
        >
          Arabic + English
        </button>
        <button
          className={`px-3 py-1 rounded ${mode==='ar' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-200'}`}
          onClick={()=>setMode('ar')}
        >
          Arabic only
        </button>
      </div>
      <div className="flex gap-2 justify-center">
        <select className="text-black" value={selected ?? 1} onChange={e=>setSelected(parseInt(e.target.value))}>
          {surahs.map(s => {
            const saved = progress.perSurahProgress[String(s.number)]
            return (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishName} — {s.name} ({s.numberOfAyahs}){saved ? ` · Last read: Ayah ${saved.lastAyah}` : ''}
              </option>
            )
          })}
        </select>
        {mode==='ar-en' && (
          <select className="text-black" value={edition} onChange={e=>setEdition(e.target.value)}>
            <option value="en.asad">English — Muhammad Asad</option>
            <option value="en.pickthall">English — Pickthall</option>
            <option value="en.sahih">English — Saheeh</option>
            <option value="en.yusufali">English — Yusuf Ali</option>
          </select>
        )}
      </div>
      {currentSurahProgress && (
        <p className="text-center text-xs text-teal-300">
          Last read in this Surah: Ayah {currentSurahProgress.lastAyah}
          {currentSurahProgress.progressPercent ? ` · Progress: ${currentSurahProgress.progressPercent}%` : ''}
        </p>
      )}
      {studyMode !== 'translation' && (
        <section className="rounded-lg bg-gray-800 p-4 text-sm text-gray-300">
          {studyMode === 'tafsir' && getTafsirMessage()}
          {studyMode === 'word-by-word' && (
            <div className="space-y-3">
              <p>{getWordByWordMessage()}</p>
              {studyAyah ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Current study ayah: Surah {selected}, Ayah {studyAyah.number}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {studyWords.map((word) => (
                      <div key={`${word.index}-${word.arabic}`} className="rounded bg-gray-900 p-3 text-center">
                        <div dir="rtl" className="text-xl text-teal-100">{word.arabic}</div>
                        <div className="mt-1 text-[11px] uppercase tracking-wide text-gray-500">Word {word.index}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Load a Surah to see word cards.</p>
              )}
            </div>
          )}
          {studyMode === 'recitation' && (
            <div className="space-y-3">
              <p>{getRecitationMessage()}</p>
              <div className="flex flex-wrap items-center gap-2">
                <select value={selectedReciter} onChange={(event) => setSelectedReciter(event.target.value)} className="rounded bg-gray-900 border border-gray-700 px-3 py-2 text-sm">
                  {RECITERS.filter((reciter) => reciter.available).map((reciter) => (
                    <option key={reciter.id} value={reciter.id}>{reciter.label}</option>
                  ))}
                </select>
                <button type="button" onClick={loadRecitation} className="rounded bg-teal-600 hover:bg-teal-500 px-3 py-2 font-semibold">
                  Load Current Ayah Audio
                </button>
              </div>
              {audioStatus && <p className="text-xs text-teal-300">{audioStatus}</p>}
              {audioUrl && (
                <audio controls src={audioUrl} className="w-full">
                  Your browser does not support audio playback.
                </audio>
              )}
              <div className="flex flex-wrap gap-2">
                <button className="rounded bg-gray-700 px-3 py-2" onClick={() => {
                  if (!selected || !studyAyah || studyAyah.number <= 1) return
                  recordRead(studyAyah.number - 1)
                }}>Previous Ayah</button>
                <button className="rounded bg-gray-700 px-3 py-2" onClick={() => {
                  if (!selected || !studyAyah || studyAyah.number >= (selectedSurah?.numberOfAyahs ?? studyAyah.number)) return
                  recordRead(studyAyah.number + 1)
                }}>Next Ayah</button>
              </div>
            </div>
          )}
        </section>
      )}
      {loading ? <p className="text-center">Loading surah…</p> : (
        mode === 'ar'
          ? (
            <div>
              <h3 className="font-semibold mb-2 text-teal-300">Arabic</h3>
              <div className="space-y-2 leading-8 text-lg" style={{ fontSize: `${fontPct}%` }}>
                {bismillah && (
                  <p dir="rtl" className="text-center text-xl leading-8 mb-2" style={{ fontSize: `${fontPct}%` }}>
                    {bismillah}
                  </p>
                )}
                {(showOnlyBookmarks ? arabic.filter(a=>isBookmarked(selected!, a.number)) : arabic).map(a=> (
                  <p key={a.number} id={`ayah-${selected}-${a.number}`} dir="rtl" className="flex items-start gap-2">
                    <button
                      aria-label="Bookmark ayah"
                      className={`mt-1 ${isBookmarked(selected!, a.number) ? 'text-yellow-400' : 'text-gray-500'}`}
                      onClick={()=>toggleBookmark(selected!, a.number)}
                      title={isBookmarked(selected!, a.number) ? 'Remove bookmark' : 'Add bookmark'}
                    >
                      {isBookmarked(selected!, a.number) ? '★' : '☆'}
                    </button>
                    <button
                      aria-label="Mark ayah read"
                      className="mt-1 text-teal-400"
                      onClick={()=>recordRead(a.number)}
                      title="Mark as last read"
                    >
                      ✓
                    </button>
                    <span>
                      {a.text} <span className="text-sm text-gray-400">﴿{a.number}﴾</span>
                    </span>
                  </p>
                ))}
              </div>
            </div>
          )
          : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-teal-300">Arabic</h3>
                <div className="space-y-2 leading-8 text-lg" style={{ fontSize: `${fontPct}%` }}>
                  {bismillah && (
                    <p dir="rtl" className="text-center text-xl leading-8 mb-2" style={{ fontSize: `${fontPct}%` }}>
                      {bismillah}
                    </p>
                  )}
                  {(showOnlyBookmarks ? arabic.filter(a=>isBookmarked(selected!, a.number)) : arabic).map(a=> (
                    <p key={a.number} id={`ayah-${selected}-${a.number}`} dir="rtl" className="flex items-start gap-2">
                      <button
                        aria-label="Bookmark ayah"
                        className={`mt-1 ${isBookmarked(selected!, a.number) ? 'text-yellow-400' : 'text-gray-500'}`}
                        onClick={()=>toggleBookmark(selected!, a.number)}
                        title={isBookmarked(selected!, a.number) ? 'Remove bookmark' : 'Add bookmark'}
                      >
                        {isBookmarked(selected!, a.number) ? '★' : '☆'}
                      </button>
                      <button
                        aria-label="Mark ayah read"
                        className="mt-1 text-teal-400"
                        onClick={()=>recordRead(a.number)}
                        title="Mark as last read"
                      >
                        ✓
                      </button>
                      <span>
                        {a.text} <span className="text-sm text-gray-400">﴿{a.number}﴾</span>
                      </span>
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-teal-300">English</h3>
                <div className="space-y-3" style={{ fontSize: `${fontPct}%` }}>
                  {(showOnlyBookmarks ? english.filter(e=>isBookmarked(selected!, e.number)) : english).map(e=> (
                    <p key={e.number} className="flex items-start gap-2">
                      <button
                        aria-label="Bookmark ayah"
                        className={`mt-0.5 ${isBookmarked(selected!, e.number) ? 'text-yellow-400' : 'text-gray-500'}`}
                        onClick={()=>toggleBookmark(selected!, e.number)}
                        title={isBookmarked(selected!, e.number) ? 'Remove bookmark' : 'Add bookmark'}
                      >
                        {isBookmarked(selected!, e.number) ? '★' : '☆'}
                      </button>
                      <button
                        aria-label="Mark ayah read"
                        className="mt-0.5 text-teal-400"
                        onClick={()=>recordRead(e.number)}
                        title="Mark as last read"
                      >
                        ✓
                      </button>
                      <span>
                        <span className="text-sm text-gray-400">{e.number}.</span> {e.text}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )
      )}
      {progress.recentlyRead.length > 0 && (
        <section className="bg-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-teal-300">Recently Read</h3>
          <div className="space-y-2 text-sm">
            {progress.recentlyRead.map((item) => (
              <button
                key={`${item.surah}-${item.ayah}-${item.updatedAt}`}
                type="button"
                onClick={() => setSelected(item.surah)}
                className="block w-full rounded bg-gray-900 hover:bg-gray-700 px-3 py-2 text-left"
              >
                {item.title ? `Surah ${item.title}` : `Surah ${item.surah}`}, Ayah {item.ayah}
              </button>
            ))}
          </div>
        </section>
      )}
      <p className="text-xs text-gray-400 text-center">First load needs network; afterwards it's cached offline. Bookmarks & view settings are saved on this device.</p>
    </div>
  )
}
