import { useEffect, useState } from 'react'
import {
  loadSettings,
  saveSettings,
  type MethodKey,
  type MadhabKey,
  type HighLatKey,
  type PrayerSettings,
  computePrayerTimes
} from '../lib/prayer'
import { getUserLocation } from '../lib/location'
import { buildIcsForDates, downloadICS } from '../lib/ics'
import { LANGUAGE_LABELS, loadLanguage, saveLanguage, t, type AppLanguage } from '../lib/i18n'

const METHODS: MethodKey[] = ['MuslimWorldLeague','UmmAlQura','Egyptian','Karachi','Dubai','Qatar','Kuwait','MoonsightingCommittee','NorthAmerica','Singapore','Tehran','Turkey']
const MADHABS: MadhabKey[] = ['Shafi','Hanafi']
const HIGHLATS: HighLatKey[] = ['MiddleOfTheNight','SeventhOfTheNight','TwilightAngle']
const REMINDER_OFFSETS: number[] = [5, 10, 15, 20, 30, 45, 50]

const LS_OFFSET = 'reminderOffsetMin'
const LS_ISHA_FIXED = 'ishaFixedTime'

type Props = {
  go?: (screen: string) => void
}

export default function Settings({ go }: Props){
  const [s,setS]=useState(loadSettings())
  const [language,setLanguage]=useState<AppLanguage>(() => loadLanguage())
  const [offsetMin,setOffsetMin]=useState<number>(()=> {
    // prefer new key; fallback to legacy key 'reminderMinutesBefore'
    const raw = localStorage.getItem(LS_OFFSET) ?? localStorage.getItem('reminderMinutesBefore') ?? '20'
    const n = parseInt(raw,10)
    return Number.isFinite(n) ? Math.max(1, n) : 20
  })
  const [ishaTime,setIshaTime]=useState<string>(()=> localStorage.getItem(LS_ISHA_FIXED) || '22:00')
  const [msg,setMsg]=useState('')

  function update<K extends keyof PrayerSettings>(k: K, v: PrayerSettings[K]) {
    const n: PrayerSettings = { ...s, [k]: v } as PrayerSettings
    setS(n); saveSettings(n)
  }

  function updateLanguage(value: AppLanguage) {
    setLanguage(value)
    saveLanguage(value)
    setMsg('Language preference saved on this device.')
  }

  useEffect(()=>{ localStorage.setItem(LS_OFFSET, String(Math.max(1, offsetMin))) },[offsetMin])
  useEffect(()=>{ localStorage.setItem(LS_ISHA_FIXED, ishaTime) },[ishaTime])

  async function exportIcs(days:number, label:string){
    const loc=await getUserLocation(); if(!loc) { setMsg('Location permission required.'); return }
    const base=new Date()
    const effectiveOffset = Math.max(1, offsetMin)
    const all:{title:string;when:Date}[]=[]
    for(let d=0; d<days; d++){
      const day=new Date(base); day.setDate(day.getDate()+d)
      const pt=computePrayerTimes({latitude:loc.coords.latitude, longitude:loc.coords.longitude}, day, s)
      all.push(
        {title:'Fajr',when:pt.fajr},
        {title:'Sunrise',when:pt.sunrise},
        {title:'Dhuhr',when:pt.dhuhr},
        {title:'Asr',when:pt.asr},
        {title:'Maghrib',when:pt.maghrib},
        {title:'Isha',when:pt.isha}
      )
      if(ishaTime){
        const [h,m]=ishaTime.split(':').map(Number)
        const custom=new Date(day); custom.setHours(h??23,m??59,0,0)
        all.push({title:'Isha Reminder (custom time)', when:custom})
      }
    }
    const ics = buildIcsForDates(all, `Athan Reminders (${label})`, 'ATHAN-PWA', effectiveOffset)
    downloadICS(`athan-reminders-${label}_${loc.coords.latitude.toFixed(3)}_${loc.coords.longitude.toFixed(3)}.ics`, ics)
    setMsg(`Downloaded .ics for ${label}.`)
  }

  function openBackupRestore() {
    if (go) go('BackupRestore')
    else window.location.hash = '#BackupRestore'
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">{t('settings', language)}</h2>

      <section className="space-y-4 p-3 rounded-md bg-gray-800">
        <div>
          <label className="block mb-1">Language:</label>
          <select
            className="text-black px-2 py-1 rounded"
            value={language}
            onChange={e=>updateLanguage(e.target.value as AppLanguage)}
          >
            {(Object.keys(LANGUAGE_LABELS) as AppLanguage[]).map((key) => (
              <option key={key} value={key}>{LANGUAGE_LABELS[key]}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Core labels update first; more translations can be added gradually.
          </p>
        </div>
        <div><label className="block mb-1">Calculation Method:</label>
          <select className="text-black" value={s.method} onChange={e=>update('method', e.target.value as MethodKey)}>{METHODS.map(m=><option key={m} value={m}>{m}</option>)}</select>
        </div>
        <div><label className="block mb-1">Madhab:</label>
          <select className="text-black" value={s.madhab} onChange={e=>update('madhab', e.target.value as MadhabKey)}>{MADHABS.map(m=><option key={m} value={m}>{m}</option>)}</select>
        </div>
        <div><label className="block mb-1">High Latitude Rule:</label>
          <select className="text-black" value={s.highLatRule} onChange={e=>update('highLatRule', e.target.value as HighLatKey)}>{HIGHLATS.map(h=><option key={h} value={h}>{h}</option>)}</select>
        </div>
        <p className="text-xs text-gray-400">
          Tip: Read the Need Help page for guidance on which settings to choose.
        </p>
      </section>


      <section className="space-y-4 p-3 rounded-md bg-gray-800">
        <h3 className="font-semibold">Reminders via Calendar (.ics)</h3>

        <p className="text-xs text-gray-400">
          Tip: Calendar export (.ics) lets your device&apos;s calendar handle alerts even when the PWA is closed.
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-300">Reminder offset (minutes before each prayer)</label>
            <div className="flex items-center gap-2 mt-1">
              <select
                className="text-black px-2 py-1 rounded w-32"
                value={offsetMin}
                onChange={e => setOffsetMin(Math.max(1, parseInt(e.target.value || '20', 10)))}
              >
                {REMINDER_OFFSETS.map(v => (
                  <option key={v} value={v}>
                    {v} minutes
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  // Explicitly persist and confirm the current reminder offset
                  localStorage.setItem(LS_OFFSET, String(Math.max(1, offsetMin)));
                  setMsg(`Reminder offset updated to ${offsetMin} minutes before each prayer.`);
                }}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-sm"
              >
                Update reminder
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              This offset is applied before each prayer time when we generate the .ics file.
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-300">Fixed Isha reminder (HH:mm)</label>
            <input
              className="text-black px-2 py-1 rounded w-28"
              type="time"
              value={ishaTime}
              onChange={e => setIshaTime(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Optional extra reminder every night between Isha and Fajr (added as a separate calendar event).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
           <button
            onClick={() => exportIcs(1, '1days')}
            className="px-3 py-1 rounded bg-red-600 hover:bg-blue-500"
          >
            Export 1 day (.ics)
          </button>

            <button
            onClick={() => exportIcs(7, '7days')}
            className="px-3 py-1 rounded bg-orange-600 hover:bg-blue-500"
          >
            Export 7 days (.ics)
          </button>

          <button
            onClick={() => exportIcs(30, '30days')}
            className="px-3 py-1 rounded bg-yellow-600 hover:bg-blue-500"
          >
            Export 30 Days (.ics)
          </button>
          <button
            onClick={() => exportIcs(365, '1year')}
            className="px-3 py-1 rounded bg-green-600 hover:bg-blue-500"
          >
            Export 1 Year (.ics)
          </button>
        </div>

        {msg && (
          <div
            role="status"
            className="mt-2 rounded bg-yellow-900/40 border border-yellow-700 px-3 py-2 text-sm text-yellow-200"
          >
            {msg}
          </div>
        )}

        <p className="text-xs text-gray-400">
          If you feel unfomfortable exporting 7 days, 1 month or 1 year at once,<span className="font-semibold"> try exporting the 1 day .ics file. </span>
          That way you can test it first without needing to mass delete events from your calendar.
          </p>

        <p className="text-xs text-gray-400">
          .ics is generated with your current location &amp; settings. If you travel, export again so your calendar
          matches your new city.
          
        </p>
      </section>

      <section className="space-y-3 p-3 rounded-md bg-gray-800">
        <h3 className="font-semibold">Local Data</h3>
        <p className="text-xs text-gray-400">
          Export, import, or reset Athan PWA data stored on this device.
        </p>
        <button
          type="button"
          onClick={openBackupRestore}
          className="px-3 py-2 rounded bg-teal-600 hover:bg-teal-500 font-semibold"
        >
          Backup and Restore
        </button>
      </section>
    </div>
  )
}


/*import { useEffect, useState } from 'react'
import {
  loadSettings,
  saveSettings,
  type MethodKey,
  type MadhabKey,
  type HighLatKey,
  type PrayerSettings,
  computePrayerTimes
} from '../lib/prayer'
import { getUserLocation } from '../lib/location'
import { buildIcsForDates, downloadICS } from '../lib/ics'

const METHODS: MethodKey[] = ['MuslimWorldLeague','UmmAlQura','Egyptian','Karachi','Dubai','Qatar','Kuwait','MoonsightingCommittee','NorthAmerica','Singapore','Tehran','Turkey']
const MADHABS: MadhabKey[] = ['Shafi','Hanafi']
const HIGHLATS: HighLatKey[] = ['MiddleOfTheNight','SeventhOfTheNight','TwilightAngle']
const REMINDER_OFFSETS: number[] = [5, 10, 15, 20, 30, 45, 50]

const LS_OFFSET = 'reminderOffsetMin'
const LS_ISHA_FIXED = 'ishaFixedTime'

export default function Settings(){
  const [s,setS]=useState(loadSettings())
  const [offsetMin,setOffsetMin]=useState<number>(()=> {
    // prefer new key; fallback to legacy key 'reminderMinutesBefore'
    const raw = localStorage.getItem(LS_OFFSET) ?? localStorage.getItem('reminderMinutesBefore') ?? '20'
    const n = parseInt(raw,10)
    return Number.isFinite(n) ? Math.max(1, n) : 20
  })
  const [ishaTime,setIshaTime]=useState<string>(()=> localStorage.getItem(LS_ISHA_FIXED) || '22:00')
  const [msg,setMsg]=useState('')

  function update<K extends keyof PrayerSettings>(k: K, v: PrayerSettings[K]) {
    const n: PrayerSettings = { ...s, [k]: v } as PrayerSettings
    setS(n); saveSettings(n)
  }

  useEffect(()=>{ localStorage.setItem(LS_OFFSET, String(Math.max(1, offsetMin))) },[offsetMin])
  useEffect(()=>{ localStorage.setItem(LS_ISHA_FIXED, ishaTime) },[ishaTime])

  async function exportIcs(days:number, label:string){
    const loc=await getUserLocation(); if(!loc) { setMsg('Location permission required.'); return }
    const base=new Date()
    const all:{title:string;when:Date}[]=[]
    for(let d=0; d<days; d++){
      const day=new Date(base); day.setDate(day.getDate()+d)
      const pt=computePrayerTimes({latitude:loc.coords.latitude, longitude:loc.coords.longitude}, day, s)
      all.push(
        {title:'Fajr',when:pt.fajr},
        {title:'Sunrise',when:pt.sunrise},
        {title:'Dhuhr',when:pt.dhuhr},
        {title:'Asr',when:pt.asr},
        {title:'Maghrib',when:pt.maghrib},
        {title:'Isha',when:pt.isha}
      )
      if(ishaTime){
        const [h,m]=ishaTime.split(':').map(Number)
        const custom=new Date(day); custom.setHours(h??23,m??59,0,0)
        all.push({title:'Isha Reminder (custom time)', when:custom})
      }
    }
    const ics = buildIcsForDates(all, `Athan Reminders (${label})`, 'ATHAN-PWA', offsetMin)
    downloadICS(`athan-reminders-${label}_${loc.coords.latitude.toFixed(3)}_${loc.coords.longitude.toFixed(3)}.ics`, ics)
    setMsg(`Downloaded .ics for ${label}.`)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Settings</h2>

      <section className="space-y-4 p-3 rounded-md bg-gray-800">
        <div><label className="block mb-1">Calculation Method:</label>
          <select className="text-black" value={s.method} onChange={e=>update('method', e.target.value as MethodKey)}>{METHODS.map(m=><option key={m} value={m}>{m}</option>)}</select>
        </div>
        <div><label className="block mb-1">Madhab:</label>
          <select className="text-black" value={s.madhab} onChange={e=>update('madhab', e.target.value as MadhabKey)}>{MADHABS.map(m=><option key={m} value={m}>{m}</option>)}</select>
        </div>
        <div><label className="block mb-1">High Latitude Rule:</label>
          <select className="text-black" value={s.highLatRule} onChange={e=>update('highLatRule', e.target.value as HighLatKey)}>{HIGHLATS.map(h=><option key={h} value={h}>{h}</option>)}</select>
        </div>
      </section>


      <section className="space-y-4 p-3 rounded-md bg-gray-800">
        <h3 className="font-semibold">Reminders via Calendar (.ics)</h3>

        <p className="text-xs text-gray-400">
          Tip: Calendar export (.ics) lets your device&apos;s calendar handle alerts even when the PWA is closed.
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-300">Reminder offset (minutes before each prayer)</label>
            <div className="flex items-center gap-2 mt-1">
              <select
                className="text-black px-2 py-1 rounded w-32"
                value={offsetMin}
                onChange={e => setOffsetMin(Math.max(1, parseInt(e.target.value || '20', 10)))}
              >
                {REMINDER_OFFSETS.map(v => (
                  <option key={v} value={v}>
                    {v} minutes
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  // Explicitly persist and confirm the current reminder offset
                  localStorage.setItem(LS_OFFSET, String(Math.max(1, offsetMin)));
                  setMsg(`Reminder offset updated to ${offsetMin} minutes before each prayer.`);
                }}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-sm"
              >
                Update reminder
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              This offset is applied before each prayer time when we generate the .ics file.
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-300">Fixed Isha reminder (HH:mm)</label>
            <input
              className="text-black px-2 py-1 rounded w-28"
              type="time"
              value={ishaTime}
              onChange={e => setIshaTime(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Optional extra reminder every night between Isha and Fajr (added as a separate calendar event).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
           <button
            onClick={() => exportIcs(7, '7days')}
            className="px-3 py-1 rounded bg-red-600 hover:bg-blue-500"
          >
            Export 7 days (.ics)
          </button>
          <button
            onClick={() => exportIcs(30, '30days')}
            className="px-3 py-1 rounded bg-yellow-600 hover:bg-blue-500"
          >
            Export 30 Days (.ics)
          </button>
          <button
            onClick={() => exportIcs(365, '1year')}
            className="px-3 py-1 rounded bg-green-600 hover:bg-blue-500"
          >
            Export 1 Year (.ics)
          </button>
        </div>

        {msg && (
          <div
            role="status"
            className="mt-2 rounded bg-yellow-900/40 border border-yellow-700 px-3 py-2 text-sm text-yellow-200"
          >
            {msg}
          </div>
        )}

        <p className="text-xs text-gray-400">
          .ics is generated with your current location &amp; settings. If you travel, export again so your calendar
          matches your new city.
        </p>
      </section>
    </div>
  )
} */
