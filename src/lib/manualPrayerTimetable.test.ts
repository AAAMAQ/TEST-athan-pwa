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
})

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}
