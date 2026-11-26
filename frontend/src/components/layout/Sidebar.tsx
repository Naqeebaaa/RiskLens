import { NavLink } from 'react-router-dom'

type NavItem = {
  to: string
  label: string
  icon: 'dashboard' | 'alerts'
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/alerts', label: 'Alerts', icon: 'alerts' },
]

function NavigationIcon({ name }: { name: NavItem['icon'] }) {
  if (name === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="4" rx="1.5" />
        <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 20 7v5.1c0 4.1-2.8 7.3-8 9.4-5.2-2.1-8-5.3-8-9.4V7l8-3.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function Sidebar() {
  return (
    <aside className="z-10 flex w-full flex-col bg-[#101c32] text-slate-300 md:sticky md:top-0 md:h-screen md:w-[260px] md:shrink-0">
      <div className="flex items-center gap-3 px-5 py-5 md:px-6 md:py-7">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1d3152] text-teal-300 ring-1 ring-white/10">
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 3.2 19.5 6.5v5c0 4.2-2.6 7.5-7.5 9.4-4.9-1.9-7.5-5.2-7.5-9.4v-5L12 3.2Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="m8.8 12.2 2.1 2.1 4.4-4.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[17px] font-semibold tracking-[0.01em] text-white">
            RiskLens
          </p>
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Analyst workspace
          </p>
        </div>
      </div>

      <div className="hidden px-6 pb-3 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase md:block">
        Monitoring
      </div>
      <nav
        aria-label="Main navigation"
        className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:px-3 md:pb-0"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'group flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#203451] text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'size-[18px] [&_svg]:size-full [&_svg]:stroke-current [&_svg]:stroke-[1.6]',
                    isActive ? 'text-teal-300' : 'text-slate-500 group-hover:text-slate-300',
                  ].join(' ')}
                >
                  <NavigationIcon name={item.icon} />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden px-5 pb-6 md:block">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-teal-400" />
            <span className="text-xs font-medium text-slate-200">
              Explainable monitoring
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Rule-based signals support analyst review. They are not proof of
            wrongdoing.
          </p>
        </div>
      </div>
    </aside>
  )
}
