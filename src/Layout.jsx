import { NavLink, Outlet } from 'react-router-dom'

// Section links live here so adding a page later is one entry. `end` on the
// home link keeps it from staying active on every route.
const SECTIONS = [
  { to: '/games', label: 'Games' },
  { to: '/animals', label: 'Animals' },
  { to: '/soccer', label: 'Most Memorable XI' },
]

export default function Layout() {
  return (
    <div className="site">
      <header className="site-nav">
        <NavLink to="/" className="brand" end>
          QW
        </NavLink>
        <nav className="site-links">
          {SECTIONS.map((s) => (
            <NavLink key={s.to} to={s.to}>
              {s.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>
    </div>
  )
}
