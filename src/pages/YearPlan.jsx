import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useCourses } from '../useCourses.js'
import { ALSO, DEGREE, TRACKS, bucketOf, findCourse, partsOf, unitsOf } from '../courses.js'

// The coming year, term by term. The Courses page is every course of
// interest across the PhD; this is which of them go where in one year.
// Only parts the catalog lists for a term can be put in that term.
const FIRST_YEAR = 2026
const YEARS = [0, 1, 2, 3].map((i) => FIRST_YEAR + i)
const TERMS = [
  { id: 'FA', name: 'Fall' },
  { id: 'WI', name: 'Winter' },
  { id: 'SP', name: 'Spring' },
]
const STATUS_LABEL = { want: 'want', taking: 'taking', done: 'done', skip: 'skip' }

const termId = (year, t) => `${year}-${t}`

export default function YearPlan() {
  useDocumentTitle('Year plan · Qiyuan Wu')
  const { catalog, plan, canEdit, setTerm } = useCourses()
  const [year, setYear] = useState(FIRST_YEAR)
  const [q, setQ] = useState('')
  const [onlyTracks, setOnlyTracks] = useState(true)
  const courses = catalog?.courses ?? []

  // Every part of every course, with the course attached and whether it is
  // on a track, so the picker can offer the shortlist first.
  const parts = useMemo(() => {
    const onTrack = new Map()
    for (const t of TRACKS)
      for (const s of t.stages)
        for (const c of s.courses) {
          const course = findCourse(courses, c.ref)
          if (course && !plan.removed.includes(course.key)) onTrack.set(course.key, t)
        }
    for (const [tid, list] of Object.entries(plan.added))
      for (const c of list) onTrack.set(c.key, TRACKS.find((t) => t.id === tid))
    for (const c of ALSO) {
      const course = findCourse(courses, c.ref)
      if (course) onTrack.set(course.key, null)
    }
    return courses.flatMap((course) =>
      partsOf(course).map((p) => ({
        ...p,
        course,
        track: onTrack.get(course.key),
        listed: onTrack.has(course.key),
        status: plan.status[p.id],
      })),
    )
  }, [courses, plan])

  const byId = useMemo(() => new Map(parts.map((p) => [p.id, p])), [parts])

  const columns = TERMS.map((t) => {
    const id = termId(year, t.id)
    const items = (plan.schedule[id] ?? []).map((pid) => byId.get(pid)).filter(Boolean)
    return { ...t, id, items, units: items.reduce((n, p) => n + unitsOf(p.course), 0) }
  })
  const placed = new Set(Object.values(plan.schedule).flat())

  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const candidates = useMemo(
    () =>
      parts
        .filter((p) => (onlyTracks ? p.listed : true))
        .filter((p) => p.status !== 'skip' && p.status !== 'done')
        .filter((p) => {
          if (!words.length) return true
          const hay = `${p.course.label} ${p.course.title} ${p.course.desc}`.toLowerCase()
          return words.every((w) => hay.includes(w))
        })
        .sort((a, b) => a.course.dept.localeCompare(b.course.dept) || a.course.number - b.course.number || a.part.localeCompare(b.part))
        .slice(0, onlyTracks && !words.length ? 500 : 60),
    [parts, onlyTracks, words.join(' ')],
  )

  const add = (term, pid) => setTerm(term.id, [...(plan.schedule[term.id] ?? []), pid])
  const drop = (term, pid) =>
    setTerm(term.id, (plan.schedule[term.id] ?? []).filter((x) => x !== pid))

  if (!catalog) {
    return (
      <section className="page-section courses-page">
        <p className="courses-hint">Loading the catalog…</p>
      </section>
    )
  }

  return (
    <section className="page-section courses-page yearplan">
      <div className="section-head">
        <p className="page-eyebrow">Caltech · Mechanical Engineering PhD</p>
        <h1>Year plan</h1>
        <p className="section-sub">
          One year, three terms. <Link to="/courses">The courses page</Link> is everything of
          interest across the PhD; this is what goes where in {year}–{String(year + 1).slice(2)}.
        </p>
      </div>

      <div className="yearplan-years">
        {YEARS.map((y, i) => (
          <button
            type="button"
            key={y}
            className={y === year ? 'is-on' : ''}
            onClick={() => setYear(y)}
          >
            Year {i + 1} <small>{y}–{String(y + 1).slice(2)}</small>
          </button>
        ))}
      </div>

      <div className="yearplan-terms">
        {columns.map((term) => (
          <section key={term.id} className="yearplan-term">
            <header>
              <h2>{term.name}</h2>
              <span className="yearplan-units">
                {term.units} <small>units</small>
              </span>
            </header>
            <div className="yearplan-list">
              {term.items.map((p) => (
                <PartCard key={p.id} part={p} term={term} canEdit={canEdit} onRemove={() => drop(term, p.id)} />
              ))}
              {!term.items.length && <p className="courses-hint">Nothing yet.</p>}
            </div>
            <p className="yearplan-bucket">
              {summarize(term.items)}
            </p>
          </section>
        ))}
      </div>

      <section className="yearplan-picker">
        <h2>Add courses</h2>
        <div className="courses-browse-bar">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the catalog or the shortlist…"
          />
          <label>
            <input type="checkbox" checked={onlyTracks} onChange={(e) => setOnlyTracks(e.target.checked)} />
            only courses on my tracks
          </label>
        </div>
        {!canEdit && (
          <p className="courses-hint">
            Read-only unless <Link to="/admin">signed in</Link>.
          </p>
        )}
        <div className="yearplan-candidates">
          {candidates.map((p) => {
            const isPlaced = placed.has(p.id)
            const offeredThisYear = p.course.years[0] === catalog.current && p.course.offered
            return (
              <article
                key={p.id}
                className={`yearplan-cand${isPlaced ? ' is-placed' : ''}${offeredThisYear ? '' : ' is-off'}`}
                style={p.track ? { '--track': p.track.color } : undefined}
              >
                <div className="yearplan-cand-main">
                  <span className="courses-card-num">
                    {p.course.key}
                    {p.part ? ` ${p.part}` : ''}
                  </span>
                  <span className="courses-card-title">{p.course.title}</span>
                  <span className="courses-card-meta">
                    {unitsOf(p.course)} units · {p.term.join(' ') || 'term ?'}
                    {bucketLabel(p.course)}
                    {p.track ? ` · ${p.track.name}` : ''}
                    {!offeredThisYear ? ` · not offered ${catalog.current}` : ''}
                    {p.status ? ` · ${STATUS_LABEL[p.status]}` : ''}
                  </span>
                </div>
                {canEdit && (
                  <div className="yearplan-cand-side">
                    {columns.map((term) => {
                      const fits = p.term.includes(term.id) || !p.term.length
                      const here = (plan.schedule[term.id] ?? []).includes(p.id)
                      return (
                        <button
                          type="button"
                          key={term.id}
                          disabled={here || (!fits && p.term.length > 0)}
                          title={fits ? `Add to ${term.name}` : `Not listed for ${term.name.toLowerCase()}`}
                          onClick={() => add(term, p.id)}
                        >
                          {here ? '✓' : '+'} {term.id}
                        </button>
                      )
                    })}
                  </div>
                )}
              </article>
            )
          })}
          {!candidates.length && <p className="courses-hint">Nothing matches.</p>}
        </div>
      </section>
    </section>
  )
}

