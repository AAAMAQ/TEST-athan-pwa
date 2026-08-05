import { describe, expect, it } from 'vitest'
import { createMasjidProfile } from './masjid'
import { buildMasjidProfileText, buildSavedCityProfileText } from './profileSharing'
import { createSavedCity } from './savedCities'

describe('profile sharing', () => {
  it('builds a selected city summary without personal worship data', () => {
    const text = buildSavedCityProfileText(createSavedCity({
      name: 'Chennai Local',
      city: 'Chennai',
      country: 'India',
      countryCode: 'IN',
      latitude: 13.0827,
      longitude: 80.2707,
      calculationMode: 'manual-method',
      calculationMethod: 'Karachi',
      madhab: 'Hanafi',
      notes: 'Local preset'
    }))

    expect(text).toContain('Chennai Local')
    expect(text).toContain('Coordinates: 13.0827, 80.2707')
    expect(text).toContain('Method: Karachi')
    expect(text).not.toContain('Salah Tracker')
    expect(text).not.toContain('Quran progress')
  })

  it('builds a selected masjid schedule including its intentionally shared location note', () => {
    const profile = createMasjidProfile()
    profile.name = 'Central Masjid'
    profile.city = 'Chennai'
    profile.address = 'Main Road'
    profile.iqamaRules.Fajr = { mode: 'fixed', fixedTime: '05:30', offsetMinutes: 20 }
    profile.jummahSlots = [{ id: 'one', label: 'First Jumu’ah', khutbahTime: '12:30', iqamaTime: '13:00', notes: 'Main hall' }]

    const text = buildMasjidProfileText(profile)
    expect(text).toContain('Central Masjid')
    expect(text).toContain('Address/location note: Main Road')
    expect(text).toContain('Fajr: 05:30')
    expect(text).toContain('First Jumu’ah · Khutbah 12:30 · Iqama 13:00 · Main hall')
    expect(text).not.toContain('Ramadan tracker')
  })
})
