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
        <p className="leading-6 text-gray-300">
          A reliable, respectful Athan experience that helps people protect their prayer time without demanding
          their attention or personal data.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {[
          ['Offline-first', 'Keep essential prayer, Qibla, Quran, and tracking tools useful with limited connectivity.'],
          ['Privacy by design', 'No account, advertising profile, analytics trail, or unnecessary server storage.'],
          ['Useful reminders', 'Offer clear prayer and calendar tools while leaving the user in control.'],
          ['Accessible worship tools', 'Keep reading and daily utilities comfortable, focused, and lightweight.'],
        ].map(([title, description]) => (
          <article key={title} className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <h2 className="font-semibold text-teal-300">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-300">{description}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold">Why a progressive web app?</h2>
        <p className="text-sm leading-6 text-gray-300">
          Athan PWA continues the spirit of the original Swift app in a form that works across modern browsers.
          It stays small, avoids ads and background tracking, and can be installed directly from a supported browser.
        </p>
        <p className="text-sm leading-6 text-gray-300">
          Prayer calculations and calendar exports help users stay informed without handing their daily routine to
          a remote service. Where local masjid guidance differs, the app keeps calculation choices visible and configurable.
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-teal-900 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold">Follow the project</h2>
        <p className="text-sm text-gray-300">
          Visit the developer website for contact information or follow Athan PWA development on GitHub.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
          >
            Developer Website
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-100 hover:bg-gray-600"
          >
            Athan PWA on GitHub
          </a>
        </div>
      </section>

      <p className="text-sm leading-6 text-gray-400">
        Thank you for being part of the project. Feedback and bug reports help make Athan PWA more dependable for everyone.
      </p>
    </div>
  )
}
