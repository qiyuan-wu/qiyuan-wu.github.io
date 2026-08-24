import { BannerGallery } from '../BannerGallery.jsx'
import { useDocumentTitle } from '../useDocumentTitle.js'

export default function Games() {
  useDocumentTitle('Games · Qiyuan Wu')

  return (
    <section className="page-section games-page">
      <div className="games-heading">
        <p className="page-eyebrow">Played & remembered</p>
        <h1>Games</h1>
        <p>Worlds I keep finding my way back to.</p>
      </div>
      <BannerGallery />
    </section>
  )
}
