import { useEffect, useState } from 'react'

export default function NeedHelp() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Need Help</h1>

      <p className="text-gray-200 text-sm">
        This page is written for the <span className="font-semibold">web version</span> of Athan. It explains how
        to troubleshoot Qibla, how the Quran reader works, how bookmarks behave in the browser, and how to get the
        best results from location and reminders.
      </p>

      <nav className="text-sm text-teal-300 flex flex-wrap gap-3">
        <a href="#downloadapp" className="underline">Download & install the app</a>
        <a href="#downloadics" className="underline">Download and Set reminders via Calendar (.ics)</a>
        <a href="#whatsnew" className="underline">What&apos;s new?</a>
        <a href="#qibla" className="underline">Qibla not accurate?</a>
        <a href="#v3features" className="underline">v3.0.0 features</a>
        <a href="#quran" className="underline">How to use the Quran</a>
        <a href="#bookmarks" className="underline">Quran bookmarks</a>
        <a href="#location" className="underline">Location & accuracy</a>
        <a href="#notifications" className="underline">Reminders & notifications</a>
        <a href="#methods" className="underline"> Which Calculation method & settings to choose?</a>
        <a href="#calculation" className="underline">Calculation method, Madhab & High-latitude rule</a>
        <a href="#troubleshooting" className="underline">Troubleshooting & contact</a>
      </nav>


      {/* WHAT'S NEW */}
      <section id="whatsnew" className="space-y-2">
        <h2 className="text-xl font-semibold">What&apos;s new?</h2>
        <p className="text-gray-200 text-sm">
          The newest feature is <span className="font-semibold">Advanced Athan</span>. This is a separate prayer-time
          tool inside the app that lets you search for a city, country, or coordinates and generate a custom prayer-time
          preview and calendar reminder file for that location.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">What Advanced Athan can do</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">Search any location:</span> Enter a city, country, or coordinates, such as
            <span className="font-mono text-teal-300"> London</span>, <span className="font-mono text-teal-300">New York</span>,
            <span className="font-mono text-teal-300"> Makkah Saudi Arabia</span>, or
            <span className="font-mono text-teal-300"> 21.4225, 39.8262</span>.
          </li>
          <li>
            <span className="font-semibold">Choose a custom date range:</span> Generate prayer times from one date to
            another instead of being limited to only today or a full month.
          </li>
          <li>
            <span className="font-semibold">Choose calculation settings:</span> Select the calculation method and Madhab
            just for Advanced Athan without changing your main Settings page.
          </li>
          <li>
            <span className="font-semibold">Preview the prayer times:</span> Check Fajr, Sunrise, Dhuhr, Asr, Maghrib,
            and Isha before downloading anything.
          </li>
          <li>
            <span className="font-semibold">Download a custom .ics file:</span> Export calendar reminders for the exact
            location, date range, calculation method, Madhab, and reminder time you selected.
          </li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Important: calculation methods differ by country</h3>
        <p className="text-gray-200 text-sm">
          Prayer times can differ between countries, cities, masjids, and Islamic organisations because different
          calculation methods use different Fajr and Isha angles, Asr rules, and high-latitude handling. If you are in
          another country, travelling, or generating a calendar for a different city, please try the available calculation
          methods and compare them with a trusted local masjid or Islamic authority.
        </p>
        <p className="text-gray-200 text-sm">
          If one method looks a few minutes different from another app or website, that can be normal. If the difference
          is large, change the calculation method, check the Madhab setting for Asr, and compare with your local masjid.
          The best setting is usually the one that matches the timetable used by the Muslim community in that area.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Privacy and data use</h3>
        <p className="text-gray-200 text-sm">
          Advanced Athan is designed to stay lightweight and privacy-respecting. The app does not create an account and
          does not store your searches on our server. Location searches may be cached locally in your browser so the same
          city does not need to be looked up again every time.
        </p>
        <p className="text-gray-200 text-sm">
          Some Advanced Athan features use external services to make the search and timetable work properly. Location
          lookup uses OpenStreetMap-based data, timezone lookup may use a timezone service, and prayer-time timetable
          data may be requested from AlAdhan for the selected location and date range. These services are used only to
          provide the feature you requested.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Credits and data sources</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">OpenStreetMap contributors:</span> Used for location search and readable
            place names. Location data © OpenStreetMap contributors.
          </li>
          <li>
            <span className="font-semibold">TimeAPI:</span> Used to help identify the official timezone for searched
            coordinates when needed.
          </li>
          <li>
            <span className="font-semibold">AlAdhan:</span> Used for prayer-time timetable data in Advanced Athan when
            generating prayer-time previews and calendar exports for searched locations.
          </li>
          <li>
            <span className="font-semibold">Adhan calculation library:</span> Used elsewhere in the app for local prayer
            time calculations, especially for current-device location features.
          </li>
        </ul>

        <p className="text-gray-300 text-xs">
          Advanced Athan is still being improved. Always compare prayer times with your local masjid if you are unsure,
          especially in high-latitude areas, during travel, or when generating a long calendar export.
        </p>
      </section>

      <section id="v3features" className="space-y-2">
        <h2 className="text-xl font-semibold">v3.0.0 feature guide</h2>
        <div className="space-y-3 text-sm text-gray-200">
          <p>
            <span className="font-semibold text-teal-300">Qibla:</span> Simple Mode gives a large readable compass,
            turn guidance, Qibla bearing, device heading, distance to the Ka‘bah, and optional haptic feedback.
            Advanced Mode keeps the older numeric compass view. If the compass feels wrong, use the calibration tips
            below and check motion/orientation permission.
          </p>
          <p>
            <span className="font-semibold text-teal-300">Quran:</span> Continue Reading, recently read, per-Surah
            progress, favorite Surahs, and offline Quran controls are available in the Quran screen. Tafsir,
            word-by-word, and recitation tabs are structured for future data/providers and show safe placeholder
            messages when content is not bundled.
          </p>
          <p>
            <span className="font-semibold text-teal-300">Saved Cities / Travel Mode:</span> Open More, then Saved
            Cities. You can search or manually add a city, choose Auto country-based settings, override methods,
            add personal correction offsets, preview prayer times, export ICS, export CSV, or share a plain-text
            timetable. Auto settings are a starting point; always compare with a local masjid when needed.
          </p>
          <p>
            <span className="font-semibold text-teal-300">Manual corrections:</span> Personal Custom Profiles store
            minute offsets, such as Fajr +4 or Isha +5. They do not overwrite the built-in country defaults.
          </p>
          <p>
            <span className="font-semibold text-teal-300">Masjid and Iqama:</span> Local Iqama can load rules from a
            saved masjid profile. Imported settings can be edited without changing the masjid profile unless you tap
            Save Changes Back to Masjid.
          </p>
          <p>
            <span className="font-semibold text-teal-300">Backup, PWA, and privacy:</span> Backup and Restore exports
            known Athan PWA localStorage data only. PWA status in Settings can show install/update/offline state.
            Athan PWA does not upload your personal app data.
          </p>
          <p>
            <span className="font-semibold text-teal-300">Friday and Salah:</span> Home shows Jumu’ah Mubarak on
            Fridays, Prayer Times labels Dhuhr as Jumu’ah visually on Friday, and Salah Tracker includes supportive
            streak/completion insights.
          </p>
        </div>
      </section>

      {/* QIBLA HELP */}
      <section id="qibla" className="space-y-2">
        <h2 className="text-xl font-semibold">Qibla not working or feels inaccurate?</h2>
        <QiblaStatusPanel />
        <p className="text-gray-200 text-sm">
          In this web app, the <span className="font-semibold">Qibla screen</span> shows the angle from your
          location to the Kaaba, for example: <span className="italic">“🕋 257° from True North”</span>. The arrow
          on the screen is rotated to this angle. To face the Qibla, you align your body so that the 
          <span className="font-semibold"> top of your phone</span> or the arrow is pointing in that direction.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Common reasons for inaccuracy</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">Magnetic interference:</span> Phone cases with magnets, metal tables,
            laptops, or other electronics can disrupt the built‑in compass that your browser uses.
            <br />
            <span className="font-semibold">Fix:</span> Remove magnetic/metal cases and move away from large metal
            objects or electronics before checking Qibla.
          </li>
          <li>
            <span className="font-semibold">Compass calibration:</span> Your device compass may need to be
            recalibrated.
            <br />
            <span className="font-semibold">Fix:</span> Move your phone slowly in a figure‑8 motion and follow any
            calibration prompts from your operating system (Android/iOS). This helps the browser get a better
            heading.
          </li>
          <li>
            <span className="font-semibold">Weak GPS or location signal:</span> Inside buildings or underground
            areas, your browser may only get a rough location based on Wi‑Fi, which can slightly shift the Qibla
            angle.
            <br />
            <span className="font-semibold">Fix:</span> Step near a window or go outdoors for a more accurate
            location, then reopen the Qibla screen or tap <span className="font-semibold">Refresh</span> on the Home
            screen to update your position.
          </li>
          <li>
            <span className="font-semibold">Poor internet connection:</span> On some devices, a very weak data
            connection can delay or block location updates.
            <br />
            <span className="font-semibold">Fix:</span> Make sure you have a reasonably stable connection, then try
            again.
          </li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">What you can do to confirm accuracy</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Compare with <span className="font-semibold">more than one Qibla app</span> or website.</li>
          <li>Use <span className="font-semibold">natural landmarks</span> (sun, shadows) according to local guidance.</li>
          <li>Check with a <span className="font-semibold">reliable physical compass</span> if available.</li>
          <li>Ask your <span className="font-semibold">local masjid</span> or community if you are unsure.</li>
          <li>Compare with <span className="font-semibold">more than one phone</span> it might be that the phones GPS could be broken.</li>


        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Quick fixes to try first</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Remove your phone case or metal/magnetic attachments.</li>
          <li>Close all tabs with heavy apps, then reopen the Athan web app.</li>
          <li>Restart your phone or browser to clear out any sensor issues.</li>
          <li>Check that <span className="font-semibold">Location</span> is allowed for this site in your browser settings.</li>
        </ul>

        <p className="text-gray-300 text-xs">
          There is no separate “recalibrate” button inside the web app. Calibration is controlled by your device and
          browser. If you keep having issues, try using a different browser on the same device to compare.
        </p>

          <p className="text-gray-300 text-xs">
            Note that if your device’s GPS is not working, then trying different apps will also give incorrect results. This is because GPS accuracy mainly depends on the device’s hardware — specifically the GPS receiver and antenna — not the app you are using. If the hardware cannot lock on to satellites or is giving weak or incorrect signals, no app will be able to fix or override that. In that case, only using someone else’s phone with a properly functioning GPS will give accurate results.

          </p>

          <p className="text-gray-300 text-xs">
          Also when you are in Kabba (Make dua for everyone) DONT CHECK QIBLA because you are already in the location of Qibla so the compass will be confused.
          May Allah bless you all.
        </p>
      </section>

      {/* QURAN HELP */}
      <section id="quran" className="space-y-2">
        <h2 className="text-xl font-semibold">How to use the Quran view</h2>
        <p className="text-gray-200 text-sm">
          The Quran feature in this web app is a <span className="font-semibold">text‑based reader</span> designed
          for mobile and desktop browsers. It does not use "pages" like a PDF; instead, you select a
          <span className="font-semibold"> surah (chapter)</span> and scroll through its ayahs.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Reading modes</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">Arabic + English:</span> Shows Arabic text with an English translation
            under each ayah. This is the default for many users.
          </li>
          <li>
            <span className="font-semibold">Arabic only:</span> Shows only the Arabic text for a cleaner recitation
            view.
          </li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Choosing a surah</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Open the <span className="font-semibold">Quran</span> tab from the Home screen.</li>
          <li>You will see a list of all surahs with their Arabic and English names.</li>
          <li>Tap or click any surah to load its verses. The app will fetch the text once and keep it for that session.</li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Adjusting text size</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Use the <span className="font-semibold">font size control</span> at the top of the Quran view.</li>
          <li>The size is remembered in your browser using <span className="font-semibold">local storage</span>, so the
              same device will keep your preferred reading size even after you close the tab.</li>
        </ul>

        <p className="text-gray-300 text-xs">
          Quran in the web app is currently in <span className="font-semibold">beta</span>. More translations and
          navigation options (like Juz and Hizb navigation) may be added in future updates.
        </p>
      </section>

      {/* BOOKMARKS HELP */}
      <section id="bookmarks" className="space-y-2">
        <h2 className="text-xl font-semibold">Quran bookmarks (web version)</h2>
        <p className="text-gray-200 text-sm">
          In this web app, bookmarks are attached to <span className="font-semibold">individual ayahs</span>, not
          pages. This gives you very precise control over where you want to return.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Adding or removing a bookmark</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>While viewing a surah, each ayah has a small <span className="font-semibold">bookmark icon</span>.</li>
          <li>Tap or click the icon to bookmark that ayah. Tapping again removes the bookmark.</li>
          <li>You can bookmark as many ayahs as you like. There is no fixed limit in the web version.</li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Viewing only your bookmarks</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Use the <span className="font-semibold">“View Bookmarks”</span> /
            <span className="font-semibold"> “Showing Bookmarks”</span> button near the top of the Quran view.</li>
          <li>When enabled, the list will only show ayahs that you have bookmarked for that surah.</li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Clearing bookmarks</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            Tap <span className="font-semibold">“Clear Bookmarks”</span> to remove <span className="font-semibold">all
            saved ayah bookmarks</span> from this browser.
          </li>
          <li>
            Bookmarks are stored locally in your browser. Clearing them here does not affect any other device.
          </li>
        </ul>

        <p className="text-gray-300 text-xs">
          All bookmarks and preferences are saved on your device only. If you clear your browser data or use
          a different phone/computer, your bookmarks will not automatically sync.
        </p>
      </section>

      {/* LOCATION HELP */}
      <section id="location" className="space-y-2">
        <h2 className="text-xl font-semibold">Location & prayer time accuracy</h2>
        <p className="text-gray-200 text-sm">
          The web app uses your <span className="font-semibold">browser location</span> to calculate prayer times and
          the Qibla angle. On phones this usually comes from GPS; on desktops it may be based on Wi‑Fi or IP, which is
          less precise.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Getting a good location fix</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Allow <span className="font-semibold">Location</span> when the browser asks for permission.</li>
          <li>On the Home screen, tap <span className="font-semibold">Refresh</span> to request a new location and
              recalculate today's prayer times.</li>
          <li>If you recently travelled, use <span className="font-semibold">Refresh</span> after arriving in the new
              city so that times update correctly.</li>
          <li>Going outdoors or near a window usually improves accuracy.</li>
        </ul>

        <p className="text-gray-300 text-xs">
          If location is denied, the app may not be able to compute accurate times. For now, the web version does not
          include full manual location entry, so enabling browser location is recommended.
        </p>
      </section>

      {/* CALCULATION METHOD, MADHAB & HIGH-LATITUDE RULE */}
      <section id="calculation" className="space-y-2">
        <h2 className="text-xl font-semibold">Calculation method, Madhab & High‑latitude rule</h2>
        <p className="text-gray-200 text-sm">
          Athan calculates prayer times using standard astronomy formulas plus a few important settings. These settings
          do <span className="font-semibold">not change your Islamic belief</span>, they only control how the time is
          calculated in edge cases. If your app version has a <span className="font-semibold">Settings</span> screen for
          prayer time calculation, you may see three options:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li><span className="font-semibold">Calculation method</span> – which organisation&apos;s angles/rules to use (MWL, Umm al‑Qura, etc.).</li>
          <li><span className="font-semibold">Madhab (Asr)</span> – whether Asr starts when the object&apos;s shadow is equal to its length (Shafi&apos;i/others) or double (Hanafi).</li>
          <li><span className="font-semibold">High‑latitude rule</span> – how to handle Fajr and Isha when nights are very short or the sun barely sets.</li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">1. Choosing a calculation method</h3>
        <p className="text-gray-200 text-sm">
          For most users, the default method is fine (often <span className="font-semibold">Muslim World League (MWL)</span>).
          If your local masjid or Islamic centre publishes a timetable, that is the best reference:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li><span className="font-semibold">Ask your masjid</span> which method they use, and select the same one.</li>
          <li>If you are unsure, you can usually keep <span className="font-semibold">MWL</span> or whatever the app sets as default.</li>
          <li>If you compare with another app or printed timetable and the difference is only a few minutes, that is normal.</li>
        </ul>

        <p className="text-gray-300 text-xs">
          Examples (not strict rules): Many European cities commonly use MWL or similar; in Saudi Arabia you may see Umm al‑Qura; UAE uses Dubai; In Egypt its often Egyptian General Authority of Survey; and many more;
          some regions follow local official timetables that match a specific method. Its best to check with your local masjid or Islamic authority if unsure. If that is not possible search in google for your city name + prayer times + method to get an idea of what is commonly used in your area.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">2. Choosing Madhab for Asr</h3>
        <p className="text-gray-200 text-sm">
          The <span className="font-semibold">Madhab setting only affects Asr time.</span> It does not change Fajr, Dhuhr,
          Maghrib or Isha.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li><span className="font-semibold">Standard / Shafi&apos;i (shadow = 1× length):</span> Used by Shafi&apos;i, Maliki, Hanbali and many global timetables.</li>
          <li><span className="font-semibold">Hanafi (shadow = 2× length):</span> Used by Hanafi communities, especially in India, Pakistan, parts of the UK, etc.</li>
        </ul>
        <p className="text-gray-200 text-sm">
          If you follow the <span className="font-semibold">Hanafi madhab</span>, choose the Hanafi option so Asr will start later.
          Otherwise, you can keep the standard (Shafi&apos;i) option.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">3. High‑latitude rule (very long days/nights)</h3>
        <p className="text-gray-200 text-sm">
          In countries far from the equator (for example, <span className="font-semibold">UK, Scandinavia, Canada, northern Europe</span>),
          some summer nights are very short and the sun does not go far below the horizon. In these cases, normal formulas
          can give extreme or even impossible times for <span className="font-semibold">Fajr</span> and <span className="font-semibold">Isha</span>.
        </p>
        <p className="text-gray-200 text-sm">
          The <span className="font-semibold">High‑latitude rule</span> tells the app how to adjust those times in a balanced way.
          You may see options such as:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li><span className="font-semibold">Middle of the night:</span> Places Fajr and/or Isha halfway between sunset and sunrise.</li>
          <li><span className="font-semibold">One‑seventh of the night:</span> Uses 1/7 of the night length from sunset/fajr as a boundary.</li>
          <li><span className="font-semibold">Angle‑based / Nearest latitude:</span> Uses a reference latitude or fixed angle when local values break down.</li>
        </ul>
        <p className="text-gray-200 text-sm">
          If you live in a high‑latitude area, the safest option is to <span className="font-semibold">match your local masjid&apos;s timetable</span>.
          Ask which rule they follow or which other well-known app matches their times most closely, and choose the same option here.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">4. What if I move to another country?</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>After you travel, open the app, allow <span className="font-semibold">Location</span>, and tap <span className="font-semibold">Refresh</span> on the Home screen.</li>
          <li>Check a local masjid timetable in the new country and, if needed, adjust the <span className="font-semibold">method, madhab and high‑latitude rule</span> to match.</li>
          <li>You do <span className="font-semibold">not</span> need to change settings every day; set them once for your region and they will stay saved on this device.</li>
        </ul>

        <p className="text-gray-300 text-xs">
          If you are ever unsure: follow your local scholar, imam or masjid timetable first, and then adjust the app so that
          its times closely match what they use. The app is only a tool to help you, not a replacement for knowledgeable guidance.
        </p>
      </section>

      {/* NOTIFICATIONS HELP */}
      <section id="notifications" className="space-y-2">
        <h2 className="text-xl font-semibold">Reminders & notifications (web version)</h2>
        <p className="text-gray-200 text-sm">
          The current web app focuses on accurate times and Quran reading. It does
          <span className="font-semibold"> not yet send push notifications or play full Athan audio</span> in the
          background like a native app.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">How you can still set reminders</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            Use the <span className="font-semibold">Home screen</span> to see the next prayer and live countdown.
            Keeping the tab open helps you stay aware of upcoming times.
          </li>
          <li>
            Use your phone’s <span className="font-semibold">built‑in alarm or calendar app</span> to create recurring
            reminders based on the times shown in the app.
          </li>
          <li>
            A good time for <span className="font-semibold">Isha‑related reminders</span> is usually after Isha Athan
            and before Fajr. For example, if Fajr is at 5:00 AM and Isha is at 8:00 PM, a personal reminder window
            between <span className="font-semibold">9:00 PM and 11:59 PM</span> may work well for many people.
          </li>
        </ul>

        <p className="text-gray-300 text-xs">
          Iqama times and advanced widgets are not yet implemented in this web version. They may be added in the
          future as the app evolves.
        </p>
      </section>

      {/* HOW TO DOWNLOAD THE APP */}
      <section id="downloadapp" className="space-y-2">
        <h2 className="text-xl font-semibold">📱 How to Install Athan App (Android & iPhone)</h2>

        <p className="text-gray-200 text-sm">
          This is the <span className="font-semibold">beta-testing</span> launch of the Athan web app. You can
          install it to your home screen so it behaves like a normal app and works offline after the first load.
          The current beta is available at:
        </p>
        <p className="text-teal-300 text-sm font-mono break-all">
          https://test-athan-pwa.vercel.app/
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">✅ Install on Android</h3>
        <p className="text-gray-200 text-sm">
          Installing the Athan App on Android is very easy:
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">Open the website in Chrome</span>
            <br />
            Visit: <span className="font-mono text-teal-300">https://test-athan-pwa.vercel.app/</span>
          </li>
          <li>
            <span className="font-semibold">Look for “Install App”</span>
            <br />
            Most Android phones will automatically show:
            <ul className="list-disc pl-5 mt-1">
              <li>A banner at the bottom saying <span className="italic">“Add to Home Screen”</span>, or</li>
              <li>A pop-up saying <span className="italic">“Install App”</span></li>
            </ul>
            Tap it.
          </li>
          <li>
            <span className="font-semibold">If you don&apos;t see it</span>
            <br />
            Tap the three dots (⋮) in the top-right corner of Chrome and choose
            <span className="font-semibold"> Add to Home screen</span>.
          </li>
          <li>
            <span className="font-semibold">Confirm</span>
            <br />
            Tap <span className="font-semibold">Add</span>, then <span className="font-semibold">Add to Home screen</span> again.
          </li>
        </ol>
        <p className="text-gray-300 text-xs">
          That&apos;s it — the app will now appear on your home screen just like a normal app, with your Athan icon.
        </p>

        <hr className="border-gray-700 my-3" />

        <h3 className="font-semibold text-teal-300 text-sm mt-2">🍎 Install on iPhone (iOS – Safari only)</h3>
        <p className="text-gray-200 text-sm">
          Apple requires a few extra steps, but it&apos;s still very easy:
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">Open the website in Safari</span>
            <br />
            Visit: <span className="font-mono text-teal-300">https://test-athan-pwa.vercel.app/</span>
            <br />
            <span className="text-xs text-gray-300">
              Important: iOS only allows installation from <span className="font-semibold">Safari</span>, not Chrome.
            </span>
          </li>
          <li>
            <span className="font-semibold">Tap the Share button</span>
            <br />
            At the bottom of the screen, tap the square with the arrow pointing up (⬆️).
          </li>
          <li>
            <span className="font-semibold">Scroll down</span>
            <br />
            Find and tap <span className="font-semibold">Add to Home Screen</span>.
          </li>
          <li>
            <span className="font-semibold">Confirm the name</span>
            <br />
            You will see <span className="font-mono">Athan PWA</span>. Tap <span className="font-semibold">Add</span> (top-right corner).
          </li>
        </ol>
        <p className="text-gray-300 text-xs">
          The Athan app will now appear on your home screen with the icon.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">In short</h3>
        <div className="text-gray-200 text-sm space-y-1">
          <p>
            <span className="font-semibold">Android:</span> Open in Chrome → “Add to Home Screen” → Confirm.
          </p>
          <p>
            <span className="font-semibold">iPhone:</span> Open in Safari → Share → “Add to Home Screen” → Add.
          </p>
        </div>

        <p className="text-gray-300 text-xs mt-2">
          After you install the app to your home screen using the above steps, it will work offline after the first
          successful load, InshaAllah. Some features like initial Quran loading still need an internet connection the
          first time you open them, but afterwards the app is designed to be lightweight and cache data on your
          device.
        </p>
      </section>

      {/* HOW TO USE PRAYER TIME METHODS */}
      <section id="methods" className="space-y-2">
        <h2 className="text-xl font-semibold">Which calculation method should I choose?</h2>
        <p className="text-gray-200 text-sm">
          Different organisations use slightly different angles and rules to calculate <span className="font-semibold">Fajr</span>
          and <span className="font-semibold">Isha</span>. This does <span className="font-semibold">not change your aqeedah</span> – it only
          affects a few minutes earlier or later. The safest option is always to <span className="font-semibold">match your local masjid or
          Islamic authority</span> and then set the app to use the same method.
        </p>

        <p className="text-gray-200 text-sm">
          Below is a very simple overview of the most common methods and where they are often used. These are
          <span className="font-semibold">general patterns, not strict rules</span> – individual masjids may follow something different.
        </p>

        <div className="overflow-x-auto text-xs sm:text-sm">
          <table className="min-w-full border border-gray-700 text-left">
            <thead className="bg-gray-800">
              <tr>
                <th className="border-b border-gray-700 px-2 py-1 font-semibold">Method</th>
                <th className="border-b border-gray-700 px-2 py-1 font-semibold">Common regions / examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Muslim World League (MWL)</td>
                <td className="border-b border-gray-700 px-2 py-1">Many European cities, Russia, Australia, parts of Africa; often used as a global default when no local authority is known.</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Umm al-Qura (Makkah)</td>
                <td className="border-b border-gray-700 px-2 py-1">Saudi Arabia (official), sometimes nearby Gulf countries.</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Egyptian General Authority</td>
                <td className="border-b border-gray-700 px-2 py-1">Egypt, and often Jordan, Lebanon, Syria, Palestine and surrounding areas.</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Karachi (Hanafi)</td>
                <td className="border-b border-gray-700 px-2 py-1">Pakistan, India, Bangladesh, Afghanistan, Sri Lanka; some Hanafi mosques in the UK and elsewhere.</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Dubai</td>
                <td className="border-b border-gray-700 px-2 py-1">United Arab Emirates (official).</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Qatar</td>
                <td className="border-b border-gray-700 px-2 py-1">Qatar (official).</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Kuwait</td>
                <td className="border-b border-gray-700 px-2 py-1">Kuwait (official).</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Moonsighting Committee</td>
                <td className="border-b border-gray-700 px-2 py-1">Some communities in North America, UK, South Africa and elsewhere who follow Moonsighting Committee Worldwide (MCW).</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">North America / ISNA</td>
                <td className="border-b border-gray-700 px-2 py-1">United States and Canada (especially older timetables and apps).</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Singapore</td>
                <td className="border-b border-gray-700 px-2 py-1">Singapore (MUIS) and sometimes nearby regions.</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Tehran</td>
                <td className="border-b border-gray-700 px-2 py-1">Iran (official) and some Shia communities.</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Turkey (Diyanet)</td>
                <td className="px-2 py-1">Turkey (official), Turkish communities abroad, sometimes Cyprus.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-gray-300 text-xs">
          If the times in the app differ slightly (a few minutes) from your local masjid, that is normal and often
          due to different methods or rounding. If the difference is large, ask which method your masjid uses and
          select the closest match above. When in doubt, follow your local masjid or scholar first, and use the app
          as a helpful tool, not as a replacement for knowledge.
        </p>
      </section>
            
            {/* HOW TO USE CALENDAR NOTIFICATIONS */}
            <section id="downloadics" className="space-y-2">
        <h2 className="text-xl font-semibold">Reminders via Calendar (.ics)</h2>
        <p className="text-gray-200">
          You can let your phone&apos;s calendar handle prayer alerts even when the PWA is closed by exporting an
          .ics file from the Settings screen.
        </p>

        <h3 className="font-semibold mt-3">Step-by-step: Exporting reminders</h3>
        <ol className="list-decimal pl-5 space-y-1 text-gray-200">
          <li>Open the <span className="font-semibold">Settings</span> tab at the bottom of the app.</li>
          <li>Scroll to the section called <span className="font-semibold">Reminders via Calendar (.ics)</span>.</li>
          <li>
            In <span className="font-semibold">Reminder offset (minutes before each prayer)</span>, type how many
            minutes before every prayer you want the reminder (for example 10, 15, or 20).
          </li>
          <li className="font-semibold">
            IMPORTANT: Make sure that the calculation method is right to your country and city, since that affects prayer times.
            failing to do so may lead to incorrect reminder times.
          </li>
          <li>
            (Optional) Set your <span className="font-semibold">Fixed Isha reminder (HH:mm)</span> time between Isha
            and Fajr if you want an extra nightly reminder as a separate calendar event.
          </li>
          <li>
            Tap one of the export buttons:
            <span className="font-semibold"> Export 1 day (.ics)</span>,
            <span className="font-semibold"> Export 7 days (.ics)</span>,
            <span className="font-semibold"> Export 30 Days (.ics)</span>, or
            <span className="font-semibold"> Export 1 Year (.ics)</span>.
          </li>
          <li>
            When the .ics file finishes downloading, open it. Your device will ask which calendar to add the events to –
            you can use an existing calendar or create a new one like. Its better to create a  <span className="font-semibold">  NEW CALENDAR </span> named
            <span className="font-semibold"> &quot;Athan Reminders&quot;</span> to keep them separate. This will make sure that it will be easy to delete if you travel. As Calendar apps do not support mass event deleting.
          </li>
          <li>
            Make sure that calendar is visible in your calendar app and that notifications are allowed for it in your
            phone&apos;s system settings.
          </li>
        </ol>

        <h3 className="font-semibold mt-4">Important notes & things to watch out for</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200">
          <li>
            <span className="font-semibold">Your current location is used when exporting.</span> If you travel to a new
            city or country, export a fresh .ics so the reminders match the new prayer times.
          </li>
          <li>
            <span className="font-semibold">Changing settings does not update old events automatically.</span> If you
            change calculation method, madhab, high latitude rule, reminder offset, or fixed Isha time, export and
            import a new .ics file. Old events will stay as they are.
          </li>
          <li>
            <span className="font-semibold">Avoid duplicate events.</span> If you re-export, you may want to delete the
            old &quot;Athan Reminders&quot; calendar (or its events) first so you don&apos;t end up with duplicates.
          </li>
          <li>
            <span className="font-semibold">Time zones matter.</span> Reminders follow your device time zone. After a
            big time zone change, check the events and re-export if anything looks off.
          </li>
          <li>
            <span className="font-semibold">Calendar alerts, not the PWA, make the sound.</span> Once imported, your
            device&apos;s calendar is responsible for the notification sound and banner, so make sure calendar
            notifications are enabled in system settings.
          </li>
          <li>
            <span className="font-semibold"> If you want multiple reminders</span> you can do the same steps as above while changing the reminder time.
          </li>
        </ul>
      </section>
      

      {/* TROUBLESHOOTING & CONTACT */}
      <section id="troubleshooting" className="space-y-2">
        <h2 className="text-xl font-semibold">Troubleshooting & contact</h2>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">General tips</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>If something looks blank or broken, reload the page.</li>
          <li>Try using a different browser (Chrome, Safari, Edge, Firefox) to see if the issue is browser‑specific.</li>
          <li>On desktop, you can open Developer Tools (usually F12) and check the <span className="font-semibold">Console</span> for any clear error messages.</li>
          <li>If you installed the PWA to your Home Screen, remove it and install it again only as a last resort.</li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Contact us</h3>
        <p className="text-gray-200 text-sm">
          If issues keep happening or something is confusing, we are happy to help. Please email us with details
          (device, browser, screenshots if possible):
        </p>
        <p className="text-teal-300 text-sm font-mono">
          aaamaq.contact.us@gmail.com
        </p>
        <p className="text-gray-300 text-xs">
          JazakAllahu khairan for using this app and for any feedback you send. Your suggestions directly help improve
          the experience for everyone.
          Just remember that we know neither your birthday nor your shoe size and we'd like to keep it that way.
          We value your privacy and will never ask for personal information that is not necessary for the app to function. 
          We are here to help with any technical issues or questions about using the app, so please don&apos;t hesitate to reach out if you need assistance.
        </p>
      </section>
    </div>
  )
}

