import { useEffect, useState } from 'react'
import { getUserLocation } from '../lib/location'
import { computePrayerTimes } from '../lib/prayer'
const PRAYERS = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'] as const
type PrayerName = typeof PRAYERS[number]
type Row = { Date: string } & Record<PrayerName, string>
export default function PrayerMonth() {
  const today=new Date()
  const [year,setYear]=useState(today.getFullYear())
  const [month,setMonth]=useState(today.getMonth()) // 0..11
  const [rows,setRows]=useState<Row[]>([])
  useEffect(()=>{(async()=>{
    const loc=await getUserLocation(); if(!loc) return
    const results: Row[] = []; const count=new Date(year,month+1,0).getDate()
    for(let d=1; d<=count; d++){
      const date=new Date(year,month,d)
      const pt=computePrayerTimes({latitude:loc.coords.latitude, longitude:loc.coords.longitude}, date)
      const fmt=(dt:Date)=>dt.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      results.push({ Date: String(d), Fajr: fmt(pt.fajr), Sunrise: fmt(pt.sunrise), Dhuhr: fmt(pt.dhuhr), Asr: fmt(pt.asr), Maghrib: fmt(pt.maghrib), Isha: fmt(pt.isha) } as Row)
    } setRows(results)
  })()},[year,month])
  const monthName=(m:number)=>new Date(2000,m,1).toLocaleString([], { month:'long' })
  const prev=()=>{ if(month===0){setMonth(11); setYear(y=>y-1)} else setMonth(m=>m-1) }
  const next=()=>{ if(month===11){setMonth(0); setYear(y=>y+1)} else setMonth(m=>m+1) }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Prayer Times — {monthName(month)} {year}</h2>
      <div className="flex gap-2 justify-center items-center">
        <button className="px-3 py-1 bg-gray-800 rounded" onClick={prev}>◀</button>
        <span>{monthName(month)} {year}</span>
        <button className="px-3 py-1 bg-gray-800 rounded" onClick={next}>▶</button>
        <select className="text-black ml-4" value={year} onChange={e=>setYear(parseInt(e.target.value))}>
          {Array.from({length:11},(_,i)=>today.getFullYear()-5+i).map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="overflow-auto">
        <table className="table min-w-[720px]">
          <thead><tr><th className="pr-4">Date</th>{PRAYERS.map(p=><th key={p} className="pr-4">{p}</th>)}</tr></thead>
          <tbody>{rows.map((r,i)=>(
            <tr key={i}><td className="pr-4">{r.Date}</td>{PRAYERS.map(p=><td key={p} className="pr-4">{r[p]}</td>)}</tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}