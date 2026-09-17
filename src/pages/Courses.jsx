import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useCourses, STATUSES } from '../useCourses.js'
import { ALSO, DEGREE, TRACKS, bucketOf, findCourse, partsOf, sameCourse, unitsOf } from '../courses.js'

const STATUS_LABEL = { want: 'want', taking: 'taking', done: 'done', skip: 'skip' }

export default function Courses() {
  useDocumentTitle('Courses · Qiyuan Wu')
  const { catalog, plan: stored, canEdit, setStatus, addToTrack, removeFromTrack } = useCourses()
  const courses = catalog?.courses ?? []

  // Statuses saved before parts existed sit under the whole course's key;
  // read them as applying to every part until a part is marked on its own.
  const plan = useMemo(() => {
    const status = { ...stored.status }
    for (const [key, value] of Object.entries(stored.status)) {
      const course = courses.find((c) => c.key === key)
      if (!course) continue
      for (const part of partsOf(course)) if (!(part.id in status)) status[part.id] = value
    }
    return { ...stored, status }
  }, [stored, courses])

  // Each track, with catalog entries attached, Firestore additions folded in
  // and removed courses dropped. A course I put on a track from the browser
  // lands in its last stage.
  const tracks = useMemo(
    () =>
      TRACKS.map((t) => {
        const stages = t.stages.map((s) => ({
          ...s,
          courses: s.courses
            .map((c) => ({ ...c, course: findCourse(courses, c.ref) }))
            .filter((c) => c.course && !plan.removed.includes(c.course.key)),
        }))
        const extra = (plan.added[t.id] ?? [])
          .map((c) => ({ ...c, ref: c.key, course: courses.find((x) => x.key === c.key) }))
          .filter((c) => c.course)
        if (extra.length) stages[stages.length - 1].courses.push(...extra)
        return { ...t, stages }
      }),
    [courses, plan],
  )

  const also = useMemo(
    () => ALSO.map((c) => ({ ...c, course: findCourse(courses, c.ref) })).filter((c) => c.course),
    [courses],
  )

  // Units toward each bucket, by status, and the courses behind each number.
  // A course on two tracks counts once. Units are for the whole sequence:
  // ME 101 abc is three terms, so 27.
  const progress = useMemo(() => {
    const seen = new Set()
    const sum = Object.fromEntries(
      DEGREE.buckets.map((b) => [b.id, { done: 0, taking: 0, want: 0, items: [] }]),
    )
    const all = [...tracks.flatMap((t) => t.stages.flatMap((s) => s.courses)), ...also]
    for (const { course } of all) {
      if (seen.has(course.key)) continue
      seen.add(course.key)
      const bucket = bucketOf(course)
      if (!bucket || !sum[bucket]) continue
      for (const part of partsOf(course)) {
        const status = plan.status[part.id]
        if (!(status in sum[bucket])) continue
        sum[bucket][status] += unitsOf(course)
        sum[bucket].items.push({ course, part, status, units: unitsOf(course), bucket })
      }
    }
    // Overflow past a bucket rolls into electives, as the option allows.
    for (const b of DEGREE.buckets) {
      if (b.id === 'elective' || b.id === 'research' || b.id === 'seminar') continue
      let over = sum[b.id].done + sum[b.id].taking + sum[b.id].want - b.units
      if (over <= 0) continue
      for (const k of ['want', 'taking', 'done']) {
        const move = Math.min(over, sum[b.id][k])
        sum[b.id][k] -= move
        sum.elective[k] += move
        over -= move
        if (move) sum.elective.items.push({ from: b.name, status: k, units: move })
      }
    }
    return sum
  }, [tracks, also, plan])

  if (!catalog) {
    return (
      <section className="page-section courses-page">
        <p className="courses-hint">Loading the catalog…</p>
      </section>
    )
  }

  return (
    <section className="page-section courses-page">
      <div className="section-head">
        <p className="page-eyebrow">Caltech · Mechanical Engineering PhD</p>
        <h1>Courses</h1>
        <p className="section-sub">
          Routes through the catalog, one per interest. Arrows follow prerequisites; the
          degree just has to be satisfied along the way.
        </p>
      </div>

      <Requirements progress={progress} />

      {tracks.map((t) => (
        <Track
          key={t.id}
          track={t}
          plan={plan}
          canEdit={canEdit}
          setStatus={setStatus}
          remove={(key) => removeFromTrack(t.id, key)}
        />
      ))}

      <section className="courses-also">
        <h2>Also</h2>
        <div className="courses-stage-list">
          {also.map((c) => (
            <CourseCard key={c.course.key} item={c} plan={plan} canEdit={canEdit} setStatus={setStatus} />
          ))}
        </div>
      </section>

      <Browse courses={courses} current={catalog.current} tracks={tracks} canEdit={canEdit} addToTrack={addToTrack} />

      <p className="courses-hint courses-foot">
        Catalog {catalog.current}, merged with {catalog.years?.length - 1} earlier years so
        alternate-year courses still show. {canEdit ? 'Signed in — statuses save live.' : (
          <>Statuses are read-only unless <Link to="/admin">signed in</Link>.</>
        )}
      </p>
    </section>
  )
}

