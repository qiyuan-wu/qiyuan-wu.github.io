import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PERIODS } from '../guwen.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

// A `(… 一作：…)` or `(具 通：俱)` aside is an editor's note, not the text.
// It stays where it was but steps back so the line reads through it.
const NOTE = /([(（][^()（）]*(?:一作|通)[:：][^()（）]*[)）])/g
const IS_NOTE = /^[(（][^()（）]*(?:一作|通)[:：]/

function Line({ text }) {
  return text.split(NOTE).map((part, index) =>
    IS_NOTE.test(part) ? (
      <small key={index} className="guwen-note">
        {part}
      </small>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}

// Verse comes one short line at a time and wants each line on its own; prose
// comes in paragraphs and wants an indent. Average line length tells them apart.
function isVerse(body) {
  const average = body.reduce((sum, line) => sum + line.length, 0) / body.length
  return average < 40
}

export default function Guwen() {
  const { t } = useLanguage()
  useDocumentTitle(`古文 · ${t('site.name')}`)
  const [params, setParams] = useSearchParams()

  const withPieces = PERIODS.filter((p) => p.pieces.length)
  const requested = PERIODS.find((p) => p.id === params.get('p'))
  const current = requested?.pieces.length ? requested : withPieces[0]
  const activeRef = useRef(null)

  // On a phone the line is wider than the screen; bring the chosen period into
  // view so a deep link to 宋 does not open on 先秦.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [current?.id])

  return (
    <section className="page-section guwen-page" lang="zh-CN">
      <div className="section-head">
        <h1>古文</h1>
      </div>

      <nav className="timeline" aria-label="朝代">
        <ol>
          {PERIODS.map((period) => {
            const empty = !period.pieces.length
            const active = period.id === current?.id
            return (
              <li
                key={period.id}
                className={`timeline-node${empty ? ' is-empty' : ''}${active ? ' is-active' : ''}`}
              >
                <button
                  ref={active ? activeRef : undefined}
                  type="button"
                  disabled={empty}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => setParams({ p: period.id })}
                >
                  <span className="timeline-dot" aria-hidden="true" />
                  <span className="timeline-name">{period.name}</span>
                  <span className="timeline-span">{period.span}</span>
                  {!empty && <span className="timeline-count">{period.pieces.length}</span>}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {current && (
        <div className="guwen-pieces" key={current.id}>
          {current.pieces.map((piece) => {
            const verse = isVerse(piece.body)
            return (
              <article key={piece.title} className={`guwen-piece${verse ? ' is-verse' : ' is-prose'}`}>
                <h2>{piece.title}</h2>
                {piece.author && <p className="guwen-author">{piece.author}</p>}
                <div className="guwen-body">
                  {piece.body.map((line, index) => (
                    <p key={index}>
                      <Line text={line} />
                    </p>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
