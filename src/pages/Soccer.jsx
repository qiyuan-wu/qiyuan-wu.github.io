import Pitch from '../Pitch.jsx'
import { FORMATION, SUBSTITUTES } from '../dreamXI.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import '../dreamXI.css'

export default function Soccer() {
  useDocumentTitle('Most Memorable XI · Qiyuan Wu')

  return (
    <section className="page-section dream-page">
      <div className="dream-heading">
        <p className="page-eyebrow">Formation · {FORMATION}</p>
        <h1>Most Memorable XI</h1>
      </div>

      <Pitch />

      <section className="bench" aria-labelledby="bench-title">
        <div className="bench-head">
          <div>
            <p className="page-eyebrow">Matchday squad</p>
            <h2 id="bench-title">Substitutes</h2>
          </div>
          <span>7 places</span>
        </div>

        <ol className="bench-list">
          {SUBSTITUTES.map((player, index) => (
            <li key={player.id} className={player.name ? 'has-player' : ''}>
              <span className="bench-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="bench-role">{player.pos}</span>
              {player.image ? (
                <img src={player.image} alt="" />
              ) : (
                <span className="bench-avatar" aria-hidden="true">+</span>
              )}
              <span className="bench-name">{player.name || 'Open place'}</span>
            </li>
          ))}
        </ol>
      </section>
    </section>
  )
}