function Requirements({ progress }) {
  const [open, setOpen] = useState(null)
  const totals = DEGREE.buckets.reduce(
    (acc, b) => {
      acc.done += progress[b.id].done
      acc.taking += progress[b.id].taking
      acc.want += progress[b.id].want
      return acc
    },
    { done: 0, taking: 0, want: 0 },
  )
  const shown = open && DEGREE.buckets.find((b) => b.id === open)
  const order = { done: 0, taking: 1, want: 2 }
  return (
    <section className="courses-req">
      <div className="courses-req-grid">
        {DEGREE.buckets.map((b) => {
          const p = progress[b.id]
          const pct = (n) => `${Math.min(100, (n / b.units) * 100)}%`
          return (
            <button
              type="button"
              key={b.id}
              className={`courses-req-item${open === b.id ? ' is-open' : ''}`}
              onClick={() => setOpen(open === b.id ? null : b.id)}
            >
              <div className="courses-req-head">
                <span>{b.name}</span>
                <span className="courses-req-n">
                  {p.done + p.taking}
                  <small> / {b.units}</small>
                </span>
              </div>
              <div className="courses-meter">
                <span className="is-want" style={{ width: pct(p.done + p.taking + p.want) }} />
                <span className="is-taking" style={{ width: pct(p.done + p.taking) }} />
                <span className="is-done" style={{ width: pct(p.done) }} />
              </div>
              <p className="courses-req-rule">{b.rule}</p>
            </button>
          )
        })}
      </div>

      {shown && (
        <div className="courses-req-detail">
          <p>
            <b>{shown.name}</b> — {shown.rule}{' '}
            {progress[shown.id].want ? (
              <span className="courses-dim">
                {progress[shown.id].done + progress[shown.id].taking} counted, {progress[shown.id].want} more wanted.
              </span>
            ) : null}
          </p>
          {progress[shown.id].items.length ? (
            <ul>
              {[...progress[shown.id].items]
                .sort((a, b) => order[a.status] - order[b.status])
                .map((it, i) => (
                  <li key={it.part?.id ?? i}>
                    <span className={`courses-status is-${it.status}`}>{STATUS_LABEL[it.status]}</span>
                    {it.course ? (
                      <>
                        <span className="courses-card-num">
                          {it.course.key}
                          {it.part.part ? ` ${it.part.part}` : ''}
                        </span>{' '}
                        {it.course.title}
                      </>
                    ) : (
                      <span className="courses-dim">overflow from {it.from}</span>
                    )}
                    <span className="courses-req-units">{it.units} u</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="courses-dim">
              {shown.id === 'research'
                ? 'Research units come from ME 200-type registrations; they are not tracked here.'
                : 'Nothing marked yet. Statuses want, taking and done count; skip does not.'}
            </p>
          )}
          <p className="courses-dim">
            Each term of a sequence is its own registration: ME 101 a, b and c are 9 units apiece.
            Anything past a bucket’s cap spills into electives.
          </p>
        </div>
      )}

      <div className="courses-req-total">
        <span>
          <strong>{totals.done + totals.taking}</strong> of {DEGREE.total} units
          {totals.want ? <span className="courses-dim"> · {totals.want} more wanted</span> : null}
        </span>
        <span className="courses-milestones">
          {DEGREE.milestones.map((m) => (
            <span key={m.term} title={m.text}>
              <b>T{m.term}</b> {m.text.split(' — ')[0].split(' (')[0]}
            </span>
          ))}
        </span>
      </div>
    </section>
  )
}

function Track({ track, plan, canEdit, setStatus, remove }) {
  const box = useRef(null)
  const [edges, setEdges] = useState([])

  const all = track.stages.flatMap((s) => s.courses)
  const parts = all.flatMap((c) => partsOf(c.course).map((p) => ({ ...p, course: c.course })))
  const units = parts.reduce((n, p) => n + unitsOf(p.course), 0)
  const done = parts.filter((p) => plan.status[p.id] === 'done').length

  // Arrows are drawn after layout from the cards' real positions, so they
  // survive wrapping, expansion and the phone layout alike.
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const draw = () => {
      const root = el.getBoundingClientRect()
      const cards = [...el.querySelectorAll('[data-key]')]
      const rect = (key) => {
        const c = cards.find((x) => x.dataset.key === key)
        if (!c) return null
        const r = c.getBoundingClientRect()
        return { l: r.left - root.left, r: r.right - root.left, t: r.top - root.top, b: r.bottom - root.top, y: r.top + r.height / 2 - root.top, x: r.left + r.width / 2 - root.left }
      }
      const next = []
      for (const c of all) {
        for (const ref of c.after ?? []) {
          const from = all.find((x) => sameCourse(x.course, ref))
          if (!from) continue
          const a = rect(from.course.key)
          const b = rect(c.course.key)
          if (!a || !b) continue
          const vertical = b.t >= a.b - 4 && Math.abs(a.x - b.x) < (a.r - a.l)
          const d = vertical
            ? `M${a.x},${a.b} C${a.x},${(a.b + b.t) / 2} ${b.x},${(a.b + b.t) / 2} ${b.x},${b.t}`
            : `M${a.r},${a.y} C${(a.r + b.l) / 2},${a.y} ${(a.r + b.l) / 2},${b.y} ${b.l},${b.y}`
          next.push({ id: `${from.course.key}>${c.course.key}`, d })
        }
      }
      setEdges(next)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(el)
    for (const c of el.querySelectorAll('[data-key]')) ro.observe(c)
    return () => ro.disconnect()
  }, [all.map((c) => c.course.key).join(), plan.status])

  return (
    <section className="courses-track" style={{ '--track': track.color, '--stages': track.stages.length }}>
      <header className="courses-track-head">
        <h2>{track.name}</h2>
        <p>{track.tagline}</p>
        <span className="courses-track-meta">
          {all.length} courses · {parts.length} terms · {units} units · {done} done
        </span>
      </header>
      <div className="courses-stages" ref={box}>
        <svg className="courses-edges" aria-hidden="true">
          {edges.map((e) => (
            <path key={e.id} d={e.d} />
          ))}
        </svg>
        {track.stages.map((s) => (
          <div key={s.name} className="courses-stage">
            <h3>{s.name}</h3>
            <div className="courses-stage-list">
              {s.courses.map((c) => (
                <CourseCard
                  key={c.course.key}
                  item={c}
                  plan={plan}
                  canEdit={canEdit}
                  setStatus={setStatus}
                  remove={remove}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CourseCard({ item, plan, canEdit, setStatus, remove }) {
  const [open, setOpen] = useState(false)
  const { course, why } = item
  const parts = partsOf(course)
  const statuses = parts.map((p) => plan.status[p.id])
  const bucket = bucketOf(course)
  // The card takes the colour of its furthest-along part.
  const lead = ['done', 'taking', 'want', 'skip'].find((s) => statuses.includes(s))
  const units = unitsOf(course)

  const cycle = (part) => {
    const status = plan.status[part.id]
    const i = STATUSES.indexOf(status)
    setStatus(part.id, i === STATUSES.length - 1 ? null : STATUSES[i + 1])
  }

  const chip = (part) => {
    const status = plan.status[part.id]
    const label = part.part
      ? `${part.part}${status ? ` · ${STATUS_LABEL[status]}` : ''}`
      : status
        ? STATUS_LABEL[status]
        : 'mark'
    return canEdit ? (
      <button
        type="button"
        key={part.id}
        className={`courses-status${status ? ` is-${status}` : ''}`}
        title={part.term.join(' ')}
        onClick={() => cycle(part)}
      >
        {label}
      </button>
    ) : (
      status && (
        <span key={part.id} className={`courses-status is-${status}`} title={part.term.join(' ')}>
          {label}
        </span>
      )
    )
  }

  return (
    <article
      className={`courses-card${lead ? ` is-${lead}` : ''}${open ? ' is-open' : ''}${course.offered ? '' : ' is-off'}`}
      data-key={course.key}
    >
      <button type="button" className="courses-card-main" onClick={() => setOpen((o) => !o)}>
        <span className="courses-card-num">{course.label}</span>
        <span className="courses-card-title">{course.title}</span>
        <span className="courses-card-meta">
          {units} units{parts.length > 1 ? ` × ${parts.length}` : ''}
          {' · '}
          {parts.length > 1
            ? parts.map((p) => `${p.part}:${p.term.join('/') || '?'}`).join(' ')
            : parts[0].term.join(' ')}
          {bucket && bucket !== 'hss' ? ` · ${DEGREE.buckets.find((b) => b.id === bucket)?.name.replace('ME core — ', '')}` : ''}
          {bucket === 'hss' ? ' · outside the 195' : ''}
          {!course.offered ? ' · not this year' : ''}
        </span>
        {why && <span className="courses-card-why">{why}</span>}
      </button>
      {open && (
        <div className="courses-card-detail">
          <p>{course.desc}</p>
          {course.prereq && (
            <p>
              <b>Prerequisites.</b> {course.prereq}
            </p>
          )}
          <p className="courses-dim">
            {course.units}
            {course.instructors ? ` · ${course.instructors}` : ''}
            {' · in catalog '}
            {course.years.join(', ')}
          </p>
          {canEdit && remove && (
            <button type="button" className="courses-remove" onClick={() => remove(course.key)}>
              Remove from this track
            </button>
          )}
        </div>
      )}
      <div className="courses-card-side">{parts.map(chip)}</div>
    </article>
  )
}

function Browse({ courses, current, tracks, canEdit, addToTrack }) {
  const [q, setQ] = useState('')
  const [offeredOnly, setOfferedOnly] = useState(false)
  const [target, setTarget] = useState(tracks[0]?.id ?? '')

  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const results = useMemo(() => {
    if (!words.length) return []
    return courses
      .filter((c) => !offeredOnly || c.offered)
      .filter((c) => {
        const hay = `${c.label} ${c.title} ${c.desc} ${c.instructors} ${(c.aliases ?? []).join(' ')}`.toLowerCase()
        return words.every((w) => hay.includes(w))
      })
      .slice(0, 40)
  }, [courses, words.join(' '), offeredOnly])

  const onTracks = (key) => tracks.filter((t) => t.stages.some((s) => s.courses.some((c) => c.course.key === key)))

  return (
    <section className="courses-browse">
      <h2>Browse the catalog</h2>
      <p className="courses-hint">
        {courses.length} courses numbered 100 and up, across every department. Search a number, a
        title or a word from the description.
      </p>
      <div className="courses-browse-bar">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="turbulence, Batygin, Ge 137, phylogen…"
        />
        <label>
          <input type="checkbox" checked={offeredOnly} onChange={(e) => setOfferedOnly(e.target.checked)} />
          offered {current}
        </label>
        {canEdit && (
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                add to: {t.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="courses-results">
        {results.map((c) => {
          const on = onTracks(c.key)
          return (
            <BrowseRow
              key={c.key}
              course={c}
              on={on}
              canEdit={canEdit}
              onAdd={() => addToTrack(target, c.key)}
              added={on.some((t) => t.id === target)}
            />
          )
        })}
        {words.length > 0 && !results.length && <p className="courses-hint">Nothing matches.</p>}
      </div>
    </section>
  )
}

function BrowseRow({ course, on, canEdit, onAdd, added }) {
  const [open, setOpen] = useState(false)
  const bucket = bucketOf(course)
  return (
    <article className={`courses-row${course.offered ? '' : ' is-off'}`}>
      <button type="button" className="courses-row-main" onClick={() => setOpen((o) => !o)}>
        <span className="courses-card-num">{course.label}</span>
        <span className="courses-card-title">{course.title}</span>
        <span className="courses-card-meta">
          {course.units}
          {bucket && bucket !== 'hss' ? ` · ${DEGREE.buckets.find((b) => b.id === bucket)?.name.replace('ME core — ', '')}` : ''}
          {!course.offered ? ' · not this year' : ''}
          {on.length ? ` · on ${on.map((t) => t.name).join(', ')}` : ''}
        </span>
      </button>
      {canEdit && (
        <button type="button" className="courses-add" onClick={onAdd} disabled={added}>
          {added ? 'added' : '+ add'}
        </button>
      )}
      {open && (
        <div className="courses-card-detail">
          <p>{course.desc}</p>
          {course.prereq && (
            <p>
              <b>Prerequisites.</b> {course.prereq}
            </p>
          )}
          <p className="courses-dim">
            {course.instructors ? `${course.instructors} · ` : ''}in catalog {course.years.join(', ')}
          </p>
        </div>
      )}
    </article>
  )
}
