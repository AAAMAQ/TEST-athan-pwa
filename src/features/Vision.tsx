
export default function Vision() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Our Vision</h1>
      <p className="text-gray-300">
        A reliable, respectful Athan experience that works fully offline, on every device.
        Your time and focus matter: privacy-first, minimal, and accurate by design.
      </p>

      <ul className="list-disc pl-5 space-y-1 text-gray-200">
        <li><span className="font-semibold">Offline-first:</span> Prayer times, Qibla, and Quran without needing the internet.</li>
        <li><span className="font-semibold">Accurate calculations:</span> Powered by the adhan library with configurable methods and madhab.</li>
        <li><span className="font-semibold">Respectful reminders:</span> Subtle notifications and optional calendar export.</li>
        <li><span className="font-semibold">Accessible reading:</span> Arabic-only or Arabic+English, bookmarks, and comfortable typography.</li>
      </ul>

      <p className="text-gray-300">
        This PWA is a continuation of the original Swift app, refined for modern browsers while
        keeping the same principles: simplicity, reliability, and no unnecessary data collection.
      </p>
    </div>
  )
}