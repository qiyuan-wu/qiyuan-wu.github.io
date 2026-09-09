import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

export default function NotFound() {
  const { t } = useLanguage()
  useDocumentTitle(`${t('notfound.title')} · ${t('site.name')}`)

  return (
    <section className="page-section">
      <div className="section-head">
        <h1>{t('notfound.title')}</h1>
      </div>
      <p style={{ textAlign: 'center' }}>
        <Link to="/" className="steam-link">
          {t('notfound.back')}
        </Link>
      </p>
    </section>
  )
}
