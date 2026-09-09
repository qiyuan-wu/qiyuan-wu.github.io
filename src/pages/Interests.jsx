import { Link } from 'react-router-dom'
import { INTERESTS } from '../interests.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

export default function Interests() {
  const { t } = useLanguage()
  useDocumentTitle(`${t('nav.interests')} · ${t('site.name')}`)

  return (
    <section className="page-section interests-page">
      <div className="section-head">
        <h1>{t('nav.interests')}</h1>
        <p className="section-sub">{t('interests.sub')}</p>
      </div>
      <div className="home-cards">
        {INTERESTS.map((s, index) => (
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
