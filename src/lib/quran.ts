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
export const QURAN_API = 'https://api.alquran.cloud/v1'
export const QURAN_OFFLINE_CACHE = 'athan-quran-offline-v2'

// Prefer a fresh response, then fall back to the Quran-only Cache Storage.
async function getJSON<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
    if ('caches' in window) {
      const cache = await caches.open(QURAN_OFFLINE_CACHE)
      await cache.put(url, res.clone()).catch(() => undefined)
    }
    return (await res.json()) as T
  } catch (error) {
    if ('caches' in window) {
      const cached = await caches.match(url)
      if (cached?.ok) return (await cached.json()) as T
    }
    throw error
  }
}
type Surah = { number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number }
type Ayah = { number: number; text: string }
type SurahContent = { arabic: Ayah[]; english: Ayah[]; bismillah?: string }
const K_SURAH_LIST = 'quran_surahs_v1'
const K_SURAH_PREFIX = 'quran_surah_v1_' // + number + '_' + edition

function setCache<T>(k: string, v: T) {
  try {
    localStorage.setItem(k, JSON.stringify({ t: Date.now(), v }))
  } catch {
    // Cache Storage remains available when localStorage reaches its quota.
  }
}
function getCache<T>(k: string, maxAge = 1000*60*60*24*30): T | null {
  const raw = localStorage.getItem(k); if (!raw) return null
  try { const p = JSON.parse(raw); if (Date.now()-p.t>maxAge) return null; return p.v as T } catch { return null }
}

export async function fetchSurahs(): Promise<Surah[]> {
  const c = getCache<Surah[]>(K_SURAH_LIST); if (c) return c;
  const j = await getJSON<ApiResponse<Surah[]>>(`${QURAN_API}/surah`);
  setCache(K_SURAH_LIST, j.data);
  return j.data;
}

export async function fetchSurah(number: number, edition = 'en.asad'): Promise<SurahContent> {
  const key = `${K_SURAH_PREFIX}${number}_${edition}`;
  const c = getCache<SurahContent>(key); if (c) return c;

  const [aj, ej] = await Promise.all([
    getJSON<ApiResponse<SurahApiPayload>>(`${QURAN_API}/surah/${number}/ar.uthmani`),
    getJSON<ApiResponse<SurahApiPayload>>(`${QURAN_API}/surah/${number}/${edition}`)
  ]);

  const toAyah = (a: AyahApi): Ayah => ({ number: a.numberInSurah, text: a.text });
  const arabic: Ayah[] = aj.data.ayahs.map(toAyah);
  const english: Ayah[] = ej.data.ayahs.map(toAyah);

  // Bismillah handling:
  // For all surahs except 1 and 9, treat the first 38 characters of ayah 1 as the Bismillah.
  // We expose that as a separate `bismillah` field and remove it from the ayah text.
  // Surah 1 and Surah 9 are left untouched.
  let bismillah: string | undefined
  if (number !== 1 && number !== 9 && arabic.length > 0) {
    const original = arabic[0].text || ''
    if (original.length >= 38) {
      const b = original.slice(0, 38)
      const rest = original.slice(38).trimStart()
      bismillah = b
      arabic[0] = { ...arabic[0], text: rest || arabic[0].text }
    }
  }

  const payload: SurahContent = bismillah ? { arabic, english, bismillah } : { arabic, english }
  setCache(key, payload);
  return payload;
}
