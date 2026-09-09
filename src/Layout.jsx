import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { INTERESTS, isInterestPath } from './interests.js'
import { useLanguage } from './i18n.jsx'

// The nav is two entries: the front page (bio, CV, research) and Interests.
// Inside one of the interest pages a second row lists them all, so hopping
// between 古文 and the albums is still one click. The hub itself has the
// boxes and needs no row.
export default function Layout() {
  const { lang, setLang, t } = useLanguage()
  const { pathname } = useLocation()
  const inInterests = isInterestPath(pathname)

  return (
    <div className="site">
      <header className="site-nav">
        <NavLink to="/" className="brand" end lang="zh-CN">
          吴
        </NavLink>
        <nav className="site-links">
          <NavLink to="/" end>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/interests" className={inInterests ? 'active' : undefined}>
            {t('nav.interests')}
          </NavLink>
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

      {inInterests && pathname !== '/interests' && (
        <nav className="sub-links" aria-label={t('nav.interests')}>
          {INTERESTS.map((s) => (
            <NavLink key={s.to} to={s.to}>
              {t(s.label)}
            </NavLink>
          ))}
        </nav>
      )}

      <main className="site-main">
        <Outlet />
      </main>
    </div>
  )
}
