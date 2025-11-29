// src/features/Credits.tsx
import { useState } from 'react'
type Props = {
  /** Optional navigation helper from App (screen name: 'NeedHelp' | 'Vision' | 'Privacy') */
  go?: (screen: string) => void
}

export default function Credits({ go }: Props) {
  const [shared, setShared] = useState<string | null>(null)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://example.com'
  const buyMeACoffee = 'https://www.buymeacoffee.com/your-temp-link'

  async function onShare() {
    const shareData = {
      title: 'Athan PWA',
      text: 'Check out Athan PWA — prayer times, Qibla, and Quran in a clean, fast app.',
      url: appUrl,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setShared('Shared!')
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
        setShared('Link copied to clipboard')
      } else {
        setShared('Copy this link: ' + shareData.url)
      }
      setTimeout(() => setShared(null), 2000)
    } catch {
      // user canceled share; ignore
    }
  }

  const goOrHash = (screen: string) => {
    if (go) return go(screen)
    // Fallback: update hash so App can optionally listen in future
    window.location.hash = `#${screen}`
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Credits</h1>
        <p className="text-gray-300">Athan PWA is a lightweight, fast Islamic app designed for daily use — showing accurate prayer times, Qibla direction, full Quran in Uthmani script, and a Salah tracker. Works offline, privacy-friendly, and takes almost no storage.</p>
      </header>

      <section className="bg-gray-800 rounded-lg p-4 space-y-2">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-200">
          <p><span className="font-semibold">App:</span> Al Noor Athan PWA App</p>
          <p><span className="font-semibold">Version:</span> v1.01.1</p>
          <p><span className="font-semibold">Company:</span> BiG MAQ Studio</p>
          <p><span className="font-semibold">Copyright:</span> The content of this software is copyrighted © {new Date().getFullYear()} by BiG MAQ Studio. All rights reserved. The software code and accompanying documentation are protected by copyright law, prohibiting unauthorized reproduction or distribution without the explicit permission of the copyright owner.</p>
        </div>
      </section>

      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h2 className="text-xl font-semibold">Support the Project</h2>
        <p className="text-gray-300">If this app helps you, consider buying me a coffee.</p>
        <a
          className="inline-block px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white"
          href={buyMeACoffee}
          target="_blank"
          rel="noreferrer"
        >
          Buy Me a Coffee
        </a>
      </section>

      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h2 className="text-xl font-semibold">More</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
            onClick={() => goOrHash('NeedHelp')}
          >
            Need Help
          </button>
          <button
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
            onClick={() => goOrHash('Vision')}
          >
            Our Vision
          </button>
          <button
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
            onClick={() => goOrHash('Privacy')}
          >
            Privacy
          </button>
          <button
            className="px-3 py-2 rounded bg-teal-700 hover:bg-teal-600 text-white"
            onClick={onShare}
          >
            Share App
          </button>
        </div>
        {shared && <p className="text-sm text-teal-300">{shared}</p>}
      </section>
      <section className="text-center text-sm text-gray-500 mt-6">
        <p>© {new Date().getFullYear()} BiG MAQ Studio. All rights reserved.</p>
        <p>To install the app read the Need Help Page</p>
        </section> 
    </div>

  )
}


