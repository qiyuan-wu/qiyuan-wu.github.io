import { CV } from '../cv.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

// The CV is English: it is read by people who read CVs. Only the chrome
// around it follows the site language.
function Section({ title, children }) {
  return (
    <section className="cv-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Entry({ title, where, when, note, points }) {
  return (
    <article className="cv-entry">
      <header>
        <div>
          <h3>{title}</h3>
          {where && <p className="cv-where">{where}</p>}
        </div>
        {(when || note) && <span className="cv-when">{when ?? note}</span>}
      </header>
      {points && (
        <ul>
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
    </article>
  )
}

export default function Cv() {
  const { t } = useLanguage()
  useDocumentTitle(`${t('cv.title')} · ${t('site.name')}`)

  return (
    <section className="page-section cv-page" lang="en">
      <header className="cv-head">
        <div>
          <h1>{CV.name}</h1>
          <p className="cv-contact">
            {CV.contact.map((c, index) => (
              <span key={c.label}>
                {index > 0 && ' · '}
                <a href={c.href}>{c.text}</a>
              </span>
            ))}
          </p>
        </div>
        <a className="cv-pdf" href={CV.pdf} download>
          {t('cv.pdf')}
        </a>
      </header>

      <Section title="Education">
        {CV.education.map((e) => (
          <Entry key={e.degree} title={e.degree} where={`${e.school} · ${e.note}`} when={e.years} />
        ))}
      </Section>

      <Section title="Research Experience">
        {CV.research.map((r) => (
          <Entry key={r.title} {...r} />
        ))}
      </Section>

      <Section title="Presentations">
        <ul className="cv-list">
          {CV.presentations.map((p) => (
            <li key={p.text}>
              {p.text} <span className="cv-note">({p.note})</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Graduate Coursework Projects">
        {CV.coursework.map((c) => (
          <Entry key={c.title} {...c} />
        ))}
      </Section>

      <Section title="Awards and Honors">
        {CV.awards.map((a) => (
          <Entry key={a.title} {...a} />
        ))}
      </Section>

      <Section title="Activities">
        {CV.activities.map((a) => (
          <Entry key={a.title} {...a} />
        ))}
      </Section>
    </section>
  )
}
