export type HijriDate = {
  year: number
  month: number
  day: number
}

const ISLAMIC_EPOCH = 1948439.5

const ENGLISH_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Sha’ban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qi’dah',
  'Dhu al-Hijjah'
] as const

const ARABIC_MONTHS = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة'
] as const

const ENGLISH_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
const ARABIC_WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] as const

export function getHijriDate(date = new Date()): HijriDate {
  const julianDay = Math.floor(gregorianToJulianDay(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )) + 0.5
  const year = Math.floor((30 * (julianDay - ISLAMIC_EPOCH) + 10646) / 10631)
  const month = Math.min(
    12,
    Math.ceil((julianDay - (29 + islamicToJulianDay(year, 1, 1))) / 29.5) + 1
  )
  const day = Math.floor(julianDay - islamicToJulianDay(year, month, 1) + 1)
  return { year, month, day }
}

export function formatHijri(date = new Date(), locale = 'en'): string {
  const hijri = getHijriDate(date)
  const isArabic = locale.toLowerCase().startsWith('ar')
  const weekdays = isArabic ? ARABIC_WEEKDAYS : ENGLISH_WEEKDAYS
  const months = isArabic ? ARABIC_MONTHS : ENGLISH_MONTHS
  const weekday = weekdays[date.getDay()]
  const month = months[hijri.month - 1]

  if (isArabic) {
    return `${weekday}، ${hijri.day} ${month} ${hijri.year} هـ`
  }
  return `${weekday}, ${month} ${hijri.day}, ${hijri.year} AH`
}

function gregorianToJulianDay(yearValue: number, monthValue: number, day: number) {
  let year = yearValue
  let month = monthValue
  if (month <= 2) {
    year -= 1
    month += 12
  }
  const century = Math.floor(year / 100)
  const correction = 2 - century + Math.floor(century / 4)
  return Math.floor(365.25 * (year + 4716))
    + Math.floor(30.6001 * (month + 1))
    + day
    + correction
    - 1524.5
}

function islamicToJulianDay(year: number, month: number, day: number) {
  return day
    + Math.ceil(29.5 * (month - 1))
    + (year - 1) * 354
    + Math.floor((3 + 11 * year) / 30)
    + ISLAMIC_EPOCH
    - 1
}
