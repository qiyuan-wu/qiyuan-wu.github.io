import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useCourses } from '../useCourses.js'
import { ALSO, DEGREE, TRACKS, bucketOf, findCourse, partsIndependent, partsOf, unitsOf } from '../courses.js'

// The coming year, term by term. The Courses page is every course of
// interest across the PhD; this is which of them go where in the one year
// the catalog actually covers. Only courses offered this year are shown, and
// only in the terms the catalog lists them for.
const YEAR = 2026
const TERMS = [
  { id: 'FA', name: 'Fall' },
  { id: 'WI', name: 'Winter' },
  { id: 'SP', name: 'Spring' },
]
const STATUS_LABEL = { want: 'want', taking: 'taking', done: 'done', skip: 'skip' }

const termId = (year, t) => `${year}-${t}`

// The registrar keys a course by whichever cross-listing it printed under;
// match on number, part and a department in common.
function sectionsFor(schedule, termCode, part) {
  const table = schedule?.terms?.[termCode]
  if (!table) return null
  const want = part.part ? `${part.course.number} ${part.part}` : `${part.course.number}`
  const depts = [part.course.key, ...(part.course.aliases ?? [])].flatMap((k) => k.split(' ')[0].split('/'))
  for (const [id, list] of Object.entries(table)) {
    const m = id.match(/^([A-Za-z/]+) (\d+)( [a-z])?$/)
    if (!m) continue
    const tail = `${m[2]}${m[3] ?? ''}`
    if (tail !== want) continue
    if (m[1].split('/').some((d) => depts.includes(d))) return list
  }
  return []
}


