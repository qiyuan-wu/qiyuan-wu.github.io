import { BannerGallery } from '../BannerGallery.jsx'
import { useDocumentTitle } from '../useDocumentTitle.js'

export default function Games() {
  useDocumentTitle('Games · Qiyuan Wu')

  return (
    <section className="page-section games-page">
      <div className="section-head">
        <h1>Games</h1>
      </div>
      <BannerGallery />
    </section>
  )
}
