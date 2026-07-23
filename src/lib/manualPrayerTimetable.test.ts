import { describe, expect, it } from 'vitest'
import * as XLSX from '@e965/xlsx'
import { getManualPrayerTimes, parseManualPrayerTimetableFile } from './manualPrayerTimetable'

describe('manual prayer timetable import', () => {
  it('imports the supported All Days layout and selects the saved madhab columns', async () => {
    const rows: (string | number)[][] = [[
      'Month',
      'Month #',
      'Day',
      'Date',
      'Zuhar',
      'Asar Shafi',
      'Asar Hanafi',
      'Maghrib',
      'Isha Shafi',
      'Isha Hanafi',
      'Fajr',
      'Sunrise'
    ]]
    const current = new Date(2025, 0, 1)
    while (current.getFullYear() === 2025) {
      rows.push([
        current.toLocaleString('en', { month: 'long' }),
        current.getMonth() + 1,
        current.getDate(),
        formatDate(current),
        '12:30 PM',
        '3:45 PM',
        '4:45 PM',
        '6:15 PM',
        '7:30 PM',
        '7:45 PM',
        '5:10 AM',
        '6:25 AM'
      ])
      current.setDate(current.getDate() + 1)
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'All Days')
    const bytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    const file = new File([bytes], 'local-prayer-calendar.xlsx')

    const timetable = await parseManualPrayerTimetableFile(file)
    expect(timetable.rowCount).toBe(365)
    expect(timetable.sourceSheetName).toBe('All Days')

    const shafi = getManualPrayerTimes(timetable, new Date(2026, 5, 17), 'Shafi')
    const hanafi = getManualPrayerTimes(timetable, new Date(2026, 5, 17), 'Hanafi')
    expect(shafi?.asr.getHours()).toBe(15)
    expect(hanafi?.asr.getHours()).toBe(16)
    expect(shafi?.isha.getMinutes()).toBe(30)
    expect(hanafi?.isha.getMinutes()).toBe(45)
  })

  it('imports a standard CSV yearly timetable', async () => {
    const records = makeStandardRecords()
    const csv = [
      'Date,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha',
      ...records.map((record) => [
        record.Date,
        record.Fajr,
        record.Sunrise,
        record.Dhuhr,
        record.Asr,
        record.Maghrib,
        record.Isha
      ].join(','))
    ].join('\n')

    const timetable = await parseManualPrayerTimetableFile(new File([csv], 'chennai.csv', { type: 'text/csv' }))
    expect(timetable.rowCount).toBe(365)
    expect(timetable.sourceSheetName).toBe('CSV')
    expect(getManualPrayerTimes(timetable, new Date(2026, 6, 24), 'Shafi')?.fajr.getMinutes()).toBe(10)
  })

  it('imports JSON records with local metadata', async () => {
    const json = JSON.stringify({
      location: 'Chennai, Tamil Nadu, India',
      latitude: 13.04,
      longitude: 80.17,
      prayerTimes: makeStandardRecords()
    })

    const timetable = await parseManualPrayerTimetableFile(new File([json], 'chennai.json', { type: 'application/json' }))
    expect(timetable.rowCount).toBe(365)
    expect(timetable.sourceSheetName).toBe('JSON')
    expect(timetable.sourceLocation).toBe('Chennai, Tamil Nadu, India')
    expect(timetable.sourceLatitude).toBe(13.04)
    expect(timetable.sourceLongitude).toBe(80.17)
  })
})

function makeStandardRecords() {
  const records = []
  const current = new Date(2025, 0, 1)
  while (current.getFullYear() === 2025) {
    records.push({
      Date: formatDate(current),
      Fajr: '05:10',
      Sunrise: '06:25',
      Dhuhr: '12:30',
      Asr: '16:45',
      Maghrib: '18:15',
      Isha: '19:45'
    })
    current.setDate(current.getDate() + 1)
  }
  return records
}

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}
