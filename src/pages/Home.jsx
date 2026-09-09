import { Link } from 'react-router-dom'
import { CV } from '../cv.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'

function Points({ points }) {
  return (
    <ul className="cv-points">
      {points.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  )
}

export default function Home() {
  const { t } = useLanguage()
  useDocumentTitle(t('site.name'))

  return (
    <section className="page-section bio-page">
      <header className="bio">
        <img className="bio-photo" src="/portrait.jpg" alt="" />
        <div className="bio-text">
          <h1>{t('site.name')}</h1>
          <p className="bio-role">{t('bio.role')}</p>
          <p className="bio-blurb">{t('bio.text')}</p>
          <p className="bio-links">
            {CV.contact.map((c) => (
              <a key={c.label} href={c.href}>
                {c.text}
              </a>
            ))}
            <a className="cv-pdf" href={CV.pdf} download>
              {t('cv.pdf')}
            </a>
          </p>
        </div>
      </header>

      {/* Research first: it is what the page is for. The rest of the CV
          follows in the PDF's order, rendered from the same data. */}
      <section className="cv-section" aria-labelledby="cv-research">
        <h2 id="cv-research">{t('cv.research')}</h2>
        {CV.research.map((r) => (
          <article key={r.title} className="cv-entry">
            <header className="cv-entry-head">
              <h3>{r.title}</h3>
              <span className="cv-when">{r.when}</span>
            </header>
            <p className="cv-where">{r.where}</p>
            <Points points={r.points} />
          </article>
        ))}
      </section>

      <section className="cv-section" aria-labelledby="cv-education">
        <h2 id="cv-education">{t('cv.education')}</h2>
        {CV.education.map((e) => (
          <article key={e.degree} className="cv-entry cv-entry-compact">
            <header className="cv-entry-head">
              <h3>{e.school}</h3>
              <span className="cv-when">{e.years}</span>
            </header>
            <p className="cv-where">
              {e.degree}
              {e.note && <span className="cv-note"> · {e.note}</span>}
            </p>
          </article>
        ))}
      </section>

      <section className="cv-section" aria-labelledby="cv-presentations">
        <h2 id="cv-presentations">{t('cv.presentations')}</h2>
        <ul className="cv-list">
          {CV.presentations.map((p) => (
            <li key={p.text}>
              {p.text}
              {p.note && <span className="cv-note"> — {p.note}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="cv-section" aria-labelledby="cv-awards">
        <h2 id="cv-awards">{t('cv.awards')}</h2>
        {CV.awards.map((a) => (
          <article key={a.title} className="cv-entry cv-entry-compact">
            <header className="cv-entry-head">
              <h3>{a.title}</h3>
              <span className="cv-when">{a.when}</span>
            </header>
            <p className="cv-where">{a.where}</p>
          </article>
        ))}
      </section>

      <section className="cv-section" aria-labelledby="cv-activities">
        <h2 id="cv-activities">{t('cv.activities')}</h2>
        {CV.activities.map((a) => (
          <article key={a.title} className="cv-entry">
            <header className="cv-entry-head">
              <h3>{a.title}</h3>
              <span className="cv-when">{a.when}</span>
            </header>
            <Points points={a.points} />
          </article>
        ))}
      </section>

      <footer className="home-more">
        <Link to="/interests" className="home-more-link">
          {t('home.interests')} →
        </Link>
      </footer>
    </section>
  )
}