/*
--Credits Information GOOD--
Company: BiG MAQ Studio
Version: 1.0.01
Published on: Thursday, 25 August 2025
The content of this software is copyrighted © 2023 by BiG MAQ Studio. All rights reserved.
The software code and accompanying documentation are protected by copyright law,
prohibiting unauthorized reproduction or distribution without the explicit permission of the copyright owner.

Support the Creators
Our Vision
Privacy Policy

--Our Vision GOOD--
This app is not made for making money; it's made to help people pray their prayers on time. Many people waste time on their mobile phones, and when they aren't notified of the next prayer, they may miss the previous one. 
This is a very sad mistake, and therefore, this app is designed to slowly correct that.
We believe this app will prevent last-minute errors, allowing users to pray on time. 
This app is also ad-free because we do not want any unwanted content to disturb you. Our vision is to help all our Muslim brothers and sisters avoid wasting time on mobile phones. 
With this app, we hope that, at the very least, you'll be reminded to pray your prayers on time.
 
--Privacy Policy GOOD--

Introduction
We are committed to protecting your privacy. Our app is designed with a clear vision to help our fellow Muslims pray on time, and we take your privacy very seriously.

Information Collection and Use
We do not collect, store, or share any personal information from our users. The data collected regarding your location is used solely for providing accurate prayer times and Qibla direction. This data remains on your device and is not transmitted to any servers or third parties.

Location Data
The location data we access is used exclusively to determine accurate prayer times based on your current location and to show the correct Qibla direction. This information is not stored, shared, or used for any other purpose.

No Ads
This app is completely ad-free. We believe in providing a focused experience without distractions.

Our Commitment
This app is built to help our community by assisting you in your daily prayers without unnecessary distractions or privacy concerns.

Changes to This Policy
We may update this Privacy Policy from time to time.

Contact Us
aaa.maq.contact.us@gmail.com

Last Updated: 11th, August 2024

--Need Help--

If you’re having trouble with your Qibla direction and need help, here’s a detailed guide to troubleshoot:

---

## **Reasons Why Qibla Might Not Work Accurately:**

1. **Magnetic Interference:** Phone cases, metal objects, or nearby electronics can disrupt your phone’s magnetic compass.
   **Fix:** Remove the phone case and keep it away from metallic objects.

2. **Compass Calibration:** Your phone’s compass might need recalibration.
   **Fix:** Move your phone in a figure-eight motion to recalibrate, or use the device settings to calibrate manually.

3. **Weak GPS Signal:** Inside buildings, tunnels, or areas with poor GPS reception, the app may struggle to locate you.
   **Fix:** Move to an open area with a clear view of the sky and ensure location services are enabled.

4. **Poor Internet Connection:** Slow or unstable internet may prevent accurate updates.
   **Fix:** Ensure you have a stable connection.

---

## **What You Should Do to Ensure Accuracy:**

• Check multiple sources (use more than one Qibla app).
• Use natural landmarks like the sun or shadows.
• Use a reliable physical compass.
• Ask your local mosque or community to confirm Qibla.

---

## **Quick Fixes:**

1. Remove your phone case or attachments.
2. Close and reopen the app to reset data.
3. Restart your phone to fix system issues.
4. Ensure you have a good internet connection.
5. **Reinstall the app only as a last option.**

---

## **Additional Steps:**

• **Recalibrate:** Tap the recalibrate button in the app.
• **Portrait Mode on iPad:** Use portrait orientation for accuracy.
• **Contact Support:** Email: **[aaamaq.contact.us@gmail.com](mailto:aaamaq.contact.us@gmail.com)**

---

# **How to Use the Quran**

## 📖 **Reading the Quran**

• You will see two versions:
✅ Quran in Arabic
✅ Quran in English
• Tap any book to start reading.

## 🔍 **Navigating Pages**

• Scroll to move between pages.
• Enter a page number and tap **Go** to jump.
• Tap **Chapters** to navigate by Surah *(Arabic only—English coming soon)*.
• Zoom in/out to adjust text size.

## 📌 **Bookmarking Pages**

• Tap **Bookmark Page** to save the current page.
• Up to **10 bookmarks per book**.
• If you add more, the oldest bookmark is removed automatically.

## 📑 **Viewing Bookmarks**

• Tap **View Bookmarks** to see your saved pages.
• Tap a bookmark to instantly jump.

## 🗑️ **Deleting Bookmarks**

• Swipe left on a bookmark to delete it.

## 📂 **Saving Progress**

• Bookmarks save automatically.
• When you reopen the app, you can continue where you left off.

## 🙏 **Enjoy Your Reading!**

---

## **Additional Notes:**

• Quran feature is in **Beta** — improvements coming soon.
• Athan times currently use **Muslim World League (MWL)** method.
• If Isha notifications are off:
Recommended Isha time is **after Isha Athan until before Fajr Athan**.
Example:
– Fajr: 5:00 AM
– Isha: 8:00 PM
→ Good notification window: **9 PM – 11:59 PM**

• Iqama times are **not implemented yet** but will be added soon.
• Widgets are currently being developed.
• If you encounter any issues or have suggestions, please contact us — we value your feedback!

---


*/