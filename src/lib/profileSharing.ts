import { IQAMA_PRAYERS } from './iqama'
import type { MasjidProfile } from './masjid'
import { PRAYER_CORRECTION_KEYS, formatSignedCorrection } from './prayerCorrections'
import type { SavedCity } from './savedCities'

export type ProfileShareResult = 'shared' | 'copied' | 'unavailable' | 'cancelled'

export function buildSavedCityProfileText(city: SavedCity): string {
  const corrections = city.manualCorrections
  const lines = [
    'Athan PWA — Shared City Profile',
    `Name: ${city.name || city.city || 'Unnamed city'}`,
    `Location: ${[city.city, city.country].filter(Boolean).join(', ') || 'Not specified'}`,
    `Coordinates: ${city.latitude}, ${city.longitude}`,
    `Country code: ${city.countryCode}`,
    `Timezone: ${city.timezone || 'Not specified'}`,
    `Calculation mode: ${city.calculationMode}`,
    `Method: ${city.calculationMethod}`,
    `Madhab: ${city.madhab}`,
    `High-latitude rule: ${city.highLatitudeRule}`
  ]

  if (corrections) {
    lines.push(`Corrections: ${PRAYER_CORRECTION_KEYS.map((key) => `${key} ${formatSignedCorrection(corrections[key])} min`).join(' · ')}`)
  }
  if (city.manualTimetable) {
    lines.push(`Manual timetable: ${city.manualTimetable.sourceFileName} (${city.manualTimetable.rowCount} dates; timetable rows are not included in this share)`)
  }
  if (city.notes?.trim()) lines.push(`Notes: ${city.notes.trim()}`)
  lines.push('Shared intentionally from one City Mode profile. No worship tracker or Quran activity is included.')
  return lines.join('\n')
}

export function buildMasjidProfileText(profile: MasjidProfile): string {
  const lines = [
    'Athan PWA — Shared Masjid Profile',
    `Masjid: ${profile.name || 'Unnamed masjid'}`,
    `City: ${profile.city || 'Not specified'}`,
    `Address/location note: ${profile.address || 'Not specified'}`,
    '',
    'Iqama schedule:'
  ]

  for (const prayer of IQAMA_PRAYERS) {
    const rule = profile.iqamaRules[prayer]
    lines.push(rule.mode === 'fixed'
      ? `${prayer}: ${rule.fixedTime || 'time not set'}`
      : `${prayer}: ${rule.offsetMinutes} minutes after Athan`)
  }

  lines.push('', 'Jumu’ah schedule:')
  if (profile.jummahSlots.length === 0) lines.push('No Jumu’ah slots saved.')
  for (const slot of profile.jummahSlots) {
    const details = [
      slot.label || 'Jumu’ah',
      slot.khutbahTime ? `Khutbah ${slot.khutbahTime}` : '',
      slot.iqamaTime ? `Iqama ${slot.iqamaTime}` : '',
      slot.notes.trim()
    ].filter(Boolean)
    lines.push(details.join(' · '))
  }
  if (profile.notes.trim()) lines.push('', `Notes: ${profile.notes.trim()}`)
  lines.push('', 'Shared intentionally from one Masjid Mode profile. No worship tracker or Quran activity is included.')
  return lines.join('\n')
}

export async function shareProfileText(title: string, text: string): Promise<ProfileShareResult> {
  try {
    if (navigator.share) {
      await navigator.share({ title, text })
      return 'shared'
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return 'copied'
    }
    return 'unavailable'
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    return 'unavailable'
  }
}
