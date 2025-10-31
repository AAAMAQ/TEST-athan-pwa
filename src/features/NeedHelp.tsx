import React from 'react'

export default function NeedHelp() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Need Help</h1>

      <nav className="text-sm text-teal-300 space-x-3">
        <a href="#qibla" className="underline">Qibla not working?</a>
        <a href="#quran" className="underline">How to use the Quran</a>
        <a href="#bookmarks" className="underline">Bookmarks</a>
        <a href="#location" className="underline">Location accuracy</a>
        <a href="#notifications" className="underline">Notifications</a>
        <a href="#troubleshooting" className="underline">Troubleshooting</a>
      </nav>

      <section id="qibla" className="space-y-2">
        <h2 className="text-xl font-semibold">Qibla not working or inaccurate?</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-200">
          <li><span className="font-semibold">Hold the device flat</span> (portrait is recommended on tablets).</li>
          <li><span className="font-semibold">Move away from metal</span>, magnets, or electronics that interfere with the compass.</li>
          <li><span className="font-semibold">Recalibrate</span>: slowly draw a figure-8 in the air with your phone.</li>
          <li>Make sure <span className="font-semibold">Location Permission</span> is allowed. The app uses your last known fix if offline.</li>
          <li>If you recently travelled, tap <span className="font-semibold">Refresh</span> on the Home screen to update your position and prayer times.</li>
        </ul>
      </section>

      <section id="quran" className="space-y-2">
        <h2 className="text-xl font-semibold">How to use the Quran view</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-200">
          <li>Choose <span className="font-semibold">Arabic only</span> or <span className="font-semibold">Arabic + English</span> from the Quran tab.</li>
          <li>Use the <span className="font-semibold">chapter/surah chooser</span> to jump to any surah or enter a page number.</li>
          <li>Adjust <span className="font-semibold">font size</span> to make reading comfortable.</li>
        </ul>
      </section>

      <section id="bookmarks" className="space-y-2">
        <h2 className="text-xl font-semibold">Bookmarks</h2>
        <p className="text-gray-200">
          You can bookmark an ayah or page for quick return later. Bookmarks are saved locally on your device and remain available offline.
        </p>
      </section>

      <section id="location" className="space-y-2">
        <h2 className="text-xl font-semibold">Improve location accuracy</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-200">
          <li>Turn on <span className="font-semibold">GPS/Location</span> and go outdoors for a moment.</li>
          <li>On the Home screen, tap <span className="font-semibold">Refresh</span> to capture a new fix. We also cache your last known fix for offline use.</li>
          <li>If Location is denied, you can still set <span className="font-semibold">calculation settings</span> (method, madhab, high-latitude rule) in Settings.</li>
        </ul>
      </section>

      <section id="notifications" className="space-y-2">
        <h2 className="text-xl font-semibold">Notifications & reminders</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-200">
          <li><span className="font-semibold">Calendar (.ics)</span>: Export 7/30/365 days so your OS handles alerts even when the app is closed.</li>
          <li><span className="font-semibold">In-app</span>: Works while the app is open (no sound, simple banner).</li>
          <li><span className="font-semibold">Online push</span>: Planned for a future version (requires internet + permission).</li>
        </ul>
      </section>

      <section id="troubleshooting" className="space-y-2">
        <h2 className="text-xl font-semibold">Troubleshooting tips</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-200">
          <li>If the UI looks blank, open DevTools (⌥⌘I → Console) to see any errors.</li>
          <li>On iOS, add the PWA to Home Screen for the best full-screen experience.</li>
          <li>If you imported an .ics for the wrong city, export a new one after you refresh location.</li>
        </ul>
      </section>
    </div>
  )
}