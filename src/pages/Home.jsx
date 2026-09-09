import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

const SECTIONS = [
  { to: '/albums', label: 'nav.albums' },
  { to: '/games', label: 'nav.games' },
  { to: '/soccer', label: 'nav.soccer' },
  { to: '/tree', label: 'nav.tree' },
]

export default function Home() {
  const { t } = useLanguage()
  useDocumentTitle(t('site.name'))

  return (
    <section className="home">
      <div className="home-heading">
        <h1>{t('site.name')}</h1>
      </div>

      <div className="home-cards">
        {SECTIONS.map((s, index) => (
          <Link key={s.to} to={s.to} className="home-card">
            <span className="home-card-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="home-card-label">{t(s.label)}</span>
            <span className="home-card-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