function PartCard({ part, canEdit, onRemove }) {
  const [open, setOpen] = useState(false)
  const { course } = part
  return (
    <article className="courses-card" style={part.track ? { '--track': part.track.color } : undefined}>
      <button type="button" className="courses-card-main" onClick={() => setOpen((o) => !o)}>
        <span className="courses-card-num">
          {course.key}
          {part.part ? ` ${part.part}` : ''}
        </span>
        <span className="courses-card-title">{course.title}</span>
        <span className="courses-card-meta">
          {unitsOf(course)} units{bucketLabel(course)}
          {course.instructors ? ` · ${course.instructors}` : ''}
          {part.status ? ` · ${STATUS_LABEL[part.status]}` : ''}
        </span>
      </button>
      {open && (
        <div className="courses-card-detail">
          <p>{course.desc}</p>
          {course.prereq && (
            <p>
              <b>Prerequisites.</b> {course.prereq}
            </p>
          )}
        </div>
      )}
      {canEdit && (
        <div className="courses-card-side">
          <button type="button" className="courses-remove" onClick={onRemove}>
            Remove
          </button>
        </div>
      )}
    </article>
  )
}

function bucketLabel(course) {
  const b = bucketOf(course)
  if (b === 'hss') return ' · outside the 195'
  if (!b) return ''
  return ` · ${DEGREE.buckets.find((x) => x.id === b)?.name.replace('ME core — ', '')}`
}

// "27 depth · 9 math · 9 electives" for a term.
function summarize(items) {
  const sum = {}
  for (const p of items) {
    const b = bucketOf(p.course) ?? 'other'
    sum[b] = (sum[b] ?? 0) + unitsOf(p.course)
  }
  const name = (b) =>
    b === 'hss' ? 'outside' : b === 'other' ? 'other' : DEGREE.buckets.find((x) => x.id === b)?.name.replace('ME core — ', '').toLowerCase()
  return Object.entries(sum)
    .map(([b, u]) => `${u} ${name(b)}`)
    .join(' · ')
}
