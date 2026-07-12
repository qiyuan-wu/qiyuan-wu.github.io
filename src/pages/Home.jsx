import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../useDocumentTitle.js'

const SECTIONS = [
  { to: '/games', label: 'Games' },
  { to: '/animals', label: 'Animals' },
  { to: '/soccer', label: 'Soccer' },
]

export default function Home() {
  useDocumentTitle('Qiyuan Wu')

  return (
    <section className="home">
      <h1>Qiyuan Wu</h1>

      <div className="home-cards">
        {SECTIONS.map((s) => (
          <Link key={s.to} to={s.to} className="home-card">
            <span className="home-card-label">{s.label}</span>
            <span className="home-card-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
