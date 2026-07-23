import { fetchSurahs, QURAN_API, QURAN_OFFLINE_CACHE } from './quran'

export type QuranOfflineStatus = {
  available: boolean
  complete: boolean
  downloadedSurahs: number
  totalSurahs: number
  updatedAt: string | null
  edition?: string
  error?: string
}

export type QuranDownloadProgress = {
  current: number
  total: number
  label: string
}

export const QURAN_OFFLINE_META_KEY = 'athan.quran.offline.meta.v1'
const LEGACY_QURAN_OFFLINE_CACHE = 'athan-quran-offline-v1'
const DEFAULT_EDITION = 'en.asad'

export function loadQuranOfflineStatus(): QuranOfflineStatus {
  try {
    const raw = localStorage.getItem(QURAN_OFFLINE_META_KEY)
    if (!raw) return emptyStatus()
    return normalizeStatus(JSON.parse(raw))
  } catch {
    return emptyStatus()
  }
}

export async function downloadQuranOffline(
  onProgress?: (progress: QuranDownloadProgress) => void,
  edition = DEFAULT_EDITION
): Promise<QuranOfflineStatus> {
  const surahs = await fetchSurahs()
  if (!('caches' in window)) throw new Error('Cache Storage is unavailable')
  const cache = await caches.open(QURAN_OFFLINE_CACHE)
  let downloaded = 0
  let failed = 0

  for (const surah of surahs) {
    onProgress?.({ current: downloaded + failed + 1, total: surahs.length, label: `Downloading Surah ${surah.number}` })
    const urls = [
      `${QURAN_API}/surah/${surah.number}/ar.uthmani`,
      `${QURAN_API}/surah/${surah.number}/${edition}`
    ]
    try {
      await Promise.all(urls.map((url) => cacheUrlWithRetry(cache, url)))
      downloaded++
    } catch {
      failed++
    }
    saveStatus({
      available: downloaded > 0,
      complete: false,
      downloadedSurahs: downloaded,
      totalSurahs: surahs.length,
      updatedAt: new Date().toISOString(),
      edition,
      error: failed ? `${failed} Surah${failed === 1 ? '' : 's'} still need to be downloaded.` : undefined
    })
  }

  const status: QuranOfflineStatus = {
    available: downloaded > 0,
    complete: failed === 0 && downloaded === surahs.length,
    downloadedSurahs: downloaded,
    totalSurahs: surahs.length,
    updatedAt: new Date().toISOString(),
    edition,
    error: failed ? `${failed} Surah${failed === 1 ? '' : 's'} could not be downloaded. Tap Download again to retry only missing files.` : undefined
  }
  saveStatus(status)
  return status
}

export async function removeQuranOfflineData(): Promise<QuranOfflineStatus> {
  if ('caches' in window) {
    await Promise.all([
      caches.delete(QURAN_OFFLINE_CACHE),
      caches.delete(LEGACY_QURAN_OFFLINE_CACHE)
    ])
  }
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('quran_surah_v1_') || key === 'quran_surahs_v1')
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    // Keep bookmarks/progress untouched even if cleanup is partial.
  }
  const status = emptyStatus()
  saveStatus(status)
  return status
}

async function cacheUrlWithRetry(cache: Cache, url: string) {
  const existing = await cache.match(url)
  if (existing?.ok) return

  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) throw new Error(`Quran request failed with ${response.status}`)
      await cache.put(url, response)
      return
    } catch (error) {
      lastError = error
      if (attempt < 2) await wait(400 * (attempt + 1))
    }
  }
  throw lastError
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

function saveStatus(status: QuranOfflineStatus) {
  try {
    localStorage.setItem(QURAN_OFFLINE_META_KEY, JSON.stringify(status))
  } catch {
    // Ignore storage failures.
  }
}

function normalizeStatus(value: unknown): QuranOfflineStatus {
  const maybe = value && typeof value === 'object' ? value as Partial<QuranOfflineStatus> : {}
  return {
    available: Boolean(maybe.available),
    complete: Boolean(maybe.complete),
    downloadedSurahs: Number.isFinite(Number(maybe.downloadedSurahs)) ? Number(maybe.downloadedSurahs) : 0,
    totalSurahs: Number.isFinite(Number(maybe.totalSurahs)) ? Number(maybe.totalSurahs) : 114,
    updatedAt: typeof maybe.updatedAt === 'string' ? maybe.updatedAt : null,
    edition: typeof maybe.edition === 'string' ? maybe.edition : undefined,
    error: typeof maybe.error === 'string' ? maybe.error : undefined
  }
}

function emptyStatus(): QuranOfflineStatus {
  return {
    available: false,
    complete: false,
    downloadedSurahs: 0,
    totalSurahs: 114,
    updatedAt: null
  }
}
