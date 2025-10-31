import React, { useEffect, useState } from 'react'
import { getUserLocation } from '../lib/location'
function bearingToKaaba(lat:number, lon:number){
  const K={ lat:21.4225, lon:39.8262 }
  const φ1=lat*Math.PI/180, φ2=K.lat*Math.PI/180, Δλ=(K.lon-lon)*Math.PI/180
  const y=Math.sin(Δλ)*Math.cos(φ2)
  const x=Math.cos(φ1)*Math.sin(φ2)-Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ)
  const θ=Math.atan2(y,x)*180/Math.PI; return θ<0?θ+360:θ
}
export default function Qibla(){
  const [bearing,setBearing]=useState<number|null>(null)
  useEffect(()=>{(async()=>{ const loc=await getUserLocation(); if(!loc) return; setBearing(bearingToKaaba(loc.coords.latitude, loc.coords.longitude)) })()},[])
  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Qibla Direction</h2>
      {bearing===null ? <p>Calculating…</p> : <>
        <p>🕋 {bearing.toFixed(2)}° from True North</p>
        <div className="mx-auto w-48 h-48 rounded-full border border-gray-600 relative">
          <div className="absolute left-1/2 top-1/2 w-1 h-20 bg-teal-400 origin-bottom" style={{ transform:`translate(-50%,-100%) rotate(${bearing}deg)` }}/>
          <div className="absolute left-1/2 top-1/2 w-1 h-8 bg-gray-500 origin-top" style={{ transform:`translate(-50%,0) rotate(${bearing}deg)` }}/>
        </div>
        <p className="text-xs text-gray-400">Tip: hold device flat, portrait on tablets; recalibrate compass if needed.</p>
      </>}
    </div>
  )
}