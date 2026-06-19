import { fetchSurah, fetchSurahs } from './quran'

export type QuranOfflineStatus = {
  available: boolean
  complete: boolean
  downloadedSurahs: number
  totalSurahs: number
  updatedAt: string | null
  error?: string
}

export type QuranDownloadProgress = {
  current: number
  total: number
  label: string
}

export const QURAN_OFFLINE_META_KEY = 'athan.quran.offline.meta.v1'
const QURAN_OFFLINE_CACHE = 'athan-quran-offline-v1'
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

export async function downloadQuranOffline(onProgress?: (progress: QuranDownloadProgress) => void): Promise<QuranOfflineStatus> {
  const surahs = await fetchSurahs()
  let downloaded = 0
  const cache = 'caches' in window ? await caches.open(QURAN_OFFLINE_CACHE) : null

  for (const surah of surahs) {
    onProgress?.({ current: downloaded + 1, total: surahs.length, label: `Downloading Surah ${surah.number}` })
    await fetchSurah(surah.number, DEFAULT_EDITION)
    if (cache) {
      await cache.add(`https://api.alquran.cloud/v1/surah/${surah.number}/ar.uthmani`).catch(() => undefined)
      await cache.add(`https://api.alquran.cloud/v1/surah/${surah.number}/${DEFAULT_EDITION}`).catch(() => undefined)
    }
    downloaded++
  }

  const status: QuranOfflineStatus = {
    available: downloaded > 0,
    complete: downloaded === surahs.length,
    downloadedSurahs: downloaded,
    totalSurahs: surahs.length,
    updatedAt: new Date().toISOString()
  }
  saveStatus(status)
  return status
}

export async function removeQuranOfflineData(): Promise<QuranOfflineStatus> {
  if ('caches' in window) await caches.delete(QURAN_OFFLINE_CACHE)
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
