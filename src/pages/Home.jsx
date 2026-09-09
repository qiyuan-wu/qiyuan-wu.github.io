import { Link } from 'react-router-dom'
import { CV } from '../cv.js'
import { PdfView } from '../PdfView.jsx'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

// The rest of the site, linked from the foot of the page. The nav has them
// too; this is for whoever reads to the end.
const SECTIONS = [
  { to: '/projects', label: 'nav.projects' },
  { to: '/guwen', label: 'nav.guwen' },
  { to: '/albums', label: 'nav.albums' },
  { to: '/games', label: 'nav.games' },
  { to: '/soccer', label: 'nav.soccer' },
  { to: '/tree', label: 'nav.tree' },
]

export default function Home() {
  const { t } = useLanguage()
  useDocumentTitle(t('site.name'))

  return (
    <section className="page-section bio-page">
      <header className="bio">
        <img className="bio-photo" src="/portrait.jpg" alt="" />
        <div className="bio-text">
          <h1>{t('site.name')}</h1>
          <p className="bio-role">{t('bio.role')}</p>
          <p className="bio-blurb">{t('bio.text')}</p>
          <p className="bio-links">
            {CV.contact.map((c) => (
              <a key={c.label} href={c.href}>
                {c.text}
              </a>
            ))}
            <a className="cv-pdf" href={CV.pdf} download>
              {t('cv.pdf')}
            </a>
          </p>
        </div>
      </header>

      {/* The PDF itself, so there is one CV and not two that drift. */}
      <PdfView src={CV.pdf} />

      <nav className="home-more" aria-label={t('home.more')}>
        <h2>{t('home.more')}</h2>
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
      </nav>
    </section>
  )
}
