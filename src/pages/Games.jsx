import { BannerGallery } from '../BannerGallery.jsx'
import { useDocumentTitle } from '../useDocumentTitle.js'

export default function Games() {
  useDocumentTitle('Games · Qiyuan Wu')

  return (
    <section className="page-section games-page">
      <div className="games-heading">
        <p className="page-eyebrow">Played & remembered</p>
        <h1>Games</h1>
      </div>
      <BannerGallery />
    </section>
  )
}
