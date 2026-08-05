export type PrayerWindow = {
  currentName: string
  currentTime: Date
  nextName: string
  nextTime: Date
}

export type PrayerTimesShape = {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

export function getPrayerWindow(times: PrayerTimesShape, now = new Date(), nextFajr?: Date): PrayerWindow {
  const moments = [
    { name: 'Fajr', time: times.fajr },
    { name: 'Sunrise', time: times.sunrise },
    { name: 'Dhuhr', time: times.dhuhr },
    { name: 'Asr', time: times.asr },
    { name: 'Maghrib', time: times.maghrib },
    { name: 'Isha', time: times.isha }
  ]
  const nextIndex = moments.findIndex((moment) => now < moment.time)
  if (nextIndex === 0) {
    return {
      currentName: 'Isha',
      currentTime: new Date(times.isha.getTime() - 24 * 60 * 60 * 1000),
      nextName: moments[0].name,
      nextTime: moments[0].time
    }
  }
  if (nextIndex > 0) {
    return {
      currentName: moments[nextIndex - 1].name,
      currentTime: moments[nextIndex - 1].time,
      nextName: moments[nextIndex].name,
      nextTime: moments[nextIndex].time
    }
  }
  return {
    currentName: 'Isha',
    currentTime: times.isha,
    nextName: 'Fajr',
    nextTime: nextFajr ?? new Date(times.fajr.getTime() + 24 * 60 * 60 * 1000)
  }
}

export function getPrayerProgress(window: PrayerWindow | null, now = new Date()) {
  if (!window) return 0
  const duration = window.nextTime.getTime() - window.currentTime.getTime()
  if (duration <= 0) return 0
  return Math.min(100, Math.max(0, ((now.getTime() - window.currentTime.getTime()) / duration) * 100))
}
