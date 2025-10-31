export function formatHijri(date = new Date(), locale = navigator.language): string {
  try {
    const options: Intl.DateTimeFormatOptions & { calendar?: string } = { calendar: 'islamic-civil', dateStyle: 'full' }
    const fmt = new Intl.DateTimeFormat(locale, options)
    return fmt.format(date)
  } catch {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date)
  }
}