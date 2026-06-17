type Props = {
  go?: (screen: string) => void
}

const items = [
  {
    title: 'Masjid Mode',
    description: 'Save local mosque Iqama and Jumu’ah schedules.',
    screen: 'MasjidMode'
  },
  {
    title: 'Salah Tracker / Insights',
    description: 'Review streaks, completion rates, and missed-prayer patterns.',
    screen: 'SalahTracker'
  },
  {
    title: 'Ramadan Mode',
    description: 'Track Ramadan dates, fasting status, Suhoor, Iftar, and Eid.',
    screen: 'RamadanMode'
  }
]

export default function More({ go }: Props) {
  function open(screen: string) {
    if (go) go(screen)
    else window.location.hash = `#${screen}`
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">More</h1>
        <p className="text-sm text-gray-300">Extra local-first tools for daily Islamic routines.</p>
      </header>

      <section className="space-y-3">
        {items.map((item) => (
          <button
            key={item.screen}
            type="button"
            onClick={() => open(item.screen)}
            className="w-full rounded-lg bg-gray-800 hover:bg-gray-700 p-4 text-left"
          >
            <div className="font-semibold text-teal-300">{item.title}</div>
            <div className="text-sm text-gray-400">{item.description}</div>
          </button>
        ))}
      </section>
    </div>
  )
}
