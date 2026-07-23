import { refreshDeviceLocation, reverseGeocodeCoordinates, saveCachedLocation } from './locationStore'
import { computePrayerTimes, loadSettings, type PrayerSettings } from './prayer'
import {
  loadSavedCities,
  loadTravelDestinationId,
  prayerTimesForSavedCity,
  settingsForSavedCity,
  type SavedCity
} from './savedCities'

export type PrimaryPrayerContext = {
  times: ReturnType<typeof prayerTimesForSavedCity>
  locationLabel: string
  sourceLabel: string
  settings: PrayerSettings
  savedCity: SavedCity | null
  nextFajr: Date
}

export function loadPrimarySavedCity() {
  const selectedId = loadTravelDestinationId()
  return loadSavedCities().find((city) => city.id === selectedId) ?? null
}

export async function getPrimaryPrayerContext(date = new Date()): Promise<PrimaryPrayerContext> {
  const savedCity = loadPrimarySavedCity()
  if (savedCity) {
    const tomorrow = nextLocalDay(date)
    return {
      times: prayerTimesForSavedCity(savedCity, date),
      locationLabel: formatSavedCityLabel(savedCity),
      sourceLabel: savedCity.calculationMode === 'manual-timetable'
        ? `Imported yearly timetable · ${savedCity.manualTimetable?.sourceFileName || 'Excel'}`
        : `${settingsForSavedCity(savedCity).method} · ${settingsForSavedCity(savedCity).madhab}`,
      settings: settingsForSavedCity(savedCity),
      savedCity,
      nextFajr: prayerTimesForSavedCity(savedCity, tomorrow).fajr
    }
  }

  const state = await refreshDeviceLocation()
  if (!state.location) throw new Error('Location permission is required.')
  let locationLabel = `${state.location.latitude.toFixed(4)}, ${state.location.longitude.toFixed(4)}`
  try {
    const resolved = await reverseGeocodeCoordinates(state.location.latitude, state.location.longitude)
    locationLabel = resolved.label
    saveCachedLocation({
      ...state.location,
      city: resolved.city,
      country: resolved.country,
      countryCode: resolved.countryCode
    })
  } catch {
    // Coordinates remain a useful private fallback when reverse geocoding is unavailable.
  }

  const settings = loadSettings()
  const coordinates = {
    latitude: state.location.latitude,
    longitude: state.location.longitude
  }
  return {
    times: computePrayerTimes(coordinates, date, settings),
    locationLabel,
    sourceLabel: `${settings.method} · ${settings.madhab}`,
    settings,
    savedCity: null,
    nextFajr: computePrayerTimes(coordinates, nextLocalDay(date), settings).fajr
  }
}

export function formatSavedCityLabel(city: SavedCity) {
  const cityName = city.name || city.city || 'Saved location'
  return city.country ? `${cityName}, ${city.country}` : cityName
}

function nextLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
}
