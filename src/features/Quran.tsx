import { useEffect, useState } from 'react'
import { fetchSurahs, fetchSurah } from '../lib/quran'
type SurahItem = { number:number; name:string; englishName:string; englishNameTranslation:string; numberOfAyahs:number }
type ViewMode = 'ar' | 'ar-en'

type Ayah = { number: number; text: string }
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
  const [loading,setLoading]=useState(false)
  const [edition,setEdition]=useState('en.asad')
  const [mode,setMode]=useState<ViewMode>(() => (localStorage.getItem('quranViewMode') as ViewMode) || 'ar-en')
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
  useEffect(()=>{ if(!selected) return; setLoading(true); fetchSurah(selected,edition).then(r=>{ setArabic(r.arabic); setEnglish(r.english) }).finally(()=>setLoading(false)) },[selected,edition])

  const isBookmarked = (s: number, a: number) => bookmarks.has(keyFor(s,a))
  const toggleBookmark = (s: number, a: number) => {
    const k = keyFor(s,a)
    const next = new Set(bookmarks)
    if (next.has(k)) next.delete(k); else next.add(k)
    setBookmarks(next); saveBookmarks(next)
  }
  const clearBookmarks = () => { const empty = new Set<string>(); setBookmarks(empty); saveBookmarks(empty) }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Quran</h2>
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
          {surahs.map(s=><option key={s.number} value={s.number}>{s.number}. {s.englishName} — {s.name} ({s.numberOfAyahs})</option>)}
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
      {loading ? <p className="text-center">Loading surah…</p> : (
        mode === 'ar'
          ? (
            <div>
              <h3 className="font-semibold mb-2 text-teal-300">Arabic</h3>
              <div className="space-y-2 leading-8 text-lg" style={{ fontSize: `${fontPct}%` }}>
                {(showOnlyBookmarks ? arabic.filter(a=>isBookmarked(selected!, a.number)) : arabic).map(a=>(
                  <p key={a.number} dir="rtl" className="flex items-start gap-2">
                    <button
                      aria-label="Bookmark ayah"
                      className={`mt-1 ${isBookmarked(selected!, a.number) ? 'text-yellow-400' : 'text-gray-500'}`}
                      onClick={()=>toggleBookmark(selected!, a.number)}
                      title={isBookmarked(selected!, a.number) ? 'Remove bookmark' : 'Add bookmark'}
                    >
                      {isBookmarked(selected!, a.number) ? '★' : '☆'}
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
                  {(showOnlyBookmarks ? arabic.filter(a=>isBookmarked(selected!, a.number)) : arabic).map(a=>(
                    <p key={a.number} dir="rtl" className="flex items-start gap-2">
                      <button
                        aria-label="Bookmark ayah"
                        className={`mt-1 ${isBookmarked(selected!, a.number) ? 'text-yellow-400' : 'text-gray-500'}`}
                        onClick={()=>toggleBookmark(selected!, a.number)}
                        title={isBookmarked(selected!, a.number) ? 'Remove bookmark' : 'Add bookmark'}
                      >
                        {isBookmarked(selected!, a.number) ? '★' : '☆'}
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
                  {(showOnlyBookmarks ? english.filter(e=>isBookmarked(selected!, e.number)) : english).map(e=>(
                    <p key={e.number} className="flex items-start gap-2">
                      <button
                        aria-label="Bookmark ayah"
                        className={`mt-0.5 ${isBookmarked(selected!, e.number) ? 'text-yellow-400' : 'text-gray-500'}`}
                        onClick={()=>toggleBookmark(selected!, e.number)}
                        title={isBookmarked(selected!, e.number) ? 'Remove bookmark' : 'Add bookmark'}
                      >
                        {isBookmarked(selected!, e.number) ? '★' : '☆'}
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
      <p className="text-xs text-gray-400 text-center">First load needs network; afterwards it’s cached offline. Bookmarks & view settings are saved on this device.</p>
    </div>
  )
}