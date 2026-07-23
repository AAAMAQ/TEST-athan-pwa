export type QuranStudyMode = 'translation' | 'tafsir' | 'word-by-word' | 'recitation'

export type QuranTranslation = {
  id: 'en.asad' | 'en.pickthall' | 'en.sahih' | 'en.yusufali'
  label: string
  shortLabel: string
  description: string
}

export type TafsirSource = {
  id: string
  label: string
  available: boolean
  note: string
}

export type Reciter = {
  id: string
  label: string
  available: boolean
}

export type QuranWord = {
  index: number
  arabic: string
  transliteration?: string
  meaning?: string
}

export type RecitationAudio = {
  surah: number
  ayah: number
  reciterId: string
  reciter: string
  audio: string
}

const API = 'https://api.alquran.cloud/v1'

export const QURAN_TRANSLATIONS: QuranTranslation[] = [
  {
    id: 'en.asad',
    label: 'Muhammad Asad',
    shortLabel: 'Asad',
    description: 'Reflective modern English with explanatory phrasing.'
  },
  {
    id: 'en.pickthall',
    label: 'Marmaduke Pickthall',
    shortLabel: 'Pickthall',
    description: 'A classic English rendering with formal language.'
  },
  {
    id: 'en.sahih',
    label: 'Saheeh International',
    shortLabel: 'Saheeh',
    description: 'Clear contemporary English designed for direct reading.'
  },
  {
    id: 'en.yusufali',
    label: 'Abdullah Yusuf Ali',
    shortLabel: 'Yusuf Ali',
    description: 'A widely read literary English translation.'
  }
]

export function isQuranTranslation(value: string): value is QuranTranslation['id'] {
  return QURAN_TRANSLATIONS.some((translation) => translation.id === value)
}

export const TAFSIR_SOURCES: TafsirSource[] = [
  {
    id: 'local-notes-ready',
    label: 'Local Tafsir dataset slot',
    available: false,
    note: 'A scholarly Tafsir dataset is not bundled yet. The Quran page can attach a local dataset or approved provider without changing the reading UI.'
  }
]

export const RECITERS: Reciter[] = [
  { id: 'ar.alafasy', label: 'Mishary Rashid Alafasy', available: true },
  { id: 'ar.abdulbasitmurattal', label: 'Abdul Basit Murattal', available: true },
  { id: 'ar.husary', label: 'Mahmoud Khalil Al-Husary', available: true },
  { id: 'ar.minshawi', label: 'Mohamed Siddiq Al-Minshawi', available: true }
]

export function getTafsirMessage() {
  return 'Tafsir is ready for a local scholarly dataset or reviewed provider, but no Tafsir text is bundled in this lightweight release yet.'
}

export function getWordByWordMessage() {
  return 'Arabic word cards are generated from the loaded ayah. Transliteration and meanings will appear when a reviewed word-by-word dataset is added.'
}

export function getRecitationMessage() {
  return 'Audio is fetched only when you press load/play. Athan PWA does not bundle audio files or autoplay recitation.'
}

export function splitArabicWords(text: string): QuranWord[] {
  return text
    .replace(/[۞۩﴾﴿()[\]{}.,،؛:!?؟ـ]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .map((arabic, index) => ({ index: index + 1, arabic }))
}

export async function fetchRecitationAudio(surah: number, ayah: number, reciterId = RECITERS[0].id): Promise<RecitationAudio> {
  const reciter = RECITERS.find((item) => item.id === reciterId && item.available) ?? RECITERS[0]
  const response = await fetch(`${API}/ayah/${surah}:${ayah}/${encodeURIComponent(reciter.id)}`)
  if (!response.ok) throw new Error(`Failed to fetch recitation audio: ${response.status}`)
  const json = await response.json() as { data?: { audio?: string } }
  const audio = json.data?.audio
  if (!audio) throw new Error('Recitation audio was not available for this ayah.')
  return {
    surah,
    ayah,
    reciterId: reciter.id,
    reciter: reciter.label,
    audio
  }
}
