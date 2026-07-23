type Props = {
  go?: (screen: string) => void
  backTarget?: string
}

export default function Privacy({ go, backTarget = 'Credits' }: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4">
      {go && (
        <button
          type="button"
          onClick={() => go(backTarget)}
          className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:border-teal-700 hover:text-teal-300"
        >
          ← Back to Credits
        </button>
      )}

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase text-teal-400">Your data stays yours</p>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="leading-6 text-gray-300">
          Athan PWA is designed to be offline-first and privacy-respecting. Most features run entirely on your device.
        </p>
      </header>

      <section className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <div>
          <h2 className="font-semibold text-teal-300">Stored on your device</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-300">
            <li>Prayer calculation, Iqama, language, and display preferences.</li>
            <li>Quran bookmarks, downloads, and reading progress.</li>
            <li>Saved locations and the last known coordinates used for local calculations.</li>
            <li>Salah, Ramadan, and Masjid profile records that you choose to save.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-teal-300">Not collected by Athan PWA</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-300">
            <li>No account, advertising identifier, analytics profile, or tracking history.</li>
            <li>No server-side storage of your personal tracker or preference data.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold">Permissions and connectivity</h2>
        <p className="text-sm leading-6 text-gray-300">
          Location is used to calculate prayer times and Qibla direction. Browser notifications are optional, and
          calendar files are generated on your device. You can revoke permissions through your browser at any time.
        </p>
        <p className="text-sm leading-6 text-gray-300">
          Some searches and Quran downloads need an internet connection. Data already saved by the PWA may remain
          available offline through browser storage and app caches.
        </p>
      </section>

      <section className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="font-semibold">Contact</h2>
        <p className="mt-1 text-sm text-gray-300">
          Questions about privacy can be sent to{' '}
          <a className="text-teal-300 underline" href="mailto:aaamaq.contact.us@gmail.com">
            aaamaq.contact.us@gmail.com
          </a>.
        </p>
      </section>
    </div>
  )
}
