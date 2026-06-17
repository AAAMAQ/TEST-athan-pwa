export type SalahPrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
export type SalahDayLog = Partial<Record<SalahPrayerKey, boolean>>
export type SalahLogStore = Record<string, SalahDayLog>

export const SALAH_PRAYERS: SalahPrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export type SalahInsights = {
  currentStreak: number
  bestStreak: number
  bestWeekLabel: string
  bestWeekPercent: number
  bestMonthLabel: string
  bestMonthPercent: number
  thisWeekPercent: number
  thisMonthPercent: number
  mostMissedPrayer: SalahPrayerKey | null
  prayerCompletionRates: Record<SalahPrayerKey, number>
  missedPatterns: string[]
  daysTracked: number
}

export function calculateSalahInsights(store: SalahLogStore, today = new Date()): SalahInsights {
  const entries = Object.entries(normalizeStore(store)).sort(([a], [b]) => a.localeCompare(b))
  const daysTracked = entries.filter(([, log]) => SALAH_PRAYERS.some((prayer) => typeof log[prayer] === 'boolean')).length
  const currentStreak = calculateCurrentStreak(store, today)
  const bestStreak = calculateBestStreak(store)
  const thisWeekPercent = completionPercentForRange(store, startOfWeek(today), today)
  const thisMonthPercent = completionPercentForRange(store, startOfMonth(today), today)
  const { label: bestWeekLabel, percent: bestWeekPercent } = bestPeriod(store, 'week')
  const { label: bestMonthLabel, percent: bestMonthPercent } = bestPeriod(store, 'month')
  const prayerCompletionRates = calculatePrayerRates(store)
  const mostMissedPrayer = findMostMissedPrayer(store)

  return {
    currentStreak,
    bestStreak,
    bestWeekLabel,
    bestWeekPercent,
    bestMonthLabel,
    bestMonthPercent,
    thisWeekPercent,
    thisMonthPercent,
    mostMissedPrayer,
    prayerCompletionRates,
    missedPatterns: makeMissedPatterns(store, mostMissedPrayer, thisMonthPercent, currentStreak),
    daysTracked
  }
}

function calculateCurrentStreak(store: SalahLogStore, today: Date) {
  let streak = 0
  const cursor = startOfDay(today)
  while (isCompleteDay(store[ymd(cursor)])) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function calculateBestStreak(store: SalahLogStore) {
  const keys = Object.keys(store).sort()
  if (keys.length === 0) return 0

  let best = 0
  let current = 0
  let previous: Date | null = null

  for (const key of keys) {
    const date = parseYmd(key)
    if (!date) continue
    const consecutive = previous ? daysBetween(previous, date) === 1 : true
    current = consecutive && isCompleteDay(store[key]) ? current + 1 : isCompleteDay(store[key]) ? 1 : 0
    best = Math.max(best, current)
    previous = date
  }

  return best
}

function calculatePrayerRates(store: SalahLogStore): Record<SalahPrayerKey, number> {
  const rates = {} as Record<SalahPrayerKey, number>
  const logs = Object.values(store)
  for (const prayer of SALAH_PRAYERS) {
    let possible = 0
    let completed = 0
    for (const log of logs) {
      if (typeof log[prayer] === 'boolean') {
        possible++
        if (log[prayer]) completed++
      }
    }
    rates[prayer] = possible ? Math.round((completed / possible) * 100) : 0
  }
  return rates
}

function findMostMissedPrayer(store: SalahLogStore): SalahPrayerKey | null {
  let worstPrayer: SalahPrayerKey | null = null
  let worstMisses = 0

  for (const prayer of SALAH_PRAYERS) {
    let misses = 0
    for (const log of Object.values(store)) {
      if (log[prayer] === false) misses++
    }
    if (misses > worstMisses) {
      worstMisses = misses
      worstPrayer = prayer
    }
  }

  return worstPrayer
}

function makeMissedPatterns(store: SalahLogStore, mostMissedPrayer: SalahPrayerKey | null, thisMonthPercent: number, currentStreak: number) {
  const patterns: string[] = []
  if (currentStreak > 0) patterns.push(`You are on a ${currentStreak}-day streak.`)
  if (mostMissedPrayer) patterns.push(`${mostMissedPrayer} is your most missed prayer in your saved data.`)
  if (thisMonthPercent > 0) patterns.push(`You completed ${thisMonthPercent}% of prayers this month.`)

  const fridayMisses = Object.entries(store).filter(([date, log]) => {
    const parsed = parseYmd(date)
    return parsed?.getDay() === 5 && SALAH_PRAYERS.some((prayer) => log[prayer] === false)
  }).length
  if (fridayMisses > 0) patterns.push('Some missed-prayer records appear on Fridays.')

  return patterns
}

function bestPeriod(store: SalahLogStore, period: 'week' | 'month') {
  const buckets = new Map<string, { start: Date; end: Date; total: number; done: number }>()

  for (const [key, log] of Object.entries(store)) {
    const date = parseYmd(key)
    if (!date) continue
    const start = period === 'week' ? startOfWeek(date) : startOfMonth(date)
    const end = period === 'week' ? addDays(start, 6) : endOfMonth(date)
    const bucketKey = ymd(start)
    const bucket = buckets.get(bucketKey) ?? { start, end, total: 0, done: 0 }
    for (const prayer of SALAH_PRAYERS) {
      bucket.total++
      if (log[prayer]) bucket.done++
    }
    buckets.set(bucketKey, bucket)
  }

  let best = { label: 'Not enough data yet', percent: 0 }
  for (const bucket of buckets.values()) {
    if (bucket.total === 0) continue
    const percent = Math.round((bucket.done / bucket.total) * 100)
    if (percent > best.percent) {
      best = {
        label: period === 'week'
          ? `${formatShortDate(bucket.start)}–${formatShortDate(bucket.end)}`
          : bucket.start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        percent
      }
    }
  }
  return best
}

function completionPercentForRange(store: SalahLogStore, from: Date, to: Date) {
  let total = 0
  let done = 0
  for (const day of eachDay(from, to)) {
    const log = store[ymd(day)]
    for (const prayer of SALAH_PRAYERS) {
      total++
      if (log?.[prayer]) done++
    }
  }
  return total ? Math.round((done / total) * 100) : 0
}

function isCompleteDay(log: SalahDayLog | undefined) {
  return !!log && SALAH_PRAYERS.every((prayer) => log[prayer])
}

function normalizeStore(store: SalahLogStore): SalahLogStore {
  return store && typeof store === 'object' ? store : {}
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfWeek(date: Date) {
  const start = startOfDay(date)
  start.setDate(start.getDate() - start.getDay())
  return start
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function eachDay(from: Date, to: Date) {
  const days: Date[] = []
  const cursor = startOfDay(from)
  const end = startOfDay(to)
  while (cursor <= end) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000)
}

function parseYmd(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  return new Date(year, month - 1, day)
}

function ymd(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
