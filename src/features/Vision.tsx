type Props = {
  go?: (screen: string) => void
  backTarget?: string
}

const WEBSITE_URL = 'https://aaamaqcontactus.wixsite.com/website'
const GITHUB_URL = 'https://github.com/AAAMAQ/big-maq-studio-athan-pwa'

export default function Vision({ go, backTarget = 'Credits' }: Props) {
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
        <p className="text-xs font-semibold uppercase text-teal-400">BiG MAQ Studio</p>
        <h1 className="text-2xl font-bold">Our Vision</h1>
        <p className="leading-7 text-gray-300">
          A reliable, respectful Athan experience that works fully offline, on every device. Your time and focus
          matter: privacy-first, minimal, and accurate by design.
        </p>
      </header>

      <section className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <VisionPoint title="Offline-first">
          Prayer times, Qibla, and Quran without needing the internet.
        </VisionPoint>
        <VisionPoint title="Accurate calculations">
          Powered by the adhan library with configurable methods and madhab.
        </VisionPoint>
        <VisionPoint title="Respectful reminders">
          Subtle notifications and optional calendar export.
        </VisionPoint>
        <VisionPoint title="Accessible reading">
          Arabic-only or Arabic with English, bookmarks, and comfortable typography.
        </VisionPoint>
        <p className="text-sm leading-7 text-gray-300">
          This PWA is a continuation of the original Swift app, refined for modern browsers while keeping the same
          principles: simplicity, reliability, and no unnecessary data collection.
        </p>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold text-white">Why This Web App?</h2>
        <p className="text-sm leading-7 text-gray-300">
          In a world full of apps that demand your attention and data, we believe in a different approach. Our vision
          is to create a prayer time app that prioritizes your privacy, minimizes distractions, and offers a seamless
          experience without the need for constant updates or intrusive permissions.
        </p>
        <p className="text-sm leading-7 text-gray-300">
          This app is not made for making money; it is made to help people pray their prayers on time. Many people,
          including me, waste time on their mobile phones, and when they are not notified of the next prayer, they may
          miss the previous one. This is a very sad and frustrating mistake, and therefore this app is designed to
          slowly correct that. We believe this app will prevent last-minute errors, allowing users to pray on time.
        </p>
        <p className="text-sm leading-7 text-gray-300">
          This app is also ad-free because we do not want any unwanted content to disturb you. Our vision is to help
          all our Muslim brothers and sisters avoid wasting time on mobile phones. With this app, we hope that, at the
          very least, you will be reminded to pray your prayers on time.
        </p>
        <p className="text-sm leading-7 text-gray-300">
          By being able to download .ics files for prayer times, users can integrate their prayer schedule directly
          into their personal calendars, ensuring they receive timely reminders without relying on app notifications.
          This feature enhances convenience and helps users stay committed to their prayer routines.
        </p>
        <p className="text-sm leading-7 text-gray-300">
          Mobile apps can be heavy, require downloads, feel intrusive, and drain your battery. By choosing a
          progressive web app, we ensure a lightweight experience that respects your device&apos;s resources and your
          privacy. There are no unnecessary background processes: open your browser and access your prayer times
          whenever you need them.
        </p>
        <p className="text-sm leading-7 text-gray-300">
          Our vision is to provide a seamless, respectful, and efficient Athan experience that aligns with your values
          and lifestyle. Join us in embracing a better way to stay connected with your faith: lightweight, private,
          and always accessible.
        </p>
        <p className="text-sm leading-7 text-gray-300">
          Thank you for being part of this vision. Together, we can create a prayer time app that truly serves your
          needs while honoring your privacy and time.
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-teal-900 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold">Contact and project links</h2>
        <p className="text-sm leading-6 text-gray-300">
          For questions or bug reports, visit our website. You can also view the Athan PWA project on GitHub.
        </p>
        <div className="flex flex-wrap gap-2">
          <a href={WEBSITE_URL} target="_blank" rel="noreferrer" className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500">
            Developer Website
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-100 hover:bg-gray-600">
            Athan PWA on GitHub
          </a>
        </div>
      </section>
    </div>
  )
}

function VisionPoint({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <h2 className="font-semibold text-teal-300">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-gray-300">{children}</p>
    </div>
  )
}
