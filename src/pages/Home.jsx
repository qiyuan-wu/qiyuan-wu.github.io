import { Link } from 'react-router-dom'
import { CV } from '../cv.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

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

      <footer className="home-more">
        <Link to="/interests" className="home-more-link">
          {t('home.interests')} →
        </Link>
      </footer>
    </section>
  )
}
