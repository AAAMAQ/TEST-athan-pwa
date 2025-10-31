
export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>

      <p className="text-gray-300">
        We designed this app to be <span className="font-semibold">offline-first</span> and
        <span className="font-semibold"> privacy-respecting</span>. Most features work entirely on your device.
      </p>

      <h2 className="text-xl font-semibold">What we store</h2>
      <ul className="list-disc pl-5 space-y-1 text-gray-200">
        <li><span className="font-semibold">Settings</span> (calculation method, madhab, high-latitude, UI preferences).</li>
        <li><span className="font-semibold">Quran bookmarks & reading state</span>.</li>
        <li><span className="font-semibold">Last known location</span> (for offline prayer time computation) — lat/lon only.</li>
        <li><span className="font-semibold">Salah tracker entries</span> (when you log them).</li>
      </ul>

      <h2 className="text-xl font-semibold">What we do NOT collect</h2>
      <ul className="list-disc pl-5 space-y-1 text-gray-200">
        <li>No accounts, no analytics, no ads.</li>
        <li>No server-side storage of your personal data.</li>
      </ul>

      <h2 className="text-xl font-semibold">Permissions</h2>
      <ul className="list-disc pl-5 space-y-1 text-gray-200">
        <li><span className="font-semibold">Location</span>: Used only to compute prayer times/Qibla. You can revoke it anytime.</li>
        <li><span className="font-semibold">Notifications</span>: Optional. If enabled, they’re used for reminders; calendar export (.ics) is also available.</li>
      </ul>

      <h2 className="text-xl font-semibold">Connectivity</h2>
      <p className="text-gray-300">
        The app works offline. Some advanced features (e.g., online push) require internet. Quran text may be cached
        for offline reading if fetched online or can be bundled locally depending on your build.
      </p>

      <h2 className="text-xl font-semibold">Contact</h2>
      <p className="text-gray-300">
        For questions about privacy, please reach out via the support links in Credits.
      </p>
    </div>
  )
}