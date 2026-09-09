import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'
import { useTrees } from '../useTrees.js'
import { buildTree, migrateClades } from '../tree/newick.js'
import { inducedNewick, lineageOf, matchClade, matchSpecies } from '../tree/opentree.js'

const ROW = 48 // one tip, two lines of label
const COL_MIN = 64 // columns shrink to fit the screen, but no further than this
const COL_MAX = 140
const TRI = 26 // width of a folded clade's triangle
const LABEL_W = 236
const PAD = 18

// Tips all sit in one column on the right, so the names read as a list and the
// drawing only claims the branching order is true — which is all it knows.
// Internal nodes sit at their depth; a node is always shallower than its own
// tips, so nothing collides with the tip column.
function layout(root, collapsed) {
  const rows = []
  let nextY = 0

  const visit = (node, depth) => {
    const folded = collapsed.has(node.id) && node.children.length > 0
    if (folded || !node.children.length) {
      const row = { node, depth, y: nextY++, folded, tip: true, kids: [] }
      rows.push(row)
      return row
    }
    const kids = node.children.map((child) => visit(child, depth + 1))
    const row = {
      node,
      depth,
      tip: false,
      folded: false,
      kids,
      y: (kids[0].y + kids[kids.length - 1].y) / 2,
    }
    rows.push(row)
    return row
  }

  visit(root, 0)
  const tipDepth = Math.max(1, ...rows.filter((r) => r.tip).map((r) => r.depth))
  return { rows, tipCount: nextY, tipDepth }
}

