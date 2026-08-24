import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../useDocumentTitle.js'

const SECTIONS = [
  { to: '/albums', label: 'Albums', blurb: 'Records on permanent rotation' },
  { to: '/games', label: 'Games', blurb: 'Favorite worlds and adventures' },
  { to: '/soccer', label: 'Soccer', blurb: 'The players I remember most' },
]

export default function Home() {
  useDocumentTitle('Qiyuan Wu')

  return (
    <section className="home">
      <div className="home-heading">
        <p className="page-eyebrow">Personal archive</p>
        <h1>Qiyuan Wu</h1>
      </div>

      <div className="home-cards">
        {SECTIONS.map((s, index) => (
          <Link key={s.to} to={s.to} className="home-card">
            <span className="home-card-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="home-card-label">{s.label}</span>
            <span className="home-card-blurb">{s.blurb}</span>
            <span className="home-card-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
