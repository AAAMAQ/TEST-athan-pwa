// Typed helpers for the AlQuran API responses (to avoid `any`)
interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}
interface AyahApi {
  numberInSurah: number;
  text: string;
}
interface SurahApiPayload {
  ayahs: AyahApi[];
}
// small helper to fetch+json with generics
async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as T;
}
type Surah = { number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number }
type Ayah = { number: number; text: string }
type SurahContent = { arabic: Ayah[]; english: Ayah[]; bismillah?: string }
const API = 'https://api.alquran.cloud/v1'
const K_SURAH_LIST = 'quran_surahs_v1'
const K_SURAH_PREFIX = 'quran_surah_v1_' // + number + '_' + edition

// Uthmani basmala variants that may appear at the start of ayah 1
const BASMALA_VARIANTS = [
  'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ',
  'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ',
  'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ',
  'بِسْمِ ٱللّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ',
  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
]

function stripLeadingBasmala(text: string): { bismillah?: string; rest: string } {
  const trimmed = text.replace(/^\uFEFF/, '').trim()
  for (const v of BASMALA_VARIANTS) {
    if (trimmed.startsWith(v)) {
      let rest = trimmed.slice(v.length).replace(/^\s*[–—-]?\s*/, '').trim()
      // Ensure a visual break between Basmala and the first ayah text
      if (rest && !rest.startsWith('\n')) {
        rest = `\n${rest}`
      }
      return { bismillah: v, rest }
    }
  }
  return { rest: trimmed }
}

function setCache<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify({ t: Date.now(), v })) }
function getCache<T>(k: string, maxAge = 1000*60*60*24*30): T | null {
  const raw = localStorage.getItem(k); if (!raw) return null
  try { const p = JSON.parse(raw); if (Date.now()-p.t>maxAge) return null; return p.v as T } catch { return null }
}

export async function fetchSurahs(): Promise<Surah[]> {
  const c = getCache<Surah[]>(K_SURAH_LIST); if (c) return c;
  const j = await getJSON<ApiResponse<Surah[]>>(`${API}/surah`);
  setCache(K_SURAH_LIST, j.data);
  return j.data;
}

export async function fetchSurah(number: number, edition = 'en.asad'): Promise<SurahContent> {
  const key = `${K_SURAH_PREFIX}${number}_${edition}`;
  const c = getCache<SurahContent>(key); if (c) return c;

  const [aj, ej] = await Promise.all([
    getJSON<ApiResponse<SurahApiPayload>>(`${API}/surah/${number}/ar.uthmani`),
    getJSON<ApiResponse<SurahApiPayload>>(`${API}/surah/${number}/${edition}`)
  ]);

  const toAyah = (a: AyahApi): Ayah => ({ number: a.numberInSurah, text: a.text });
  const arabic: Ayah[] = aj.data.ayahs.map(toAyah);
  const english: Ayah[] = ej.data.ayahs.map(toAyah);

  // Separate Basmala for all surahs except 9. For Surah 1, keep ayah[0] as-is (it is ayah 1),
  // but also expose a `bismillah` field for UI headers if desired.
  let bismillah: string | undefined
  if (number !== 9 && arabic.length > 0) {
    const { bismillah: b, rest } = stripLeadingBasmala(arabic[0].text)
    if (b) {
      bismillah = b
      // For all surahs except 1, if Basmala is prefixed to the first ayah, remove it from the ayah text
      if (number !== 1) {
        arabic[0] = { ...arabic[0], text: rest || arabic[0].text }
      }
    }
  }

  const payload: SurahContent = bismillah ? { arabic, english, bismillah } : { arabic, english }
  setCache(key, payload);
  return payload;
}