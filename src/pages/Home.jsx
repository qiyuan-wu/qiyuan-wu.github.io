import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

const SECTIONS = [
  { to: '/albums', label: 'nav.albums', blurb: 'home.albums' },
  { to: '/games', label: 'nav.games', blurb: 'home.games' },
  { to: '/soccer', label: 'nav.soccer', blurb: 'home.soccer' },
  { to: '/tree', label: 'nav.tree', blurb: 'home.tree' },
]

export default function Home() {
  useDocumentTitle('Qiyuan Wu')
  const { t } = useLanguage()

  return (
    <section className="home">
      <div className="home-heading">
        <p className="page-eyebrow">{t('home.eyebrow')}</p>
        <h1>Qiyuan Wu</h1>
      </div>

      <div className="home-cards">
        {SECTIONS.map((s, index) => (
          <Link key={s.to} to={s.to} className="home-card">
            <span className="home-card-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="home-card-label">{t(s.label)}</span>
            <span className="home-card-blurb">{t(s.blurb)}</span>
            <span className="home-card-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
