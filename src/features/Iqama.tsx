// src/features/Iqama.tsx

import { useEffect, useMemo, useState } from 'react'
import { computePrayerTimes } from '../lib/prayer'
import { getUserLocation } from '../lib/location'
import {
  calculateIqamaDay,
  clampJumuahTime,
  DEFAULT_INCLUDED_IQAMA_PRAYERS,
  downloadIqamaIcs,
  formatDateInput,
  formatIqamaTime,
  getIqamaRowsForDateRange,
  getIqamaRuleSummary,
  IQAMA_OFFSET_PRESETS,
  IQAMA_PRAYERS,
  isValidTimeInput,
  loadJumuahReminderSettings,
  loadIqamaSettings,
  parseDateInput,
  resetIqamaSettings,
  saveJumuahReminderSettings,
  saveIqamaSettings,
  updateIqamaRule,
  type AthanTimesForIqama,
  type IqamaIncludedPrayers,
  type IqamaMode,
  type IqamaOffsetPreset,
  type IqamaPrayerName,
  type IqamaSettings,
  type IqamaTimeFormat,
  type JumuahReminderSettings
} from '../lib/iqama'

type Props = {
  go?: (screen: string) => void
}

const PRAYER_LABELS: Record<IqamaPrayerName, string> = {
  Fajr: 'Fajr',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha'
}

