// Scrapes the Caltech catalog into public/catalog.json for the Courses page.
// Run once a year when the new catalog lands:  node scripts/catalog.mjs
//
// Courses come and go, and many alternate years, so several catalog years are
// merged: each course keeps the years it appeared in and whether the current
// year lists it as offered. Details (title, units, description, prerequisites)
// come from the newest year that has the course.
import { writeFileSync } from 'node:fs'

const CURRENT = '2026-27'
const YEARS = ['2026-27', '2025-26', '2024-25', '2023-24', '2022-23']
const BASE = 'https://catalog.caltech.edu'

const urlFor = (year, dept) =>
  year === CURRENT
    ? `${BASE}/current/${year}/department/${dept}/`
    : `${BASE}/archive/${year}/${year}/department/${dept}/`

const text = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&rsquo;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/\s+/g, ' ')
    .trim()

const field = (block, cls, tag = 'div') => {
  const m = block.match(new RegExp(`<${tag} class="${cls}[^"]*"[^>]*>([\\s\\S]*?)</${tag}>`))
  return m ? text(m[1]) : ''
}

async function departments(year) {
  const index = year === CURRENT ? `${BASE}/current/${year}/` : `${BASE}/archive/${year}/`
  const html = await (await fetch(index)).text()
  const re = /department\/([A-Za-z]+)\//g
  return [...new Set([...html.matchAll(re)].map((m) => m[1]))]
}

async function scrape(year, dept) {
  const res = await fetch(urlFor(year, dept))
  if (!res.ok) return []
  const html = await res.text()
  return html
    .split('<div class="course-description2 ')
    .slice(1)
    .map((b) => ({
      label: field(b, 'course-description2__label'),
      title: field(b, 'course-description2__title', 'h2'),
      units: field(b, 'course-description2__units-and-terms'),
      prereq: field(b, 'course-description2__prerequisites').replace(/^Prerequisites?:\s*/, ''),
      desc: field(b, 'course-description2__description'),
      instructors: field(b, 'course-description2__instructors').replace(/^Instructors?:\s*/, ''),
      offered: !b.slice(0, 80).includes('not-offered'),
    }))
    .map((c) => ({ ...c, parts: (c.label.match(/\s(abc|ab|bc|a|b|c)$/)?.[1] ?? 'a').length }))
    .filter((c) => c.label)
}

// "Ae/APh/CE/ME 101 abc" -> "Ae/APh/CE/ME 101", dept "Ae", number 101.
function keyOf(label) {
  const m = label.match(/^([A-Za-z/]+)\s+(\d+)/)
  return m ? { key: `${m[1]} ${m[2]}`, dept: m[1].split('/')[0], number: Number(m[2]) } : null
}

const courses = {}
for (const year of YEARS) {
  const depts = await departments(year)
  console.error(year, depts.length, 'departments')
  const lists = await Promise.all(depts.map((d) => scrape(year, d)))
  for (const c of lists.flat()) {
    const k = keyOf(c.label)
    if (!k || k.number < 100) continue
    const prev = courses[k.key]
    if (prev) {
      if (!prev.years.includes(year)) prev.years.push(year)
      continue // newest year already filled the details
    }
    courses[k.key] = { ...c, ...k, years: [year], offered: year === CURRENT && c.offered }
  }
}

// A cross-listing that gains or loses a department ("Ae/ME 120" one year,
// "ME/Ae 120" the next) is still one course: same number, same title, a
// department in common. Fold the older listing into the newer one.
const merged = []
for (const c of Object.values(courses)) {
  const same = merged.find(
    (m) =>
      m.number === c.number &&
      m.title.toLowerCase() === c.title.toLowerCase() &&
      m.label.split(' ')[0].split('/').some((d) => c.label.split(' ')[0].split('/').includes(d)),
  )
  if (same) {
    for (const y of c.years) if (!same.years.includes(y)) same.years.push(y)
    same.aliases = [...(same.aliases ?? []), c.key]
  } else merged.push(c)
}

const out = merged.sort((a, b) => a.dept.localeCompare(b.dept) || a.number - b.number)
writeFileSync('public/catalog.json', JSON.stringify({ current: CURRENT, years: YEARS, courses: out }))
console.error(out.length, 'courses ->', 'public/catalog.json')
