import { useMemo, useState } from 'react'
import { COUNTRY_PRAYER_CONFIGS, getCountryPrayerConfig } from '../data/countryPrayerMethods'
import { buildIcsForDates, downloadICS } from '../lib/ics'
import { computePrayerTimes, type HighLatKey, type MadhabKey, type MethodKey } from '../lib/prayer'
import { DEFAULT_PRAYER_CORRECTIONS, PRAYER_CORRECTION_KEYS, applyCorrections, type PrayerTimeCorrections } from '../lib/prayerCorrections'
import {
  createSavedCity,
  deleteSavedCity,
  loadSavedCities,
  loadTravelDestinationId,
  searchSavedCity,
  setTravelDestinationId,
  settingsForSavedCity,
  upsertSavedCity,
  type SavedCity
} from '../lib/savedCities'
import { buildTimetableCsv, buildTimetableText, downloadTextFile, shareTimetable } from '../lib/timetableExport'

type Props = {
  go?: (screen: string) => void
}

const METHODS: MethodKey[] = ['MuslimWorldLeague','UmmAlQura','Egyptian','Karachi','Dubai','Qatar','Kuwait','MoonsightingCommittee','NorthAmerica','Singapore','Tehran','Turkey']
const MADHABS: MadhabKey[] = ['Shafi','Hanafi']
const HIGHLATS: HighLatKey[] = ['MiddleOfTheNight','SeventhOfTheNight','TwilightAngle']