function formatDateForTitle(date: Date) {
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatPrayerDate(date: Date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

function makeAthanTimesForIqama(coords: { latitude: number; longitude: number }, date: Date): AthanTimesForIqama {
  const prayerTimes = computePrayerTimes(coords, date)

  return {
    Fajr: formatPrayerDate(prayerTimes.fajr),
    Dhuhr: formatPrayerDate(prayerTimes.dhuhr),
    Asr: formatPrayerDate(prayerTimes.asr),
    Maghrib: formatPrayerDate(prayerTimes.maghrib),
    Isha: formatPrayerDate(prayerTimes.isha)
  }
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

type FixedTimeParts = {
  h1: string
  h2: string
  m1: string
  m2: string
  period: 'AM' | 'PM'
}

function fixedTimePartsFromValue(value: string, format: IqamaTimeFormat): FixedTimeParts {
  const normalized = value.match(/^(\d{2}):(\d{2})$/) ? value : '13:30'
  const [hourText, minuteText] = normalized.split(':')
  let hour = Number(hourText)
  const minute = Number(minuteText)

  if (format === '12h') {
    const period: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12
    if (hour === 0) hour = 12
    const hour12 = String(hour).padStart(2, '0')
    const minute12 = String(Math.max(0, Math.min(59, minute))).padStart(2, '0')

    return {
      h1: hour12[0],
      h2: hour12[1],
      m1: minute12[0],
      m2: minute12[1],
      period
    }
  }

  const hour24 = String(Math.max(0, Math.min(23, hour))).padStart(2, '0')
  const minute24 = String(Math.max(0, Math.min(59, minute))).padStart(2, '0')

  return {
    h1: hour24[0],
    h2: hour24[1],
    m1: minute24[0],
    m2: minute24[1],
    period: hour >= 12 ? 'PM' : 'AM'
  }
}

function fixedTimeValueFromParts(parts: FixedTimeParts, format: IqamaTimeFormat) {
  let hour = Number(`${parts.h1}${parts.h2}`)
  let minute = Number(`${parts.m1}${parts.m2}`)

  if (!Number.isFinite(hour)) hour = format === '12h' ? 1 : 13
  if (!Number.isFinite(minute)) minute = 30

  minute = Math.max(0, Math.min(59, minute))

  if (format === '12h') {
    hour = Math.max(1, Math.min(12, hour))
    if (parts.period === 'PM' && hour < 12) hour += 12
    if (parts.period === 'AM' && hour === 12) hour = 0
  } else {
    hour = Math.max(0, Math.min(23, hour))
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function DigitSelect({ value, onChange, label }: { value: string; onChange: (digit: string) => void; label: string }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-12 rounded bg-gray-800 border border-gray-700 text-center text-xl font-bold text-white"
    >
      {DIGITS.map((digit) => (
        <option key={digit} value={digit}>{digit}</option>
      ))}
    </select>
  )
}

export default function Iqama({ go }: Props) {
  const [settings, setSettings] = useState<IqamaSettings>(() => loadIqamaSettings())
  const [timeFormat, setTimeFormat] = useState<IqamaTimeFormat>('12h')
  const [athanTimes, setAthanTimes] = useState<AthanTimesForIqama>({})
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [date] = useState(() => new Date())
  const [fromDate, setFromDate] = useState(() => formatDateInput(new Date()))
  const [toDate, setToDate] = useState(() => formatDateInput(new Date()))
  const [includedPrayers, setIncludedPrayers] = useState<IqamaIncludedPrayers>(() => ({ ...DEFAULT_INCLUDED_IQAMA_PRAYERS }))
  const [jumuahReminder, setJumuahReminder] = useState<JumuahReminderSettings>(() => loadJumuahReminderSettings())
  const [status, setStatus] = useState('Loading today\'s local prayer times…')
  const [downloadStatus, setDownloadStatus] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadTodayPrayerTimes() {
      try {
        const location = await getUserLocation()
        if (!location || cancelled) return

        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }

        const todayAthanTimes = makeAthanTimesForIqama(coords, date)
        if (cancelled) return

        setCoords(coords)
        setAthanTimes(todayAthanTimes)
        setStatus('Using today\'s local prayer times from your current location.')
      } catch {
        if (!cancelled) {
          setStatus('Location unavailable. You can still set fixed Iqama times, but offset-based Iqama needs today\'s Athan times.')
        }
      }
    }

    loadTodayPrayerTimes()

    return () => {
      cancelled = true
    }
  }, [date])

  const iqamaDay = useMemo(() => {
    return calculateIqamaDay(athanTimes, settings)
  }, [athanTimes, settings])

  const fromDateObject = useMemo(() => parseDateInput(fromDate), [fromDate])
  const toDateObject = useMemo(() => parseDateInput(toDate), [toDate])

  const exportRows = useMemo(() => {
    if (!coords) return []

    return getIqamaRowsForDateRange({
      coords,
      fromDate: fromDateObject,
      toDate: toDateObject,
      settings,
      includedPrayers,
      includeJumuah: jumuahReminder.include,
      jumuahTime: jumuahReminder.time
    })
  }, [coords, fromDateObject, includedPrayers, jumuahReminder.include, jumuahReminder.time, settings, toDateObject])

  const includedPrayerNames = IQAMA_PRAYERS.filter((prayer) => includedPrayers[prayer])

function goBack() {
  if (go) {
    go('AthanEngine')
    return
  }

  window.location.hash = '#AthanEngine'
}

  function updateRule(prayer: IqamaPrayerName, nextRule: Parameters<typeof updateIqamaRule>[2]) {
    setSettings((current) => updateIqamaRule(current, prayer, nextRule))
    setSavedMessage('')
  }

  function saveSettings() {
    saveIqamaSettings(settings)
    saveJumuahReminderSettings(jumuahReminder)
    setSavedMessage('Iqama settings saved on this device.')
    setTimeout(() => setSavedMessage(''), 2400)
  }

  function resetSettings() {
    setSettings(resetIqamaSettings())
    setJumuahReminder({ include: false, time: '09:00' })
    saveJumuahReminderSettings({ include: false, time: '09:00' })
    setSavedMessage('Iqama settings reset to defaults.')
    setTimeout(() => setSavedMessage(''), 2400)
  }

  function setQuickRange(days: number) {
    const start = new Date()
    const end = new Date(start)
    end.setDate(start.getDate() + Math.max(0, days - 1))
    setFromDate(formatDateInput(start))
    setToDate(formatDateInput(end))
  }

  function toggleIncludedPrayer(prayer: IqamaPrayerName) {
    setIncludedPrayers((current) => ({
      ...current,
      [prayer]: !current[prayer]
    }))
  }

  function updateJumuahReminder(next: Partial<JumuahReminderSettings>) {
    setJumuahReminder((current) => {
      const updated = {
        ...current,
        ...next,
        time: next.time !== undefined ? clampJumuahTime(next.time) : current.time
      }
      saveJumuahReminderSettings(updated)
      return updated
    })
  }

  function downloadIqamaCalendar() {
    if (!coords) {
      setDownloadStatus('Location permission is required before downloading Iqama ICS.')
      return
    }

    try {
      saveIqamaSettings(settings)
      saveJumuahReminderSettings(jumuahReminder)
      downloadIqamaIcs({
        coords,
        fromDate: fromDateObject,
        toDate: toDateObject,
        settings,
        includedPrayers,
        includeJumuah: jumuahReminder.include,
        jumuahTime: jumuahReminder.time
      })
      setDownloadStatus(`Downloaded ${exportRows.length} calendar events.`)
    } catch (error) {
      console.error('Failed to download Iqama ICS', error)
      setDownloadStatus('Could not download the Iqama ICS file. Please try again.')
    }
  }

  function setOffsetPreset(prayer: IqamaPrayerName, preset: IqamaOffsetPreset) {
    if (preset === 'custom') {
      updateRule(prayer, {
        mode: 'offset',
        offsetPreset: 'custom'
      })
      return
    }

    updateRule(prayer, {
      mode: 'offset',
      offsetPreset: preset,
      offsetMinutes: preset
    })
  }

  function setMode(prayer: IqamaPrayerName, mode: IqamaMode) {
    updateRule(prayer, { mode })
  }

  function updateFixedTimePart(prayer: IqamaPrayerName, part: keyof FixedTimeParts, value: string) {
    const currentRule = settings[prayer]
    const currentParts = fixedTimePartsFromValue(currentRule.fixedTime, timeFormat)
    const nextParts = {
      ...currentParts,
      [part]: value
    } as FixedTimeParts

    updateRule(prayer, {
      mode: 'fixed',
      fixedTime: fixedTimeValueFromParts(nextParts, timeFormat)
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Iqama Times</h1>
        <p className="text-sm text-gray-300">
          Set Iqama times manually, either as a fixed time or as minutes after each Athan.
        </p>
        <p className="text-xs text-gray-400">{formatDateForTitle(date)}</p>
      </header>

      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Today&apos;s Iqama Preview</h2>
            <p className="text-sm text-gray-400">{status}</p>
          </div>

          <div className="flex rounded-lg border border-gray-700 bg-gray-900 p-1 text-sm">
            <button
              type="button"
              onClick={() => setTimeFormat('12h')}
              aria-pressed={timeFormat === '12h'}
              className={`rounded px-3 py-2 ${timeFormat === '12h' ? 'bg-teal-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              {timeFormat === '12h' ? '✓ ' : ''}AM/PM
            </button>
            <button
              type="button"
              onClick={() => setTimeFormat('24h')}
              aria-pressed={timeFormat === '24h'}
              className={`rounded px-3 py-2 ${timeFormat === '24h' ? 'bg-teal-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              {timeFormat === '24h' ? '✓ ' : ''}24h
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-gray-300">
              <tr className="border-b border-gray-700">
                <th className="py-2 pr-3">Prayer</th>
                <th className="py-2 pr-3">Athan</th>
                <th className="py-2 pr-3">Iqama</th>
                <th className="py-2 pr-3">Rule</th>
              </tr>
            </thead>
            <tbody>
              {IQAMA_PRAYERS.map((prayer) => {
                const row = iqamaDay[prayer]
                return (
                  <tr key={prayer} className="border-b border-gray-700/60 last:border-0">
                    <td className="py-2 pr-3 font-semibold text-white">{PRAYER_LABELS[prayer]}</td>
                    <td className="py-2 pr-3 text-gray-300">
                      {row.athanTime ? formatIqamaTime(row.athanTime, timeFormat) : '—'}
                    </td>
                    <td className="py-2 pr-3 text-teal-300 font-semibold">
                      {row.iqamaTime ? formatIqamaTime(row.iqamaTime, timeFormat) : '—'}
                    </td>
                    <td className="py-2 pr-3 text-gray-400">{getIqamaRuleSummary(row.rule, timeFormat)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-gray-800 rounded-lg p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Edit Iqama Rules</h2>
          <p className="text-sm text-gray-400">
            Use offset mode for Iqama times that move with Athan, or fixed mode for a masjid time that stays the same.
          </p>
        </div>

        <div className="space-y-4">
          {IQAMA_PRAYERS.map((prayer) => {
            const rule = settings[prayer]
            const fixedInvalid = rule.mode === 'fixed' && rule.fixedTime && !isValidTimeInput(rule.fixedTime)

            return (
              <article key={prayer} className="rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{PRAYER_LABELS[prayer]}</h3>
                    <p className="text-xs text-gray-400">{getIqamaRuleSummary(rule, timeFormat)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm sm:w-72">
                    <button
                      type="button"
                      onClick={() => setMode(prayer, 'offset')}
                      aria-pressed={rule.mode === 'offset'}
                      className={`rounded border px-3 py-2 ${rule.mode === 'offset' ? 'border-teal-400 bg-teal-700 text-white' : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {rule.mode === 'offset' ? '✓ ' : ''}After Athan
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode(prayer, 'fixed')}
                      aria-pressed={rule.mode === 'fixed'}
                      className={`rounded border px-3 py-2 ${rule.mode === 'fixed' ? 'border-teal-400 bg-teal-700 text-white' : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {rule.mode === 'fixed' ? '✓ ' : ''}Fixed Time
                    </button>
                  </div>
                </div>

                {rule.mode === 'offset' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-sm">
                      {IQAMA_OFFSET_PRESETS.map((preset) => (
                        <button
                          key={String(preset)}
                          type="button"
                          onClick={() => setOffsetPreset(prayer, preset)}
                          aria-pressed={rule.offsetPreset === preset}
                          className={`rounded border px-3 py-2 ${rule.offsetPreset === preset ? 'border-teal-400 bg-teal-700 text-white' : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        >
                          {rule.offsetPreset === preset ? '✓ ' : ''}{preset === 'custom' ? 'Custom' : preset === 60 ? '1h' : `${preset}m`}
                        </button>
                      ))}
                    </div>

                    {rule.offsetPreset === 'custom' && (
                      <label className="block space-y-1 text-sm">
                        <span className="font-semibold">Custom minutes after Athan</span>
                        <input
                          type="number"
                          min="0"
                          max="1440"
                          step="1"
                          value={rule.offsetMinutes}
                          onChange={(event) => updateRule(prayer, {
                            mode: 'offset',
                            offsetPreset: 'custom',
                            offsetMinutes: Number(event.target.value)
                          })}
                          className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <span className="font-semibold">Fixed Iqama time</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <DigitSelect
                        label={`${PRAYER_LABELS[prayer]} fixed time hour tens`}
                        value={fixedTimePartsFromValue(rule.fixedTime, timeFormat).h1}
                        onChange={(digit) => updateFixedTimePart(prayer, 'h1', digit)}
                      />
                      <DigitSelect
                        label={`${PRAYER_LABELS[prayer]} fixed time hour ones`}
                        value={fixedTimePartsFromValue(rule.fixedTime, timeFormat).h2}
                        onChange={(digit) => updateFixedTimePart(prayer, 'h2', digit)}
                      />
                      <span className="text-2xl font-bold text-gray-300">:</span>
                      <DigitSelect
                        label={`${PRAYER_LABELS[prayer]} fixed time minute tens`}
                        value={fixedTimePartsFromValue(rule.fixedTime, timeFormat).m1}
                        onChange={(digit) => updateFixedTimePart(prayer, 'm1', digit)}
                      />
                      <DigitSelect
                        label={`${PRAYER_LABELS[prayer]} fixed time minute ones`}
                        value={fixedTimePartsFromValue(rule.fixedTime, timeFormat).m2}
                        onChange={(digit) => updateFixedTimePart(prayer, 'm2', digit)}
                      />

                      {timeFormat === '12h' && (
                        <div className="grid grid-cols-2 gap-2 ml-0 sm:ml-2">
                          <button
                            type="button"
                            onClick={() => updateFixedTimePart(prayer, 'period', 'AM')}
                            aria-pressed={fixedTimePartsFromValue(rule.fixedTime, timeFormat).period === 'AM'}
                            className={`h-12 rounded border px-3 font-semibold ${fixedTimePartsFromValue(rule.fixedTime, timeFormat).period === 'AM' ? 'border-teal-400 bg-teal-700 text-white' : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                          >
                            {fixedTimePartsFromValue(rule.fixedTime, timeFormat).period === 'AM' ? '✓ ' : ''}AM
                          </button>
                          <button
                            type="button"
                            onClick={() => updateFixedTimePart(prayer, 'period', 'PM')}
                            aria-pressed={fixedTimePartsFromValue(rule.fixedTime, timeFormat).period === 'PM'}
                            className={`h-12 rounded border px-3 font-semibold ${fixedTimePartsFromValue(rule.fixedTime, timeFormat).period === 'PM' ? 'border-teal-400 bg-teal-700 text-white' : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                          >
                            {fixedTimePartsFromValue(rule.fixedTime, timeFormat).period === 'PM' ? '✓ ' : ''}PM
                          </button>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs ${fixedInvalid ? 'text-red-300' : 'text-gray-400'}`}>
                      {fixedInvalid ? 'Choose a valid fixed time.' : `Current fixed time: ${rule.fixedTime ? formatIqamaTime(rule.fixedTime, timeFormat) : '1:30 PM'}. Use this when your masjid keeps the same Iqama time regardless of Athan changes.`}
                    </p>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={saveSettings}
            className="rounded bg-teal-600 hover:bg-teal-500 px-4 py-3 font-semibold text-white"
          >
            Save Iqama Settings
          </button>
          <button
            type="button"
            onClick={resetSettings}
            className="rounded bg-gray-700 hover:bg-gray-600 px-4 py-3 font-semibold text-white"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={goBack}
            className="rounded bg-gray-700 hover:bg-gray-600 px-4 py-3 font-semibold text-white"
          >
            Back to Advanced Athan
          </button>
        </div>

        {savedMessage && (
          <p className="rounded bg-gray-900 p-3 text-sm text-teal-300">{savedMessage}</p>
        )}
      </section>

      <section className="bg-gray-800 rounded-lg p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Iqama Calendar Export</h2>
          <p className="text-sm text-gray-400">
            Download Iqama reminders as a calendar .ics file using your current device location.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-semibold">From date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold">To date</span>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(event) => setToDate(event.target.value)}
              className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button type="button" onClick={() => setQuickRange(1)} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">Today</button>
          <button type="button" onClick={() => setQuickRange(7)} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">7 days</button>
          <button type="button" onClick={() => setQuickRange(30)} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">30 days</button>
          <button type="button" onClick={() => setQuickRange(365)} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">1 year</button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Included prayers</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {IQAMA_PRAYERS.map((prayer) => (
              <button
                key={prayer}
                type="button"
                onClick={() => toggleIncludedPrayer(prayer)}
                aria-pressed={includedPrayers[prayer]}
                className={`rounded border px-3 py-2 text-sm font-semibold ${includedPrayers[prayer] ? 'border-teal-400 bg-teal-700 text-white' : 'border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-700'}`}
              >
                {includedPrayers[prayer] ? '✓ ' : ''}{PRAYER_LABELS[prayer]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded border border-gray-700 bg-gray-900 p-3 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={jumuahReminder.include}
                onChange={(event) => updateJumuahReminder({ include: event.target.checked })}
                className="h-4 w-4 accent-teal-600"
              />
              Include Jumu’ah reminder
            </label>

            <label className="space-y-1 text-sm sm:w-48">
              <span className="font-semibold">Reminder time</span>
              <input
                type="time"
                min="05:00"
                max="11:00"
                value={jumuahReminder.time}
                onChange={(event) => updateJumuahReminder({ time: event.target.value })}
                className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
              />
            </label>
          </div>
          <p className="text-xs text-gray-400">
            Jumu’ah reminders are generated only on Fridays between 5:00 AM and 11:00 AM.
          </p>
        </div>

        <div className="rounded bg-gray-900 p-3 text-sm text-gray-300 space-y-1">
          <p><span className="font-semibold text-white">Location:</span> Current device location</p>
          <p><span className="font-semibold text-white">Date range:</span> {fromDate} to {toDate}</p>
          <p><span className="font-semibold text-white">Number of events:</span> {exportRows.length}</p>
          <p><span className="font-semibold text-white">File type:</span> Calendar .ics</p>
          <p><span className="font-semibold text-white">Included prayers:</span> {includedPrayerNames.length ? includedPrayerNames.join(', ') : 'None'}{jumuahReminder.include ? ', Jumu’ah' : ''}</p>
        </div>

        <p className="rounded border border-yellow-700 bg-yellow-900/30 p-3 text-xs text-yellow-100">
          Calendar alerts are handled by your calendar app, not Athan PWA. Avoid importing the same file multiple times or you may create duplicate reminders.
        </p>

        <button
          type="button"
          onClick={downloadIqamaCalendar}
          disabled={!coords || exportRows.length === 0}
          className="w-full rounded bg-teal-600 hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-gray-700 px-4 py-3 font-semibold text-white"
        >
          Download Iqama ICS
        </button>

        {downloadStatus && (
          <p className="rounded bg-gray-900 p-3 text-sm text-teal-300">{downloadStatus}</p>
        )}
      </section>

      <section className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm text-gray-300">
        <h2 className="text-lg font-semibold text-white">How this works</h2>
        <p>
          <span className="font-semibold">After Athan</span> mode adds your selected minutes to today&apos;s local Athan time.
          For example, if Dhuhr is 12:30 and you choose 20 minutes, Iqama becomes 12:50.
        </p>
        <p>
          <span className="font-semibold">Fixed Time</span> mode uses the same time every day, such as 1:30 PM, which is
          useful when a masjid keeps a stable Iqama time for part of the year.
        </p>
        <p className="text-xs text-gray-400">
          These settings are saved only on this device/browser. Always follow your local masjid if their timetable changes.
        </p>
         <p className="text-xs text-gray-400">
            Currently the Iqama preview only supports your current location&apos;s prayer times. Future updates may allow you to set a specific location for the Iqama preview.
        </p>
      </section>
    </div>
  )
}
