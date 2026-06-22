import { NavLink } from 'react-router-dom'
import { useGameStore } from '@/shared/store/useGameStore'
import { navItems } from '@modules/layout/types/navBar'

export default function NavBar() {
  const status = useGameStore((s) => s.status)

  if (status !== 'playing' && status !== 'finished') return null

  return (
    <>
      {/* ── Mobile: Bottom Navigation ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
        }}
        aria-label="Navegação principal"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.ariaLabel}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors
               ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text)]'}
               hover:text-[var(--text-h)]`
            }
          >
            <i className="material-icons-outlined text-xl leading-none" aria-hidden="true">{item.icon}</i>
            <span className="text-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Tablet: Navigation Rail ── */}
      <nav
        className="hidden md:flex xl:hidden fixed left-0 top-0 bottom-0 z-50 flex-col items-center py-6 gap-2 w-20"
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
        aria-label="Navegação principal"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.ariaLabel}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl
               text-xs font-medium transition-all
               ${isActive
                 ? 'text-[var(--accent)] bg-[var(--accent-bg)]'
                 : 'text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--border)]'
               }`
            }
          >
            <i className="material-icons text-2xl leading-none" aria-hidden="true">{item.icon}</i>
            <span className="text-label text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Desktop: Navigation Drawer ── */}
      <nav
        className="hidden xl:flex fixed left-0 top-0 bottom-0 z-50 flex-col py-8 px-4 gap-1 w-56"
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
        aria-label="Navegação principal"
      >
        <div className="px-3 mb-6">
          <span
            className="text-title font-bold tracking-tight"
            style={{ color: 'var(--accent)' }}
          >
             DrunkRats
          </span>
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.ariaLabel}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all
               ${isActive
                 ? 'text-[var(--accent)] bg-[var(--accent-bg)]'
                 : 'text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--border)]'
               }`
            }
          >
            <i className="material-icons text-xl" aria-hidden="true">{item.icon}</i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