export default function SavedCities({ go }: Props) {
  const [cities, setCities] = useState<SavedCity[]>(() => loadSavedCities())
  const [selectedId, setSelectedId] = useState(() => cities[0]?.id ?? '')
  const [travelId, setTravelId] = useState(() => loadTravelDestinationId())
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Partial<SavedCity>[]>([])
  const [message, setMessage] = useState('')
  const [fromDate, setFromDate] = useState(() => formatDate(new Date()))
  const [toDate, setToDate] = useState(() => formatDate(new Date()))

  const selected = useMemo(() => cities.find((city) => city.id === selectedId) ?? cities[0] ?? null, [cities, selectedId])
  const selectedConfig = selected ? getCountryPrayerConfig(selected.countryCode) : null
  const previewRows = useMemo(() => {
    if (!selected) return []
    return makeRows(selected, parseDate(fromDate), parseDate(toDate)).slice(0, 7)
  }, [fromDate, selected, toDate])

  async function search() {
    try {
      setMessage('Searching…')
      setResults(await searchSavedCity(query))
      setMessage('Choose a result to save.')
    } catch {
      setMessage('City search failed. Check your connection or enter coordinates manually.')
    }
  }

  function saveResult(result: Partial<SavedCity>) {
    const city = createSavedCity(result)
    const next = upsertSavedCity(city, cities)
    setCities(next)
    setSelectedId(city.id)
    setResults([])
    setMessage('Saved city added.')
  }

  function updateSelected(next: SavedCity) {
    setCities((current) => current.map((city) => city.id === next.id ? next : city))
  }

  function saveSelected() {
    if (!selected) return
    const next = upsertSavedCity(selected, cities)
    setCities(next)
    setMessage('Saved city updated on this device.')
  }

  function removeSelected() {
    if (!selected) return
    if (!window.confirm('Remove this saved city from this device?')) return
    const next = deleteSavedCity(selected.id, cities)
    setCities(next)
    setSelectedId(next[0]?.id ?? '')
    setMessage('Saved city removed.')
  }

  function markTravel() {
    if (!selected) return
    setTravelDestinationId(selected.id)
    setTravelId(selected.id)
    setMessage(`${selected.name || selected.city} is now your travel destination.`)
  }

  function clearTravel() {
    setTravelDestinationId('')
    setTravelId('')
    setMessage('Travel destination cleared. Use current device location for live features.')
  }

  function updateCorrection(key: keyof PrayerTimeCorrections, value: number) {
    if (!selected) return
    updateSelected({
      ...selected,
      calculationMode: 'custom-corrections',
      manualCorrections: {
        ...(selected.manualCorrections ?? DEFAULT_PRAYER_CORRECTIONS),
        [key]: value
      }
    })
  }

  function exportIcs() {
    if (!selected) return
    const rows = makeRows(selected, parseDate(fromDate), parseDate(toDate))
    const items = rows.flatMap((row) => [
      { title: 'Fajr', when: row.times.fajr },
      { title: 'Sunrise', when: row.times.sunrise },
      { title: 'Dhuhr', when: row.times.dhuhr },
      { title: 'Asr', when: row.times.asr },
      { title: 'Maghrib', when: row.times.maghrib },
      { title: 'Isha', when: row.times.isha }
    ])
    const ics = buildIcsForDates(items, `Athan ${selected.name || selected.city}`, 'ATHAN-PWA-SAVED-CITY', 10)
    downloadICS(`athan-${safeFile(selected.name || selected.city)}-${fromDate}-to-${toDate}.ics`, ics)
  }

  function exportCsv() {
    if (!selected) return
    const options = timetableOptions(selected, fromDate, toDate)
    downloadTextFile(`athan-${safeFile(selected.name || selected.city)}-${fromDate}-to-${toDate}.csv`, buildTimetableCsv(options), 'text/csv;charset=utf-8')
  }

  async function shareText() {
    if (!selected) return
    setMessage(await shareTimetable(buildTimetableText(timetableOptions(selected, fromDate, toDate))))
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Saved Cities / Travel Mode</h1>
        <p className="text-sm text-gray-300">Save travel locations, preview prayer times, apply country defaults, and export timetables.</p>
      </header>

      <section className="rounded-lg bg-gray-800 p-4 space-y-3">
        <h2 className="font-semibold">Search and Save City</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city, country, or coordinates" className="flex-1 rounded bg-gray-900 border border-gray-700 px-3 py-2" />
          <button type="button" onClick={search} className="rounded bg-teal-600 hover:bg-teal-500 px-4 py-2 font-semibold">Search</button>
        </div>
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <button key={index} type="button" onClick={() => saveResult(result)} className="block w-full rounded bg-gray-900 hover:bg-gray-700 p-3 text-left">
                <span className="font-semibold">{result.name || result.city || 'Location'}</span>
                <span className="block text-xs text-gray-400">{result.country} · {result.latitude}, {result.longitude}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg bg-gray-800 p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold">Saved Cities</h2>
          <button type="button" onClick={() => saveResult(createSavedCity({ name: 'Manual City' }))} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm">Add Manual City</button>
        </div>
        {cities.length === 0 ? <p className="text-sm text-gray-400">No saved cities yet.</p> : (
          <div className="grid gap-2 sm:grid-cols-2">
            {cities.map((city) => (
              <button key={city.id} type="button" onClick={() => setSelectedId(city.id)} className={`rounded border p-3 text-left ${selected?.id === city.id ? 'border-teal-400 bg-teal-900/40' : 'border-gray-700 bg-gray-900 hover:bg-gray-700'}`}>
                <div className="font-semibold">{city.name || city.city || 'Unnamed city'}</div>
                <div className="text-xs text-gray-400">{city.countryCode} · {city.calculationMode}{travelId === city.id ? ' · Travel destination' : ''}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <section className="rounded-lg bg-gray-800 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Display name" value={selected.name} onChange={(value) => updateSelected({ ...selected, name: value })} />
            <TextField label="City" value={selected.city} onChange={(value) => updateSelected({ ...selected, city: value })} />
            <TextField label="Country" value={selected.country} onChange={(value) => updateSelected({ ...selected, country: value })} />
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Country code</span>
              <select value={selected.countryCode} onChange={(event) => {
                const config = getCountryPrayerConfig(event.target.value)
                updateSelected({ ...selected, countryCode: config.countryCode, country: config.countryName, calculationMethod: config.defaultMethod, madhab: config.defaultMadhab, highLatitudeRule: config.highLatitudeRule })
              }} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2">
                {COUNTRY_PRAYER_CONFIGS.map((item) => <option key={item.countryCode} value={item.countryCode}>{item.countryName}</option>)}
              </select>
            </label>
            <NumberField label="Latitude" value={selected.latitude} onChange={(value) => updateSelected({ ...selected, latitude: value })} />
            <NumberField label="Longitude" value={selected.longitude} onChange={(value) => updateSelected({ ...selected, longitude: value })} />
          </div>

          <div className="rounded bg-gray-900 p-3 text-sm text-gray-300">
            Auto selected: <span className="font-semibold text-teal-300">{selectedConfig?.defaultMethod}</span> based on {selected.country || selectedConfig?.countryName}. {selectedConfig?.notes}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Calculation mode</span>
              <select value={selected.calculationMode} onChange={(event) => updateSelected({ ...selected, calculationMode: event.target.value as SavedCity['calculationMode'] })} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2">
                <option value="auto">Auto</option>
                <option value="manual-method">Manual method</option>
                <option value="custom-corrections">Custom corrections</option>
              </select>
            </label>
            <SelectField label="Method" value={selected.calculationMethod} options={METHODS} onChange={(value) => updateSelected({ ...selected, calculationMethod: value as MethodKey, calculationMode: 'manual-method' })} />
            <SelectField label="Madhab" value={selected.madhab} options={MADHABS} onChange={(value) => updateSelected({ ...selected, madhab: value as MadhabKey, calculationMode: 'manual-method' })} />
            <SelectField label="High latitude" value={selected.highLatitudeRule} options={HIGHLATS} onChange={(value) => updateSelected({ ...selected, highLatitudeRule: value as HighLatKey, calculationMode: 'manual-method' })} />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Personal Custom Profile</h3>
            <p className="text-xs text-gray-400">Minute offsets are added to calculated times. They do not overwrite built-in country defaults.</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {PRAYER_CORRECTION_KEYS.map((key) => (
                <NumberField key={key} label={`${key} correction`} value={(selected.manualCorrections ?? DEFAULT_PRAYER_CORRECTIONS)[key]} onChange={(value) => updateCorrection(key, value)} />
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-semibold">From date</span>
              <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold">To date</span>
              <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
            </label>
          </div>

          <div className="overflow-x-auto rounded bg-gray-900 p-3">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-gray-400"><tr><th>Date</th><th>Fajr</th><th>Sunrise</th><th>Dhuhr</th><th>Asr</th><th>Maghrib</th><th>Isha</th></tr></thead>
              <tbody>{previewRows.map((row) => <tr key={row.date} className="border-t border-gray-800"><td>{row.date}</td><td>{fmt(row.times.fajr)}</td><td>{fmt(row.times.sunrise)}</td><td>{fmt(row.times.dhuhr)}</td><td>{fmt(row.times.asr)}</td><td>{fmt(row.times.maghrib)}</td><td>{fmt(row.times.isha)}</td></tr>)}</tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={saveSelected} className="rounded bg-teal-600 hover:bg-teal-500 px-3 py-2 font-semibold">Save City</button>
            <button type="button" onClick={markTravel} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 font-semibold">Use Saved City</button>
            <button type="button" onClick={clearTravel} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 font-semibold">Use Current Device Location</button>
            <button type="button" onClick={exportIcs} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 font-semibold">Export Athan ICS</button>
            <button type="button" onClick={exportCsv} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 font-semibold">Export CSV</button>
            <button type="button" onClick={shareText} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 font-semibold">Share Text</button>
            <button type="button" onClick={removeSelected} className="rounded bg-red-900/70 hover:bg-red-800 px-3 py-2 font-semibold">Remove City</button>
          </div>
        </section>
      )}

      {message && <p className="rounded bg-gray-800 p-3 text-sm text-teal-300">{message}</p>}
      <button type="button" onClick={() => go ? go('More') : window.location.hash = '#More'} className="rounded bg-gray-700 hover:bg-gray-600 px-4 py-2">Back</button>
    </div>
  )
}

function makeRows(city: SavedCity, from: Date, to: Date) {
  const settings = settingsForSavedCity(city)
  const rows = []
  const current = new Date(from)
  while (current <= to) {
    const times = applyCorrections(computePrayerTimes({ latitude: city.latitude, longitude: city.longitude }, current, settings), city.calculationMode === 'custom-corrections' ? city.manualCorrections : undefined)
    rows.push({ date: formatDate(current), times })
    current.setDate(current.getDate() + 1)
  }
  return rows
}

function timetableOptions(city: SavedCity, fromDate: string, toDate: string) {
  return {
    locationName: city.name || city.city || 'Saved city',
    coords: { latitude: city.latitude, longitude: city.longitude },
    fromDate: parseDate(fromDate),
    toDate: parseDate(toDate),
    settings: settingsForSavedCity(city),
    corrections: city.calculationMode === 'custom-corrections' ? city.manualCorrections : undefined
  }
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="space-y-1 text-sm"><span className="font-semibold">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" /></label>
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="space-y-1 text-sm"><span className="font-semibold">{label}</span><input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" /></label>
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="space-y-1 text-sm"><span className="font-semibold">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function fmt(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function safeFile(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'saved-city'
}
