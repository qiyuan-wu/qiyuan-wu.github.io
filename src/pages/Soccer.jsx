import Pitch from '../Pitch.jsx'
import { FORMATION, SUBSTITUTES } from '../dreamXI.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'
import '../dreamXI.css'

export default function Soccer() {
  const { t } = useLanguage()
  useDocumentTitle(`${t('soccer.title')} · ${t('site.name')}`)

  return (
    <section className="page-section dream-page">
      <div className="dream-heading">
        <p className="page-eyebrow">{t('soccer.formation')} · {FORMATION}</p>
        <h1>{t('soccer.title')}</h1>
      </div>

      <Pitch />

      <section className="bench" aria-labelledby="bench-title">
        <div className="bench-head">
          <div>
            <p className="page-eyebrow">{t('soccer.squad')}</p>
            <h2 id="bench-title">{t('soccer.subs')}</h2>
          </div>
          <span>{t('soccer.places', { n: SUBSTITUTES.length })}</span>
        </div>

        <ol className="bench-list">
          {SUBSTITUTES.map((player, index) => (
            <li key={player.id} className={player.name ? 'has-player' : ''}>
              <span className="bench-meta">
                <span className="bench-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="bench-role">{player.pos}</span>
              </span>
              <span className={`bench-slot${player.image ? '' : ' is-empty'}`}>
                {player.image ? (
                  <img src={player.image} alt="" />
                ) : (
                  <span aria-hidden="true">+</span>
                )}
              </span>
              <span className="bench-name">{player.name || t('soccer.open')}</span>
            </li>
          ))}
        </ol>
      </section>
    </section>
  )
}
