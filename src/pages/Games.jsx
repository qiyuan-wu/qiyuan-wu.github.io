import { BannerGallery } from '../BannerGallery.jsx'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

export default function Games() {
  const { t } = useLanguage()
  useDocumentTitle(`${t('games.title')} · ${t('site.name')}`)

  return (
    <section className="page-section games-page">
      <div className="games-heading">
        <p className="page-eyebrow">{t('games.eyebrow')}</p>
        <h1>{t('games.title')}</h1>
      </div>
      <BannerGallery />
    </section>
  )
}