export default function YearPlan() {
  useDocumentTitle('Year plan · Qiyuan Wu')
  const { catalog, schedule, plan, canEdit, setTerm, setOmitted, setEither } = useCourses()
  const [linking, setLinking] = useState(null) // partId whose "or" was clicked first
  const [showOmitted, setShowOmitted] = useState(false)
  const [openId, setOpenId] = useState(null)
  const year = YEAR
  const [q, setQ] = useState('')
  const [onlyTracks, setOnlyTracks] = useState(true)
  const [termFilter, setTermFilter] = useState('')
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
    return courses
      .filter((course) => course.offered && course.years[0] === catalog?.current)
      .flatMap((course) =>
      partsOf(course)
        // "part b not offered 2026-27", says the description.
        .filter((p) => !new RegExp(`part ${p.part} not offered`, 'i').test(course.desc))
        .map((p) => ({
        ...p,
        course,
        track: onTrack.get(course.key),
        listed: onTrack.has(course.key),
        status: plan.status[p.id],
      })),
    )
  }, [courses, plan, catalog?.current])

  const byId = useMemo(() => new Map(parts.map((p) => [p.id, p])), [parts])

  const columns = TERMS.map((t) => {
    const id = termId(year, t.id)
    const items = (plan.schedule[id] ?? [])
      .map((pid) => byId.get(pid))
      .filter(Boolean)
      .map((p) => ({ ...p, sections: sectionsFor(schedule, t.id, p) }))
    // Alternatives sit together and count once, at the larger of their units.
    const groups = (plan.either?.[id] ?? [])
      .map((g) => g.ids.map((pid) => items.find((p) => p.id === pid)).filter(Boolean))
      .filter((g) => g.length > 1)
    const grouped = new Set(groups.flat().map((p) => p.id))
    const blocks = [
      ...groups.map((g) => ({ kind: 'either', key: g.map((p) => p.id).join('|'), items: g })),
      ...items.filter((p) => !grouped.has(p.id)).map((p) => ({ kind: 'one', key: p.id, items: [p] })),
    ]
    const units = blocks.reduce((n, b) => n + Math.max(...b.items.map((p) => unitsOf(p.course))), 0)
    return { ...t, code: t.id, id, items, blocks, units }
  })
  const placed = new Set(Object.values(plan.schedule).flat())

  const omitted = new Set(plan.omitted ?? [])
  // Omitting part a of a sequence omits b and c with it: you can't take
  // them without a. Restoring works the other way round. Seminars and the
  // like have no such chain, so only the one part moves.
  const omit = (p) => {
    const later = partsIndependent(p.course)
      ? [p.id]
      : partsOf(p.course).filter((x) => x.part >= p.part).map((x) => x.id)
    setOmitted([...new Set([...(plan.omitted ?? []), ...later])])
  }
  const restore = (p) => {
    const earlier = partsIndependent(p.course)
      ? [p.id]
      : partsOf(p.course).filter((x) => x.part <= p.part).map((x) => x.id)
    setOmitted((plan.omitted ?? []).filter((id) => !earlier.includes(id)))
  }
  const omittedParts = parts.filter((p) => omitted.has(p.id))

  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const candidates = useMemo(
    () =>
      parts
        .filter((p) => (onlyTracks ? p.listed : true))
        .filter((p) => p.status !== 'skip' && p.status !== 'done')
        .filter((p) => !omitted.has(p.id))
        .filter((p) => !termFilter || p.term.includes(termFilter))
        .filter((p) => {
          if (!words.length) return true
          const hay = `${p.course.label} ${p.course.title} ${p.course.desc}`.toLowerCase()
          return words.every((w) => hay.includes(w))
        })
        .sort((a, b) => a.course.dept.localeCompare(b.course.dept) || a.course.number - b.course.number || a.part.localeCompare(b.part))
        .slice(0, onlyTracks && !words.length ? 500 : 60),
    [parts, onlyTracks, words.join(' '), plan.omitted, termFilter],
  )

  const add = (term, pid) => setTerm(term.id, [...(plan.schedule[term.id] ?? []), pid])
  const drop = (term, pid) => {
    unlink(term, pid)
    setTerm(term.id, (plan.schedule[term.id] ?? []).filter((x) => x !== pid))
  }

  // "or": click it on one course, then on another in the same term, and the
  // two become alternatives. A third click joins an existing group.
  const link = (term, pid) => {
    if (!linking) return setLinking(pid)
    if (linking === pid) return setLinking(null)
    const groups = (plan.either?.[term.id] ?? []).map((g) => [...g.ids])
    const a = groups.find((g) => g.includes(linking))
    const b = groups.find((g) => g.includes(pid))
    let next
    if (a && b && a !== b) next = [...groups.filter((g) => g !== a && g !== b), [...new Set([...a, ...b])]]
    else if (a) next = groups.map((g) => (g === a ? [...new Set([...g, pid])] : g))
    else if (b) next = groups.map((g) => (g === b ? [...new Set([...g, linking])] : g))
    else next = [...groups, [linking, pid]]
    setLinking(null)
    setEither(term.id, next.map((ids) => ({ ids }))).catch((e) => alert(e.message))
  }
  const unlink = (term, pid) => {
    const groups = (plan.either?.[term.id] ?? [])
      .map((g) => ({ ids: g.ids.filter((x) => x !== pid) }))
      .filter((g) => g.ids.length > 1)
    setEither(term.id, groups)
  }

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
          {year}–{String(year + 1).slice(2)}, three terms. <Link to="/courses">The courses page</Link>{' '}
          is everything of interest across the PhD; this is what goes where this year, from the
          courses the {catalog.current} catalog actually offers.
        </p>
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
              {term.blocks.map((b) =>
                b.kind === 'either' ? (
                  <div key={b.key} className="yearplan-either">
                    <span className="yearplan-either-label">one of</span>
                    {b.items.map((p) => (
                      <PartCard
                        key={p.id}
                        part={p}
                        schedule={schedule}
                        canEdit={canEdit}
                        linking={linking === p.id}
                        linkActive={linking !== null}
                        onRemove={() => drop(term, p.id)}
                        onLink={() => link(term, p.id)}
                        onUnlink={() => unlink(term, p.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <PartCard
                    key={b.key}
                    part={b.items[0]}
                    schedule={schedule}
                    canEdit={canEdit}
                    linking={linking === b.items[0].id}
                    linkActive={linking !== null}
                    onRemove={() => drop(term, b.items[0].id)}
                    onLink={() => link(term, b.items[0].id)}
                  />
                ),
              )}
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
            placeholder={`Search what ${catalog.current} offers…`}
          />
          <label>
            <input type="checkbox" checked={onlyTracks} onChange={(e) => setOnlyTracks(e.target.checked)} />
            only courses on my tracks
          </label>
          <div className="yearplan-termfilter" role="group" aria-label="Term">
            {[{ id: '', name: 'Any term' }, ...TERMS].map((t) => (
              <button
                type="button"
                key={t.id}
                className={termFilter === t.id ? 'is-on' : ''}
                onClick={() => setTermFilter(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        {!canEdit && (
          <p className="courses-hint">
            Read-only unless <Link to="/admin">signed in</Link>.
          </p>
        )}
        <div className="yearplan-candidates">
          {candidates.map((p) => {
            const isPlaced = placed.has(p.id)
            return (
              <article
                key={p.id}
                className={`yearplan-cand${isPlaced ? ' is-placed' : ''}`}
                style={p.track ? { '--track': p.track.color } : undefined}
              >
                <button
                  type="button"
                  className="yearplan-cand-main"
                  onClick={() => setOpenId(openId === p.id ? null : p.id)}
                >
                  <span className="courses-card-num">
                    {p.course.key}
                    {p.part ? ` ${p.part}` : ''}
                  </span>
                  <span className="courses-card-title">{p.course.title}</span>
                  <span className="courses-card-meta">
                    {unitsOf(p.course)} units · {p.term.join(' ') || 'term ?'}
                    {bucketLabel(p.course)}
                    {p.track ? ` · ${p.track.name}` : ''}
                    {p.status ? ` · ${STATUS_LABEL[p.status]}` : ''}
                  </span>
                </button>
                {openId === p.id && <Detail part={p} schedule={schedule} />}
                {canEdit && (
                  <div className="yearplan-cand-side">
                    <button type="button" className="is-omit" title="Not this year" onClick={() => omit(p)}>
                      omit
                    </button>
                    {columns.map((term) => {
                      const fits = p.term.includes(term.code) || !p.term.length
                      const here = (plan.schedule[term.id] ?? []).includes(p.id)
                      return (
                        <button
                          type="button"
                          key={term.id}
                          disabled={here || (!fits && p.term.length > 0)}
                          title={fits ? `Add to ${term.name}` : `Not listed for ${term.name.toLowerCase()}`}
                          onClick={() => add(term, p.id)}
                        >
                          {here ? '✓' : '+'} {term.code}
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

        {omittedParts.length > 0 && (
          <div className="yearplan-omitted">
            <button type="button" className="yearplan-toggle" onClick={() => setShowOmitted((o) => !o)}>
              {showOmitted ? '▾' : '▸'} Omitted this year ({omittedParts.length})
            </button>
            {showOmitted && (
              <div className="yearplan-candidates">
                {omittedParts.map((p) => (
                  <article key={p.id} className="yearplan-cand is-placed" style={p.track ? { '--track': p.track.color } : undefined}>
                    <button
                      type="button"
                      className="yearplan-cand-main"
                      onClick={() => setOpenId(openId === p.id ? null : p.id)}
                    >
                      <span className="courses-card-num">
                        {p.course.key}
                        {p.part ? ` ${p.part}` : ''}
                      </span>
                      <span className="courses-card-title">{p.course.title}</span>
                    </button>
                    {openId === p.id && <Detail part={p} schedule={schedule} />}
                    {canEdit && (
                      <div className="yearplan-cand-side">
                        <button type="button" onClick={() => restore(p)}>
                          restore
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </section>
  )
}

function PartCard({ part, canEdit, onRemove, onLink, onUnlink, linking, linkActive, schedule }) {
  const [open, setOpen] = useState(false)
  const { course } = part
  return (
    <article
      className={`courses-card${linking ? ' is-linking' : ''}${linkActive && !linking ? ' is-link-target' : ''}`}
      style={part.track ? { '--track': part.track.color } : undefined}
    >
      <button
        type="button"
        className="courses-card-main"
        title={linkActive && !linking ? 'Click to make this the alternative' : undefined}
        // While an "or" is pending, a click on any other card completes it.
        onClick={() => (linkActive && !linking && onLink ? onLink() : setOpen((o) => !o))}
      >
        <span className="courses-card-num">
          {course.key}
          {part.part ? ` ${part.part}` : ''}
        </span>
        <span className="courses-card-title">{course.title}</span>
        <span className="courses-card-meta">
          {unitsOf(course)} units{bucketLabel(course)}
          {part.status ? ` · ${STATUS_LABEL[part.status]}` : ''}
        </span>
      </button>
      {open && <Detail part={part} schedule={schedule} />}
      {canEdit && (
        <div className="courses-card-side">
          <button type="button" className="courses-remove" onClick={onRemove}>
            Remove
          </button>
          {onUnlink ? (
            <button type="button" className="courses-remove" onClick={onUnlink}>
              Unlink
            </button>
          ) : (
            <button
              type="button"
              className={`courses-remove${linking ? ' is-on' : ''}`}
              title="Choose between this and another course: click here, then the other one’s “or”"
              onClick={onLink}
            >
              {linking ? 'or… pick the other' : 'or'}
            </button>
          )}
        </div>
      )}
    </article>
  )
}

// What opens under a course: a short description, its prerequisites and,
// for terms whose schedule the registrar has published, when it meets.
function Detail({ part, schedule }) {
  const { course } = part
  const brief = course.desc.length > 320 ? course.desc.slice(0, course.desc.lastIndexOf(' ', 320)) + '…' : course.desc
  return (
    <div className="courses-card-detail yearplan-detail">
      <p>{brief}</p>
      {course.prereq && (
        <p>
          <b>Prerequisites.</b> {course.prereq}
        </p>
      )}
      {part.term.map((code) => {
        const list = sectionsFor(schedule, code, part)
        return (
          <p key={code} className="yearplan-time">
            <b>{code}.</b>{' '}
            {list === null
              ? 'Schedule not published yet.'
              : !list.length
                ? `Not on the registrar’s ${code} schedule (yet).`
                : list
                    .map((x) => `${x.time}${x.location ? ` · ${x.location}` : ''}${x.instructor ? ` · ${x.instructor}` : ''}${x.note ? ` (${x.note})` : ''}`)
                    .join(' / ')}
          </p>
        )
      })}
    </div>
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
