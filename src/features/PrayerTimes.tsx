import { useEffect, useState } from 'react'
import { getUserLocation } from '../lib/location.ts'
import { computePrayerTimes, nextPrayer } from '../lib/prayer'
import PrayerMonth from './PrayerMonth.tsx'

type T = Partial<Record<'fajr'|'sunrise'|'dhuhr'|'asr'|'maghrib'|'isha', Date>>

export default function PrayerTimes() {
  const [times,setTimes]=useState<T>({})
  const [next,setNext]=useState<{name:string;time:Date}|null>(null)
  const [countdown,setCountdown]=useState(''); const [showMonth,setShowMonth]=useState(false)

  useEffect(()=>{(async()=>{
    const loc=await getUserLocation(); if(!loc) return
    const pt=computePrayerTimes({latitude:loc.coords.latitude, longitude:loc.coords.longitude})
    setTimes({fajr:pt.fajr,sunrise:pt.sunrise,dhuhr:pt.dhuhr,asr:pt.asr,maghrib:pt.maghrib,isha:pt.isha})
    setNext(nextPrayer(pt))
  })()},[])
  useEffect(()=>{ if(!next) return; const id=setInterval(()=>{
    const d=Math.max(0,next.time.getTime()-Date.now())
    const h=Math.floor(d/3_600_000), m=Math.floor((d%3_600_000)/60_000), s=Math.floor((d%60_000)/1_000)
    setCountdown(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`)
  },1000); return ()=>clearInterval(id)},[next])

  if (showMonth) return <div className="space-y-4"><button onClick={()=>setShowMonth(false)} className="px-3 py-1 bg-gray-800 rounded">← Back</button><PrayerMonth/></div>

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-2xl font-bold">Prayer Times (Today)</h2>
      {Object.keys(times).length===0 ? <p>Requesting location…</p> : (
        <table className="table">
          <tbody>
            {(['fajr','sunrise','dhuhr','asr','maghrib','isha'] as const).map(k=>(
              <tr key={k}><td className="pr-4 capitalize">{k}</td><td>{times[k]!.toLocaleTimeString()}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {next && <div className="text-teal-300">Next: <span className="capitalize">{next.name}</span> in <strong>{countdown}</strong></div>}
      <div><button onClick={()=>setShowMonth(true)} className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-500">View Prayer Times for Month</button></div>
    </div>
  )
}