// Binomials read as *H. sapiens* once the genus has been introduced; on a tree
// where every tip is a species the genus never needs spelling out twice.
// Everything after the genus (species, subspecies) stays as written.
function abbreviate(sci) {
  const parts = sci.split(' ')
  if (parts.length < 2) return sci
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`
}

function foldedLabel(node) {
  return node.label || node.candidates?.[0] || 'Clade'
}

function useNarrow() {
  const [narrow, setNarrow] = useState(
    () => window.matchMedia('(max-width: 760px)').matches,
  )
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const update = () => setNarrow(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return narrow
}

// Width of whatever element the ref is on, kept current as the window changes.
function useWidth(ref) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return width
}

function Cladogram({ tree, collapsed, onNode, activeId, available, nameOf, focusFor, onOpen }) {
  const { rows, tipCount, tipDepth } = useMemo(
    () => layout(tree, collapsed),
    [tree, collapsed],
  )

  // Spread the depth across whatever width there is. Only the columns stretch;
  // text stays its natural size, and a very deep tree still scrolls rather than
  // crushing its columns to nothing.
  const COL = Math.max(
    COL_MIN,
    Math.min(COL_MAX, Math.floor((available - LABEL_W) / tipDepth)),
  )
  const plotW = tipDepth * COL
  const width = plotW + LABEL_W
  const height = tipCount * ROW + PAD * 2
  // A folded clade ends at the tip column like any other tip, but it needs room
  // to be a triangle rather than a point — including when it is itself the
  // deepest thing on screen and its own depth set the column.
  const xOf = (row) => {
    if (row.folded) return plotW - TRI
    return row.tip ? plotW : row.depth * COL
  }
  const yOf = (row) => PAD + row.y * ROW + ROW / 2

  return (
    <svg
      className="tree-svg"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Cladogram of the species on this page"
    >
      {rows
        .filter((row) => !row.tip)
        .map((row) => {
          const px = xOf(row)
          const first = yOf(row.kids[0])
          const last = yOf(row.kids[row.kids.length - 1])
          return (
            <g key={`edge-${row.node.id}`} className="tree-edge">
              <path d={`M${px} ${first}V${last}`} />
              {row.kids.map((kid) => (
                <path
                  key={kid.node.id}
                  d={`M${px} ${yOf(kid)}H${xOf(kid)}`}
                />
              ))}
            </g>
          )
        })}

      {rows.map((row) => {
        const px = xOf(row)
        const py = yOf(row)

        if (row.folded) {
          return (
            <g
              key={row.node.id}
              className={`tree-node tree-folded${activeId === row.node.id ? ' is-active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => onNode(row.node)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onNode(row.node)
                }
              }}
            >
              <path
                className="tree-triangle"
                d={`M${px} ${py}L${plotW} ${py - 12}L${plotW} ${py + 12}Z`}
              />
              <text className="tree-folded-name" x={plotW + 12} y={py + 4}>
                {foldedLabel(row.node)}
                <tspan className="tree-count"> {row.node.leafCount}</tspan>
              </text>
            </g>
          )
        }

        if (row.tip) {
          return (
            <g key={row.node.id} className="tree-node tree-tip">
              <circle className="tree-dot" cx={px} cy={py} r={3.5} />
              <text
                className="tree-tip-name"
                x={px + 12}
                y={nameOf(row.node) ? py - 2 : py + 4}
              >
                {nameOf(row.node) || row.node.sci}
              </text>
              {nameOf(row.node) && (
                <text className="tree-tip-sci" x={px + 12} y={py + 13}>
                  {abbreviate(row.node.sci)}
                </text>
              )}
            </g>
          )
        }

        return (
          <g
            key={row.node.id}
            className={`tree-node tree-branch${activeId === row.node.id ? ' is-active' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onNode(row.node)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onNode(row.node)
              }
            }}
          >
            <circle className="tree-hit" cx={px} cy={py} r={13} />
            <circle className="tree-dot" cx={px} cy={py} r={4} />
            {(() => {
              const focus = focusFor(row.node)
              const label = row.node.label || focus?.name
              if (!label) return null
              return (
                <text
                  className={`tree-clade${focus ? ' is-link' : ''}`}
                  x={px + 8}
                  y={py - 9}
                  onClick={
                    focus
                      ? (event) => {
                          event.stopPropagation()
                          onOpen(focus, row.node)
                        }
                      : undefined
                  }
                >
                  {label}
                  {focus && ' ▸'}
                </text>
              )
            })()}
          </g>
        )
      })}
    </svg>
  )
}

// The same tree, minus the geometry. Narrow screens have no room for a column
// of tips 500px to the right of the root, and indentation carries the nesting
// on its own.
function IndentedTree({ node, collapsed, onNode, activeId, nameOf, focusFor, depth = 0 }) {
  if (!node.children.length) {
    return (
      <li className="tree-list-tip">
        <span className="tree-list-common">{nameOf(node) || node.sci}</span>
        {nameOf(node) && <span className="tree-list-sci">{abbreviate(node.sci)}</span>}
      </li>
    )
  }

  const folded = collapsed.has(node.id)
  const focus = focusFor(node)
  return (
    <li>
      <button
        type="button"
        className={`tree-list-clade${activeId === node.id ? ' is-active' : ''}`}
        onClick={() => onNode(node)}
      >
        <span className="tree-list-caret">{folded ? '▸' : '▾'}</span>
        {node.label || foldedLabel(node)}
        <span className="tree-count">{node.leafCount}</span>
        {focus && (
          <Link className="tree-list-open" to={`/tree/${focus.id}`} onClick={(e) => e.stopPropagation()}>
            {focus.name} ▸
          </Link>
        )}
      </button>
      {!folded && (
        <ul>
          {node.children.map((child) => (
            <IndentedTree
              key={child.id}
              node={child}
              collapsed={collapsed}
              onNode={onNode}
              activeId={activeId}
              nameOf={nameOf}
              focusFor={focusFor}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

// One species in the editor list. Names are edited in place and saved when the
// field loses focus, so filling in twenty-five Chinese names is tab, type, tab.
function SpeciesRow({ species, busy, onRename, onRemove }) {
  const [common, setCommon] = useState(species.common ?? '')
  const [zh, setZh] = useState(species.zh ?? '')

  const commit = () => {
    const next = { ...species, common: common.trim(), zh: zh.trim() }
    if (next.common === (species.common ?? '') && next.zh === (species.zh ?? '')) return
    onRename(next)
  }
  const blurOnEnter = (event) => {
    if (event.key === 'Enter') event.currentTarget.blur()
  }

  return (
    <li>
      <em>{species.sci}</em>
      <input
        value={common}
        onChange={(event) => setCommon(event.target.value)}
        onBlur={commit}
        onKeyDown={blurOnEnter}
        placeholder="Common name"
        aria-label={`English name for ${species.sci}`}
      />
      <input
        lang="zh-CN"
        value={zh}
        onChange={(event) => setZh(event.target.value)}
        onBlur={commit}
        onKeyDown={blurOnEnter}
        placeholder="中文名"
        aria-label={`Chinese name for ${species.sci}`}
      />
      <button
        type="button"
        disabled={busy}
        aria-label={`Remove ${species.sci}`}
        onClick={onRemove}
      >
        ×
      </button>
    </li>
  )
}

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// A focus tree's names, edited in place and saved on blur, like a species row.
function TreeNames({ data, busy, onSave }) {
  const [name, setName] = useState(data.name ?? '')
  const [zh, setZh] = useState(data.zh ?? '')
  const commit = () => {
    if (name.trim() === (data.name ?? '') && zh.trim() === (data.zh ?? '')) return
    onSave({ ...data, name: name.trim() || data.root.name, zh: zh.trim() })
  }
  const blurOnEnter = (event) => {
    if (event.key === 'Enter') event.currentTarget.blur()
  }
  return (
    <div className="tree-row">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={commit}
        onKeyDown={blurOnEnter}
        placeholder="Name"
        aria-label="Tree name"
        disabled={busy}
      />
      <input
        lang="zh-CN"
        value={zh}
        onChange={(event) => setZh(event.target.value)}
        onBlur={commit}
        onKeyDown={blurOnEnter}
        placeholder="中文名"
        aria-label="Chinese tree name"
        disabled={busy}
      />
    </div>
  )
}

export default function Tree() {
  const { lang, t } = useLanguage()
  const { id = 'global' } = useParams()
  const navigate = useNavigate()
  const { docs, focusTrees, canEdit, save, remove, renameEverywhere } = useTrees()
  const narrow = useNarrow()

  const data = docs[id]
  const isFocus = id !== 'global'
  const treeName = (d) => (lang === 'zh' && d?.zh) || d?.name || ''
  const title = isFocus ? treeName(data) || t('tree.title') : t('tree.title')
  useDocumentTitle(`${title} · ${t('site.name')}`)

  // Parsing ~4KB of Newick is cheap, but it runs on every render otherwise.
  const tree = useMemo(
    () => (data ? buildTree(data.newick, { species: data.species, clades: data.clades }) : null),
    [data],
  )

  // A split on this tree that has a focus tree of its own — Primates on the
  // main tree, say — gets a link instead of just a label. The match is on the
  // clade's name, which Open Tree attaches to the split as a candidate.
  const focusFor = (node) => {
    if (isFocus || !node.children?.length) return null
    return (
      focusTrees.find(
        (f) => node.label === f.root.name || node.candidates?.includes(f.root.name),
      ) ?? null
    )
  }

  // Chinese readers get the Chinese name where one has been filled in, and the
  // English one until then — a half-translated tree beats a half-empty one.
  const nameOf = (node) => (lang === 'zh' && node.zh) || node.common || ''
  const canvasRef = useRef(null)
  const available = useWidth(canvasRef)

  const [collapsed, setCollapsed] = useState(() => new Set())
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState(null)
  const [labelDraft, setLabelDraft] = useState('')
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState(null)
  const [pending, setPending] = useState(null)
  const [common, setCommon] = useState('')
  const [zh, setZh] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

  // Leaving edit mode should not leave a label panel hanging open.
  useEffect(() => {
    if (!editing) setSelected(null)
  }, [editing])

  const onNode = (node) => {
    if (editing && canEdit) {
      setSelected(node)
      setLabelDraft(node.label ?? '')
      return
    }
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(node.id)) next.delete(node.id)
      else next.add(node.id)
      return next
    })
  }

  // Every species change re-asks Open Tree for the whole tree. It is one
  // request, it keeps the topology honest, and it means the stored Newick is
  // never a hand-patched version of a real answer.
  const applySpecies = async (species) => {
    setBusy(true)
    setStatus('')
    try {
      let newick = ''
      let dropped = []
      if (species.length >= 2) {
        const result = await inducedNewick(species.map((s) => s.ott))
        newick = result.newick
        dropped = result.dropped
      }
      const kept = species.filter((s) => !dropped.includes(s.ott))
      const rebuilt = buildTree(newick, { species: kept, clades: {} })
      const clades = migrateClades(data.clades, rebuilt)
      await save(id, { ...data, species: kept, newick, clades })

      const lost = Object.keys(data.clades ?? {}).length - Object.keys(clades).length
      setStatus(
        [
          'Saved.',
          dropped.length &&
            `Open Tree has no placement for ${dropped.length} of those yet, so they were left out.`,
          lost > 0 && `${lost} clade label had nothing left to name.`,
        ]
          .filter(Boolean)
          .join(' '),
      )
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  const search = async (event) => {
    event.preventDefault()
    if (!query.trim()) return
    setBusy(true)
    setStatus('')
    setPending(null)
    try {
      const found = await matchSpecies(query.trim())
      setMatches(found)
      if (!found.length) setStatus(`Nothing in Open Tree matches “${query}”.`)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  // Names already given to this species on another tree, so they carry over.
  const known = (ott) => {
    for (const d of Object.values(docs)) {
      const hit = d.species?.find((s) => s.ott === ott)
      if (hit) return hit
    }
    return null
  }

  const addPending = async () => {
    if (!pending) return
    if (data.species.some((s) => s.ott === pending.ott)) {
      setStatus(`${pending.sci} is already on the tree.`)
      return
    }
    // A focus tree is rooted in a clade; only members get in.
    if (isFocus) {
      setBusy(true)
      try {
        const lineage = await lineageOf(pending.ott)
        if (!lineage.includes(data.root.ott)) {
          setStatus(`${pending.sci} is not within ${data.root.name}.`)
          return
        }
      } catch (error) {
        setStatus(error.message)
        return
      } finally {
        setBusy(false)
      }
    }
    const prior = known(pending.ott)
    await applySpecies([
      ...data.species,
      {
        ott: pending.ott,
        sci: pending.sci,
        common: common.trim() || prior?.common || '',
        zh: zh.trim() || prior?.zh || '',
      },
    ])
    setQuery('')
    setMatches(null)
    setPending(null)
    setCommon('')
    setZh('')
  }

  // Renaming touches no topology; it is a plain write — to every tree the
  // species is on, so a name lives once.
  const rename = async (next) => {
    setBusy(true)
    try {
      await renameEverywhere(next)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  const [newName, setNewName] = useState('')
  const [newZh, setNewZh] = useState('')
  const [cladeQuery, setCladeQuery] = useState('')
  const [cladeMatches, setCladeMatches] = useState(null)
  const [cladeRoot, setCladeRoot] = useState(null)

  const searchClade = async (event) => {
    event.preventDefault()
    if (!cladeQuery.trim()) return
    setBusy(true)
    setStatus('')
    try {
      const found = await matchClade(cladeQuery.trim())
      setCladeMatches(found)
      if (!found.length) setStatus(`No clade in Open Tree matches “${cladeQuery}”.`)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  // A focus tree starts with whatever the main tree already holds inside the
  // clade; its labels come along because they are keyed by tip set.
  const createTree = async () => {
    if (!cladeRoot) return
    const newId = slug(cladeRoot.name)
    if (docs[newId]) {
      setStatus(`There is already a tree for ${cladeRoot.name}.`)
      return
    }
    setBusy(true)
    setStatus('')
    try {
      const main = docs.global
      const lineages = await Promise.all(main.species.map((s) => lineageOf(s.ott).catch(() => [])))
      const species = main.species.filter((s, i) => lineages[i].includes(cladeRoot.ott))
      const newick = species.length >= 2 ? (await inducedNewick(species.map((s) => s.ott))).newick : ''
      const clades = migrateClades(main.clades, buildTree(newick, { species, clades: {} }))
      await save(newId, {
        name: newName.trim() || cladeRoot.name,
        zh: newZh.trim(),
        root: { ott: cladeRoot.ott, name: cladeRoot.name },
        species,
        newick,
        clades,
      })
      setNewName('')
      setNewZh('')
      setCladeQuery('')
      setCladeMatches(null)
      setCladeRoot(null)
      navigate(`/tree/${newId}`)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  const deleteTree = async () => {
    if (!window.confirm(`Delete the ${data.name} tree? Its species stay on any other tree.`)) return
    setBusy(true)
    try {
      await remove(id)
      navigate('/tree')
    } catch (error) {
      setStatus(error.message)
      setBusy(false)
    }
  }

  const saveLabel = async (value) => {
    if (!selected) return
    const clades = { ...(data.clades ?? {}) }
    if (value.trim()) clades[selected.id] = value.trim()
    else delete clades[selected.id]
    setBusy(true)
    try {
      await save(id, { ...data, clades })
      setSelected(null)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  if (!data) {
    return (
      <section className="page-section tree-page">
        <div className="section-head">
          <h1>{t('tree.title')}</h1>
        </div>
        <p className="tree-empty">
          {t('tree.missing')} <Link to="/tree">← {t('tree.title')}</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="page-section tree-page">
      <div className="section-head">
        <h1>{title}</h1>
      </div>

      {(focusTrees.length > 0 || isFocus) && (
        <nav className="tree-tabs" aria-label={t('tree.title')}>
          <NavLink to="/tree" end>
            {t('tree.all')}
          </NavLink>
          {focusTrees.map((f) => (
            <NavLink key={f.id} to={`/tree/${f.id}`}>
              {treeName(f)}
              {treeName(f) !== f.root.name && <em>{f.root.name}</em>}
            </NavLink>
          ))}
        </nav>
      )}

      {canEdit && (
        <div className="tree-toolbar">
          <button
            type="button"
            className={editing ? 'is-on' : ''}
            onClick={() => setEditing((on) => !on)}
          >
            {editing ? 'Done editing' : 'Edit tree'}
          </button>
          {editing && (
            <span className="tree-hint">
              Clicking a split renames it instead of folding it.
            </span>
          )}
        </div>
      )}

      {!tree && (
        <p className="tree-empty">{t('tree.empty', { n: data.species.length })}</p>
      )}

      {tree && (
        <div ref={canvasRef} className={narrow ? 'tree-list' : 'tree-canvas'}>
          {narrow ? (
            <ul>
              <IndentedTree
                node={tree}
                collapsed={collapsed}
                onNode={onNode}
                activeId={selected?.id}
                nameOf={nameOf}
                focusFor={focusFor}
              />
            </ul>
          ) : (
            available > 0 && (
              <Cladogram
                tree={tree}
                collapsed={collapsed}
                onNode={onNode}
                activeId={selected?.id}
                available={available}
                nameOf={nameOf}
                focusFor={focusFor}
                onOpen={(focus) => navigate(`/tree/${focus.id}`)}
              />
            )
          )}
        </div>
      )}

      {editing && canEdit && (
        <div className="tree-editor">
          {selected && (
            <div className="tree-panel">
              <h2>Name this split</h2>
              <p className="tree-panel-sub">
                {selected.leafCount} species below it. Leave it blank to show no
                label — most splits read better unnamed.
              </p>
              <div className="tree-chips">
                {(selected.candidates ?? []).slice(0, 6).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setLabelDraft(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="tree-row">
                <input
                  value={labelDraft}
                  onChange={(event) => setLabelDraft(event.target.value)}
                  placeholder="Clade name"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => saveLabel(labelDraft)}
                >
                  Save
                </button>
                <button type="button" disabled={busy} onClick={() => saveLabel('')}>
                  Clear
                </button>
                <button type="button" onClick={() => setSelected(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="tree-panel">
            <h2>Add a species</h2>
            <form className="tree-row" onSubmit={search}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Scientific or common name"
              />
              <button type="submit" disabled={busy}>
                Search
              </button>
            </form>

            {matches?.length > 0 && (
              <ul className="tree-matches">
                {matches.map((match) => (
                  <li key={match.ott}>
                    <button
                      type="button"
                      className={pending?.ott === match.ott ? 'is-on' : ''}
                      onClick={() => setPending(match)}
                    >
                      <em>{match.sci}</em>
                      <span>
                        {match.rank}
                        {match.approximate ? ' · near match' : ''}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {pending && (
              <div className="tree-row">
                <input
                  value={common}
                  onChange={(event) => setCommon(event.target.value)}
                  placeholder={`Common name for ${pending.sci}`}
                />
                <input
                  lang="zh-CN"
                  value={zh}
                  onChange={(event) => setZh(event.target.value)}
                  placeholder="中文名"
                />
                <button type="button" disabled={busy} onClick={addPending}>
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="tree-panel">
            <h2>On the tree</h2>
            <ul className="tree-species">
              {data.species.map((species) => (
                <SpeciesRow
                  key={species.ott}
                  species={species}
                  busy={busy}
                  onRename={rename}
                  onRemove={() =>
                    applySpecies(data.species.filter((s) => s.ott !== species.ott))
                  }
                />
              ))}
            </ul>
          </div>

          {!isFocus && (
            <div className="tree-panel">
              <h2>New focus tree</h2>
              <p className="tree-panel-sub">
                Rooted in a clade. It starts with whatever the main tree already
                holds inside that clade, and can take species the main tree does not show.
              </p>
              <form className="tree-row" onSubmit={searchClade}>
                <input
                  value={cladeQuery}
                  onChange={(event) => setCladeQuery(event.target.value)}
                  placeholder="Clade — Primates, Carnivora, Squamata…"
                />
                <button type="submit" disabled={busy}>
                  Search
                </button>
              </form>
              {cladeMatches?.length > 0 && (
                <ul className="tree-matches">
                  {cladeMatches.map((match) => (
                    <li key={match.ott}>
                      <button
                        type="button"
                        className={cladeRoot?.ott === match.ott ? 'is-on' : ''}
                        onClick={() => {
                          setCladeRoot(match)
                          if (!newName) setNewName(match.name)
                        }}
                      >
                        <em>{match.name}</em>
                        <span>{match.rank}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {cladeRoot && (
                <div className="tree-row">
                  <input
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="Name"
                  />
                  <input
                    lang="zh-CN"
                    value={newZh}
                    onChange={(event) => setNewZh(event.target.value)}
                    placeholder="中文名"
                  />
                  <button type="button" disabled={busy} onClick={createTree}>
                    Create
                  </button>
                </div>
              )}
            </div>
          )}

          {isFocus && (
            <div className="tree-panel">
              <h2>This tree</h2>
              <p className="tree-panel-sub">
                Rooted in <em>{data.root.name}</em>. Only species inside it can be added.
                Names save when you leave the field.
              </p>
              <TreeNames
                key={`${data.name}|${data.zh}`}
                data={data}
                busy={busy}
                onSave={(next) => save(id, next).catch((error) => setStatus(error.message))}
              />
              <button type="button" className="tree-danger" disabled={busy} onClick={deleteTree}>
                Delete this tree
              </button>
            </div>
          )}

          {status && <p className="tree-status">{status}</p>}
        </div>
      )}
    </section>
  )
}
