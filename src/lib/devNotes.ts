export type DevNote = {
  id: string
  date: string
  version?: string
  title: string
  summary: string[]
}

function isDevNote(value: unknown): value is DevNote {
  if (!value || typeof value !== 'object') return false

  const note = value as Partial<DevNote>
  return (
    typeof note.id === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(note.date ?? '') &&
    typeof note.title === 'string' &&
    (note.version === undefined || typeof note.version === 'string') &&
    Array.isArray(note.summary) &&
    note.summary.every((paragraph) => typeof paragraph === 'string')
  )
}

export async function loadDevNotes(signal?: AbortSignal): Promise<DevNote[]> {
  const response = await fetch('/data/dev-notes.json', {
    cache: 'no-store',
    signal,
  })

  if (!response.ok) {
    throw new Error(`Unable to load dev notes (${response.status})`)
  }

  const payload: unknown = await response.json()
  if (!Array.isArray(payload)) {
    throw new Error('Dev notes must be an array')
  }

  return payload
    .filter(isDevNote)
    .sort((left, right) => right.date.localeCompare(left.date))
}

export function formatDevNoteDate(date: string): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