type QiblaStoredStatus = {
  compassSupported?: boolean
  compassPermissionNeeded?: boolean
  compassStatus?: string
  locationStatus?: string
  bearing?: number
  heading?: number | null
  aligned?: boolean
}

function QiblaStatusPanel() {
  const [status, setStatus] = useState<QiblaStoredStatus | null>(null)
  const [locationPermission, setLocationPermission] = useState('unknown')
  const [orientationSupported, setOrientationSupported] = useState(false)

  useEffect(() => {
    setOrientationSupported(typeof window !== 'undefined' && 'DeviceOrientationEvent' in window)
    try {
      const raw = localStorage.getItem('athan.qibla.status.v1')
      if (raw) setStatus(JSON.parse(raw) as QiblaStoredStatus)
    } catch {
      setStatus(null)
    }

    async function readPermission() {
      try {
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
          setLocationPermission(result.state)
        }
      } catch {
        setLocationPermission('unknown')
      }
    }

    readPermission()
  }, [])

  return (
    <div className="rounded-lg border border-teal-800 bg-gray-900 p-4 space-y-3 text-sm">
      <h3 className="font-semibold text-teal-300">Qibla compass status</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        <StatusLine label="Device orientation" value={orientationSupported ? 'Supported' : 'Not detected'} />
        <StatusLine label="Compass permission needed" value={status?.compassPermissionNeeded ? 'Yes on this browser' : 'Usually no / unknown'} />
        <StatusLine label="Compass status" value={status?.compassStatus ?? 'Open Qibla to check'} />
        <StatusLine label="Location permission" value={status?.locationStatus ?? locationPermission} />
        <StatusLine label="Bearing to Ka‘bah" value={typeof status?.bearing === 'number' ? `${status.bearing.toFixed(1)}°` : 'Open Qibla to calculate'} />
        <StatusLine label="Current heading" value={typeof status?.heading === 'number' ? `${status.heading.toFixed(0)}°` : 'Waiting for compass'} />
      </div>
      <div className="space-y-1 text-gray-300">
        <p>Move your phone in a figure-eight motion to improve compass calibration.</p>
        <p>Keep your phone away from magnets, metal objects, speakers, and electronic devices that may affect compass accuracy.</p>
        <p>If Qibla appears incorrect, check that location and motion/orientation permissions are enabled.</p>
      </div>
    </div>
  )
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-gray-800 p-2">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-semibold text-gray-100">{value}</div>
    </div>
  )
}
