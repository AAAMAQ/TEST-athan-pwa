import { describe, expect, it } from 'vitest'
import { getPrayerWindow } from './prayerWindow'

const at = (hour: number, minute = 0) => new Date(2026, 7, 5, hour, minute)
const times = {
  fajr: at(5),
  sunrise: at(6, 15),
  dhuhr: at(12, 15),
  asr: at(15, 45),
  maghrib: at(18, 35),
  isha: at(19, 50)
}

describe('getPrayerWindow', () => {
  it('uses Sunrise as the state after sunrise instead of leaving Fajr current', () => {
    expect(getPrayerWindow(times, at(9))).toMatchObject({
      currentName: 'Sunrise',
      nextName: 'Dhuhr',
      nextTime: times.dhuhr
    })
  })

  it('shows Sunrise as next after Fajr begins', () => {
    expect(getPrayerWindow(times, at(5, 30))).toMatchObject({
      currentName: 'Fajr',
      nextName: 'Sunrise',
      nextTime: times.sunrise
    })
  })
})
