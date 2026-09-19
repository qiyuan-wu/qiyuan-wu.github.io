// Scrapes the registrar's schedule of classes into public/schedule.json:
// section, instructor, days/time and room per course part, per term. Run
// once a term as each schedule appears:  node scripts/schedule.mjs
//
// The catalog says what a course is; this says when it meets this year.
import { writeFileSync } from 'node:fs'

const YEAR = '2026-27'
const TERMS = ['FA', 'WI', 'SP']

const text = (h) =>
  h
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, '’')
    .replace(/\s+/g, ' ')
    .trim()

// "CMS/ACM/IDS  107A" -> { key: "CMS/ACM/IDS 107", part: "a" }
function parseLabel(s) {
  const m = s.match(/^([A-Za-z/]+)\s*(\d+)\s*([A-Za-z]?)\s*$/)
  if (!m) return null
  return { key: `${m[1]} ${m[2]}`, part: m[3].toLowerCase() }
}

async function scrape(term) {
  const res = await fetch(`https://schedules.caltech.edu/${term}${YEAR}.html`)
  if (!res.ok) return null
  const html = await res.text()
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) =>
    [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => text(c[1])).filter(Boolean),
  )
  const out = {}
  let current = null
  let note = ''
  for (const cells of rows) {
    if (!cells.length) continue
    const head = parseLabel(cells[0])
    // A course line: label | units | title. Some wrap the label onto its own row.
    if (head && (cells.length >= 3 || cells.length === 1)) {
      current = head
      note = ''
      continue
    }
    if (current && cells.length === 1 && !/^\d\d$/.test(cells[0])) {
      note = cells[0] // "Units Pending Catalog Approval", "Course Cancelled", ...
      continue
    }
    // A section line: 01 | Instructor | Days/Time | Location | Grade
    if (current && /^\d\d$/.test(cells[0])) {
      const [section, instructor, time, location] = cells
      if (!time || time === 'A') continue // arranged
      const id = `${current.key}${current.part ? ` ${current.part}` : ''}`
      const list = (out[id] ??= [])
      // A cross-listed course appears under each of its departments.
      if (!list.some((x) => x.section === section && x.time === time))
        list.push({ section, instructor, time, location: location ?? '', note })
    }
  }
  return out
}

const schedule = {}
for (const term of TERMS) {
  const s = await scrape(term)
  if (s) {
    schedule[term] = s
    console.error(term, Object.keys(s).length, 'courses with times')
  } else console.error(term, 'not published yet')
}
writeFileSync('public/schedule.json', JSON.stringify({ year: YEAR, terms: schedule }))
