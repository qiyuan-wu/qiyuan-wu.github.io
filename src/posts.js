import { Marked } from 'marked'
import markedKatex from 'marked-katex-extension'

// Every post is a Markdown file in src/posts/, named YYYY-MM-DD-slug.md. The
// date and slug come from the filename; the frontmatter only needs a title.
//
//   ---
//   title: Something I noticed
//   draft: true        # optional — shown by `npm run dev`, left out of the build
//   ---
//
// Math is $inline$ and $$display$$, rendered by KaTeX.
const files = import.meta.glob('./posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const marked = new Marked(markedKatex({ throwOnError: false, nonStandard: true }))

const NAME = /(\d{4}-\d{2}-\d{2})-(.+)\.md$/

// Just enough YAML for `key: value` lines; anything richer is not needed here.
function splitFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { meta: {}, body: raw }
  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^(\w+):\s*(.*?)\s*$/)
    if (!pair) continue
    let value = pair[2].replace(/^(["'])(.*)\1$/, '$2')
    if (value === 'true') value = true
    else if (value === 'false') value = false
    meta[pair[1]] = value
  }
  return { meta, body: raw.slice(match[0].length) }
}

export const POSTS = Object.entries(files)
  .map(([path, raw]) => {
    const name = path.match(NAME)
    if (!name) return null
    const { meta, body } = splitFrontmatter(raw)
    return {
      slug: name[2],
      date: name[1],
      title: meta.title ?? name[2],
      draft: meta.draft === true,
      html: marked.parse(body),
    }
  })
  .filter((post) => post && (import.meta.env.DEV || !post.draft))
  .sort((a, b) => b.date.localeCompare(a.date))

export function findPost(slug) {
  return POSTS.find((post) => post.slug === slug)
}

export function formatDate(date, lang) {
  const [y, m, d] = date.split('-').map(Number)
  if (lang === 'zh') return `${y}年${m}月${d}日`
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
