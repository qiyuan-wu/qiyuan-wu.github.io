// Open Tree of Life returns one node per taxonomic rank, so a six-species tree
// arrives ~55 levels deep and almost every level is a single-child link named
// something like `mrcaott83926ott84217`. Everything in this file exists to
// squeeze that back down to the handful of nodes where our own species actually
// diverge from each other.

// Minimal Newick reader. Quoted labels matter more than they look: Open Tree
// disambiguates homonyms with labels like `'Eutheria (in Deuterostomia) ott683263'`,
// and reading those parentheses as structure quietly swallows whole clades.
// The induced-subtree response carries no branch lengths, but skipping them
// costs two lines and saves a surprise later.
export function parseNewick(text) {
  const s = text.trim().replace(/;\s*$/, '')
  let i = 0

  function readLabel() {
    if (s[i] !== "'") {
      const start = i
      while (i < s.length && !',();:'.includes(s[i])) i += 1
      return s.slice(start, i).trim()
    }
    i += 1
    let out = ''
    while (i < s.length) {
      if (s[i] === "'") {
        if (s[i + 1] === "'") {
          out += "'"
          i += 2
          continue
        }
        i += 1
        break
      }
      out += s[i]
      i += 1
    }
    return out
  }

  function readNode() {
    const children = []
    if (s[i] === '(') {
      i += 1
      for (;;) {
        children.push(readNode())
        if (s[i] === ',') {
          i += 1
          continue
        }
        break
      }
      if (s[i] === ')') i += 1
    }
    const label = readLabel()
    if (s[i] === ':') {
      i += 1
      while (i < s.length && !',();'.includes(s[i])) i += 1
    }
    return { label, children }
  }

  return readNode()
}

// `Homo_sapiens_ott770315` is a taxon someone named. `mrcaott83926ott84217`
// and `h2007-1` are placeholders the synthetic tree invented for splits nobody
// named — never worth showing to a reader.
function decodeLabel(raw) {
  if (!raw || raw.startsWith('mrcaott')) return { name: '', ott: null }
  const match = /^(.+?)[ _]ott(\d+)$/.exec(raw)
  const ott = match ? Number(match[2]) : null
  const name = (match ? match[1] : raw)
    .replace(/_/g, ' ')
    // Drop the homonym qualifier: `Eutheria (in Deuterostomia)` -> `Eutheria`.
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()
  if (/^h\d+-\d+$/.test(name)) return { name: '', ott }
  return { name, ott }
}

// Drop every single-child link. A node that survives is either a tip or a real
// branch point. Names met on the way up all describe the same set of tips as
// the node they collapse into, so they are kept as label candidates, innermost
// first — that is the tightest named clade holding exactly these tips, and the
// only one worth suggesting (Carnivora, not Laurasiatheria).
function compress(node) {
  if (!node.children.length) {
    const { name, ott } = decodeLabel(node.label)
    return { name, ott, candidates: [], children: [] }
  }

  if (node.children.length === 1) {
    const only = compress(node.children[0])
    const { name } = decodeLabel(node.label)
    if (name) only.candidates = [...only.candidates, name]
    return only
  }

  const { name, ott } = decodeLabel(node.label)
  return {
    name: '',
    ott,
    candidates: name ? [name] : [],
    children: node.children.map(compress),
  }
}

// A node's identity is the set of tips under it. That is exact but it is not
// stable: adding a gorilla changes the tip set of every clade above it, so
// labels are moved across a rebuild by `migrateClades` rather than matched
// blindly. Keying on a clade's own taxon id would be stable and occasionally
// wrong, which on a phylogeny is the worse failure.
function signature(node) {
  const ids = []
  const walk = (n) => {
    if (!n.children.length) {
      if (n.ott != null) ids.push(n.ott)
      return
    }
    n.children.forEach(walk)
  }
  walk(node)
  return ids.sort((a, b) => a - b).join('-')
}

// Small clades ride above big ones, so the eye follows one long spine instead
// of a zigzag. Cheap, and it is most of what makes the drawing look deliberate.
function ladderize(node) {
  if (!node.children.length) return 1
  const sizes = new Map()
  node.children.forEach((child) => sizes.set(child, ladderize(child)))
  node.children.sort(
    (a, b) => sizes.get(a) - sizes.get(b) || a.name.localeCompare(b.name),
  )
  return node.children.reduce((sum, child) => sum + sizes.get(child), 0)
}

// Turns the stored Newick into the tree the page draws: tips carry both names,
// internal nodes carry a curated label if one was chosen for that exact split.
export function buildTree(newick, { species = [], clades = {} } = {}) {
  if (!newick) return null
  const byOtt = new Map(species.map((s) => [s.ott, s]))

  const decorate = (node) => {
    const id = signature(node)
    if (!node.children.length) {
      const entry = byOtt.get(node.ott)
      return {
        id,
        ott: node.ott,
        sci: entry?.sci ?? node.name,
        common: entry?.common ?? '',
        zh: entry?.zh ?? '',
        children: [],
        leafCount: 1,
      }
    }
    const children = node.children.map(decorate)
    return {
      id,
      ott: node.ott,
      label: clades[id] ?? '',
      candidates: node.candidates,
      children,
      leafCount: children.reduce((sum, c) => sum + c.leafCount, 0),
    }
  }

  const compressed = compress(parseNewick(newick))
  ladderize(compressed)
  return decorate(compressed)
}

// A curated label follows the smallest clade that still contains everything it
// covered before. Adding a gorilla widens the split you called Mammalia; it
// does not un-name it. Removing a species narrows what the label has to match
// rather than killing it, since an inclusive label's key names every tip on the
// tree and would otherwise die the first time anything was deleted. A label
// left with fewer than two species has nothing left to identify and is dropped,
// which is the only way one disappears.
export function migrateClades(clades, tree) {
  if (!tree) return {}

  const living = new Set(tree.id.split('-').map(Number))
  const nodes = []
  const walk = (node) => {
    if (!node.children.length) return
    nodes.push(node)
    node.children.forEach(walk)
  }
  walk(tree)
  const tipsOf = new Map(
    nodes.map((node) => [node, new Set(node.id.split('-').map(Number))]),
  )

  const claims = new Map()
  for (const [key, label] of Object.entries(clades ?? {})) {
    const original = key.split('-').map(Number)
    const wanted = original.filter((tip) => living.has(tip))
    if (wanted.length < 2) continue

    let best = null
    for (const node of nodes) {
      const tips = tipsOf.get(node)
      if (!wanted.every((tip) => tips.has(tip))) continue
      if (!best || node.leafCount < best.leafCount) best = node
    }
    if (!best) continue

    // Deleting species can squeeze two labels onto one node. A label that still
    // matches its whole original set has the better claim on it; failing that,
    // the one that had to give up least.
    const claim = { label, exact: wanted.length === original.length, size: wanted.length }
    const held = claims.get(best.id)
    if (
      !held ||
      (claim.exact && !held.exact) ||
      (claim.exact === held.exact && claim.size > held.size)
    ) {
      claims.set(best.id, claim)
    }
  }

  return Object.fromEntries([...claims].map(([id, held]) => [id, held.label]))
}
