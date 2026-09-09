import { NavLink, Outlet } from 'react-router-dom'
import { useLanguage } from './i18n.jsx'

// Section links live here so adding a page later is one entry. `end` on the
// home link keeps it from staying active on every route.
const SECTIONS = [
  { to: '/projects', label: 'nav.projects' },
  { to: '/guwen', label: 'nav.guwen' },
  { to: '/albums', label: 'nav.albums' },
  { to: '/games', label: 'nav.games' },
  { to: '/soccer', label: 'nav.soccer' },
  { to: '/tree', label: 'nav.tree' },
]

export default function Layout() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div className="site">
      <header className="site-nav">
        <NavLink to="/" className="brand" end lang="zh-CN">
          吴
        </NavLink>
        <nav className="site-links">
          {SECTIONS.map((s) => (
            <NavLink key={s.to} to={s.to}>
              {t(s.label)}
            </NavLink>
          ))}
          <button
            type="button"
            className="lang-toggle"
            aria-label={t('nav.switchLabel')}
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          >
            {t('nav.switch')}
          </button>
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>
    </div>
  )
}
