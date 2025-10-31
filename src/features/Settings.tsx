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
import { requestNotificationPermission, scheduleForToday, clearScheduled, showNow } from '../lib/notify.ts'
import { getUserLocation } from '../lib/location'
import { buildIcsForDates, buildIcsForWeek, downloadICS, type DayPrayers } from '../lib/ics'

const METHODS: MethodKey[] = ['MuslimWorldLeague','UmmAlQura','Egyptian','Karachi','Dubai','Qatar','Kuwait','MoonsightingCommittee','NorthAmerica','Singapore','Tehran','Turkey']
const MADHABS: MadhabKey[] = ['Shafi','Hanafi']
const HIGHLATS: HighLatKey[] = ['MiddleOfTheNight','SeventhOfTheNight','TwilightAngle']

type NotifyMode = 'in-app' | 'online' | 'calendar'
const LS_NOTIFY = 'notifyMode'
const LS_OFFSET = 'reminderOffsetMin'
const LS_ISHA_FIXED = 'ishaFixedTime'
const LS_ENABLED = 'remindersEnabled' // legacy toggle for in-app

export default function Settings(){
  const [s,setS]=useState(loadSettings())
  const [notifState,setNotifState]=useState<NotificationPermission>('default')
  // Notification mode & offsets
  const [notifyMode,setNotifyMode] = useState<NotifyMode>(()=> (localStorage.getItem(LS_NOTIFY) as NotifyMode) || 'calendar')
  const [offsetMin,setOffsetMin]=useState<number>(()=> {
    // prefer new key; fallback to legacy key 'reminderMinutesBefore'
    const raw = localStorage.getItem(LS_OFFSET) ?? localStorage.getItem('reminderMinutesBefore') ?? '20'
    const n = parseInt(raw,10)
    return Number.isFinite(n) ? Math.max(1, n) : 20
  })
  const [enabled,setEnabled]=useState<boolean>(()=> localStorage.getItem(LS_ENABLED)==='1')
  const [ishaTime,setIshaTime]=useState<string>(()=> localStorage.getItem(LS_ISHA_FIXED) || '22:00')
  const [busy,setBusy]=useState(false)
  const [msg,setMsg]=useState('')

  function update<K extends keyof PrayerSettings>(k: K, v: PrayerSettings[K]) {
    const n: PrayerSettings = { ...s, [k]: v } as PrayerSettings
    setS(n); saveSettings(n)
  }

  useEffect(()=>{ setNotifState(Notification.permission) }, [])
  useEffect(()=>{ localStorage.setItem(LS_NOTIFY, notifyMode) },[notifyMode])
  useEffect(()=>{ localStorage.setItem(LS_OFFSET, String(Math.max(1, offsetMin))) },[offsetMin])
  useEffect(()=>{ localStorage.setItem(LS_ISHA_FIXED, ishaTime) },[ishaTime])

  async function enableNotifications(){
    const res=await requestNotificationPermission()
    setNotifState(res)
    localStorage.setItem(LS_ENABLED, res==='granted'?'1':'0')
    if(res==='granted') setEnabled(true)
  }

  function persistIshaTime(v:string){ setIshaTime(v) }

  function makeIshaFixedReminder(hhmm:string){
    const [h,m]=hhmm.split(':').map(Number)
    const d=new Date()
    d.setHours(h??23,m??59,0,0)
    return [{ title:'Isha Reminder (custom time)', when:d }]
  }

  async function scheduleToday(){
    if(notifyMode!=='in-app') { setMsg('Switch to "In-app" mode to schedule local notifications.'); return }
    if(!enabled || notifState!=='granted') { setMsg('Notification permission not granted.'); return }
    const loc=await getUserLocation(); if(!loc) { setMsg('Location permission required.'); return }
    const pt=computePrayerTimes({latitude:loc.coords.latitude, longitude:loc.coords.longitude})
    const items=[
      {title:'Fajr',when:pt.fajr},
      {title:'Sunrise',when:pt.sunrise},
      {title:'Dhuhr',when:pt.dhuhr},
      {title:'Asr',when:pt.asr},
      {title:'Maghrib',when:pt.maghrib},
      {title:'Isha',when:pt.isha},
      ...makeIshaFixedReminder(ishaTime)
    ]
    scheduleForToday(items, offsetMin)
    setMsg('Scheduled in-app reminders for today.')
  }

  async function exportIcs(days:number, label:string){
    const loc=await getUserLocation(); if(!loc) { setMsg('Location permission required.'); return }
    const base=new Date()
    const all:{title:string;when:Date}[]=[]
    for(let d=0; d<days; d++){
      const day=new Date(base); day.setDate(day.getDate()+d)
      const pt=computePrayerTimes({latitude:loc.coords.latitude, longitude:loc.coords.longitude}, day)
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
    const ics=buildIcsForDates(all, `Athan Reminders (${label})`)
    downloadICS(`athan-reminders-${label}_${loc.coords.latitude.toFixed(3)}_${loc.coords.longitude.toFixed(3)}.ics`, ics)
    setMsg(`Downloaded .ics for ${label}.`)
  }

  async function exportNext7Days(){
    if(notifyMode!=='calendar') { setMsg('Switch to "Calendar (.ics)" mode to export.'); return }
    try{
      setBusy(true); setMsg('Building 7‑day calendar…')
      const loc=await getUserLocation(); if(!loc) { setMsg('Location permission required.'); setBusy(false); return }
      const days: DayPrayers[] = []
      const today = new Date()
      for (let i = 0; i < 7; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
        const pt = computePrayerTimes({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }, d, s)
        days.push({ fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr, asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha })
      }
      const ics = buildIcsForWeek(days, offsetMin, {
        ishaFixedTime: ishaTime,
        name: 'Athan Reminders (7 days)',
        groupId: 'ATHAN-PWA-7D',
        defaultReminderMin: 10
      })
      const y = today.getFullYear(), m = String(today.getMonth() + 1).padStart(2, '0'), d0 = String(today.getDate()).padStart(2, '0')
      downloadICS(`athan-7days-${y}${m}${d0}.ics`, ics)
      setMsg('Downloaded .ics for next 7 days.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Settings</h2>

      <section className="space-y-3">
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
        <h3 className="font-semibold">Notifications</h3>

        <div className="space-y-2">
          <label className="block text-sm text-gray-300">Mode</label>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2">
              <input type="radio" name="notifyMode" value="in-app" checked={notifyMode==='in-app'} onChange={()=>setNotifyMode('in-app')} />
              <span>In-app (works only when app is open)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="notifyMode" value="online" checked={notifyMode==='online'} onChange={()=>setNotifyMode('online')} />
              <span>Online push (needs internet + permission)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="notifyMode" value="calendar" checked={notifyMode==='calendar'} onChange={()=>setNotifyMode('calendar')} />
              <span>Calendar (.ics) — most reliable</span>
            </label>
          </div>
          <p className="text-xs text-gray-400">
            Tip: Calendar export (.ics) lets your OS handle alerts even when the PWA is closed.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-300">Reminder offset (minutes before next prayer)</label>
            <input className="text-black px-2 py-1 rounded w-28"
                   type="number" min={1} value={offsetMin}
                   onChange={e=>setOffsetMin(Math.max(1, parseInt(e.target.value||'1',10)))} />
          </div>

          <div>
            <label className="block text-sm text-gray-300">Fixed Isha reminder (HH:mm)</label>
            <input className="text-black px-2 py-1 rounded w-28"
                   type="time" value={ishaTime}
                   onChange={e=>persistIshaTime(e.target.value)} />
          </div>

          <div className="flex-1" />

          <button
            className="px-3 py-2 rounded bg-teal-600 hover:bg-teal-500 disabled:opacity-50"
            onClick={exportNext7Days}
            disabled={busy || notifyMode!=='calendar'}
            title={notifyMode==='calendar' ? 'Exports a .ics with next 7 days' : 'Switch to Calendar mode to export'}
          >
            {busy ? 'Preparing…' : 'Export Next 7 Days (.ics)'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={enableNotifications} className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-500">
            {notifState==='granted'?'Notifications Enabled':'Enable Notifications'}
          </button>
          <span className="text-sm text-gray-300">Permission: {notifState}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={()=>showNow('Test','This is a test notification')} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600" disabled={notifState!=='granted'}>
            Send Test
          </button>
          <button onClick={scheduleToday} className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-500" disabled={notifState!=='granted' || notifyMode!=='in-app'}>
            Schedule Today’s Reminders
          </button>
          <button onClick={()=>clearScheduled()} className="px-3 py-1 rounded bg-red-600 hover:bg-red-500">
            Clear Today’s Reminders
          </button>
          <button onClick={()=>exportIcs(30,'30days')} className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500" disabled={notifyMode!=='calendar'}>
            Export 30 Days (.ics)
          </button>
          <button onClick={()=>exportIcs(365,'1year')} className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500" disabled={notifyMode!=='calendar'}>
            Export 1 Year (.ics)
          </button>
        </div>

        {msg && (
          <div role="status" className="mt-2 rounded bg-yellow-900/40 border border-yellow-700 px-3 py-2 text-sm text-yellow-200">
            {msg}
          </div>
        )}

        <p className="text-xs text-gray-400">.ics is generated with your current location & settings. If you travel, export again.</p>
      </section>
    </div>
  )
}