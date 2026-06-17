import { useMemo, useState } from 'react'
import { IQAMA_PRAYERS, type IqamaPrayerName } from '../lib/iqama'
import {
  createJummahSlot,
  createMasjidProfile,
  deleteMasjidProfile,
  loadMasjidProfiles,
  updateMasjidProfile,
  type MasjidIqamaRule,
  type MasjidProfile
} from '../lib/masjid'

type Props = {
  go?: (screen: string) => void
}

export default function MasjidMode({ go }: Props) {
  const [profiles, setProfiles] = useState<MasjidProfile[]>(() => loadMasjidProfiles())
  const [selectedId, setSelectedId] = useState<string>(() => profiles[0]?.id ?? '')
  const [message, setMessage] = useState('')

  const selected = useMemo(() => {
    return profiles.find((profile) => profile.id === selectedId) ?? profiles[0] ?? null
  }, [profiles, selectedId])

  function setSelected(profile: MasjidProfile) {
    setProfiles((current) => current.map((item) => item.id === profile.id ? profile : item))
  }

  function addProfile() {
    const profile = createMasjidProfile()
    setProfiles((current) => [...current, profile])
    setSelectedId(profile.id)
    setMessage('New masjid profile ready. Add details and save.')
  }

  function saveProfile() {
    if (!selected) return
    const next = updateMasjidProfile(selected, profiles)
    setProfiles(next)
    setSelectedId(selected.id)
    setMessage('Masjid profile saved on this device.')
  }

  function removeProfile(profileId: string) {
    if (!window.confirm('Delete this masjid profile from this device?')) return
    const next = deleteMasjidProfile(profileId, profiles)
    setProfiles(next)
    setSelectedId(next[0]?.id ?? '')
    setMessage('Masjid profile deleted.')
  }

  function updateField<K extends keyof MasjidProfile>(key: K, value: MasjidProfile[K]) {
    if (!selected) return
    setSelected({ ...selected, [key]: value })
  }

  function updateIqamaRule(prayer: IqamaPrayerName, nextRule: Partial<MasjidIqamaRule>) {
    if (!selected) return
    setSelected({
      ...selected,
      iqamaRules: {
        ...selected.iqamaRules,
        [prayer]: {
          ...selected.iqamaRules[prayer],
          ...nextRule
        }
      }
    })
  }

  function addJummahSlot() {
    if (!selected) return
    setSelected({
      ...selected,
      jummahSlots: [
        ...selected.jummahSlots,
        createJummahSlot(`${ordinalLabel(selected.jummahSlots.length + 1)} Jumu’ah`)
      ]
    })
  }

  function updateJummahSlot(slotId: string, key: 'label' | 'khutbahTime' | 'iqamaTime' | 'notes', value: string) {
    if (!selected) return
    setSelected({
      ...selected,
      jummahSlots: selected.jummahSlots.map((slot) => slot.id === slotId ? { ...slot, [key]: value } : slot)
    })
  }

  function removeJummahSlot(slotId: string) {
    if (!selected) return
    setSelected({
      ...selected,
      jummahSlots: selected.jummahSlots.filter((slot) => slot.id !== slotId)
    })
  }

  function goBack() {
    if (go) go('More')
    else window.location.hash = '#More'
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Masjid Mode</h1>
        <p className="text-sm text-gray-300">
          Save local mosque Iqama and Jumu’ah schedules on this device.
        </p>
      </header>

      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Saved Masjids</h2>
            <p className="text-xs text-gray-400">Profiles stay local in your browser.</p>
          </div>
          <button type="button" onClick={addProfile} className="rounded bg-teal-600 hover:bg-teal-500 px-4 py-2 font-semibold">
            Create New Profile
          </button>
        </div>

        {profiles.length === 0 ? (
          <p className="rounded bg-gray-900 p-3 text-sm text-gray-300">No masjid profiles yet.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelectedId(profile.id)}
                className={`rounded border p-3 text-left ${selected?.id === profile.id ? 'border-teal-400 bg-teal-900/50' : 'border-gray-700 bg-gray-900 hover:bg-gray-700'}`}
              >
                <div className="font-semibold">{profile.name || 'Unnamed Masjid'}</div>
                <div className="text-sm text-gray-400">{profile.city || 'City not set'}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <section className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Masjid name</span>
              <input value={selected.name} onChange={(event) => updateField('name', event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold">City</span>
              <input value={selected.city} onChange={(event) => updateField('city', event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
            </label>
          </div>

          <label className="block space-y-1 text-sm">
            <span className="font-semibold">Address or short location note</span>
            <input value={selected.address} onChange={(event) => updateField('address', event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
          </label>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Iqama Schedule</h2>
            {IQAMA_PRAYERS.map((prayer) => {
              const rule = selected.iqamaRules[prayer]
              return (
                <div key={prayer} className="rounded border border-gray-700 bg-gray-900 p-3 space-y-3">
                  <div className="font-semibold text-teal-300">{prayer}</div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="space-y-1 text-sm">
                      <span>Mode</span>
                      <select value={rule.mode} onChange={(event) => updateIqamaRule(prayer, { mode: event.target.value as MasjidIqamaRule['mode'] })} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2">
                        <option value="offset">Minutes after Athan</option>
                        <option value="fixed">Fixed time</option>
                      </select>
                    </label>
                    <label className="space-y-1 text-sm">
                      <span>Fixed time</span>
                      <input type="time" value={rule.fixedTime} onChange={(event) => updateIqamaRule(prayer, { fixedTime: event.target.value })} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span>Minutes after Athan</span>
                      <input type="number" min="0" max="1440" value={rule.offsetMinutes} onChange={(event) => updateIqamaRule(prayer, { offsetMinutes: Number(event.target.value) })} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                    </label>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Jumu’ah Slots</h2>
              <button type="button" onClick={addJummahSlot} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">Add Jumu’ah Slot</button>
            </div>
            {selected.jummahSlots.length === 0 && <p className="text-sm text-gray-400">No Jumu’ah slots saved.</p>}
            {selected.jummahSlots.map((slot) => (
              <div key={slot.id} className="rounded border border-gray-700 bg-gray-900 p-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1 text-sm">
                    <span>Label</span>
                    <input value={slot.label} onChange={(event) => updateJummahSlot(slot.id, 'label', event.target.value)} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Khutbah time</span>
                    <input type="time" value={slot.khutbahTime} onChange={(event) => updateJummahSlot(slot.id, 'khutbahTime', event.target.value)} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Iqama time</span>
                    <input type="time" value={slot.iqamaTime} onChange={(event) => updateJummahSlot(slot.id, 'iqamaTime', event.target.value)} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                  </label>
                </div>
                <label className="block space-y-1 text-sm">
                  <span>Notes</span>
                  <input value={slot.notes} onChange={(event) => updateJummahSlot(slot.id, 'notes', event.target.value)} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                </label>
                <button type="button" onClick={() => removeJummahSlot(slot.id)} className="rounded bg-red-900/70 hover:bg-red-800 px-3 py-2 text-sm">
                  Remove Jumu’ah Slot
                </button>
              </div>
            ))}
          </div>

          <label className="block space-y-1 text-sm">
            <span className="font-semibold">General notes</span>
            <textarea value={selected.notes} onChange={(event) => updateField('notes', event.target.value)} rows={3} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
          </label>

          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={saveProfile} className="rounded bg-teal-600 hover:bg-teal-500 px-4 py-3 font-semibold">Save</button>
            <button type="button" onClick={() => removeProfile(selected.id)} className="rounded bg-red-900/70 hover:bg-red-800 px-4 py-3 font-semibold">Delete Profile</button>
            <button type="button" onClick={goBack} className="rounded bg-gray-700 hover:bg-gray-600 px-4 py-3 font-semibold">Back</button>
          </div>

          {message && <p className="rounded bg-gray-900 p-3 text-sm text-teal-300">{message}</p>}
        </section>
      )}
    </div>
  )
}

function ordinalLabel(value: number) {
  if (value === 1) return 'First'
  if (value === 2) return 'Second'
  if (value === 3) return 'Third'
  return `${value}th`
}
