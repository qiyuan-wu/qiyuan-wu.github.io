import { useEffect, useMemo, useRef, useState } from 'react'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { useLanguage } from '../i18n.jsx'
import { useTree } from '../useTree.js'
import { buildTree, migrateClades } from '../tree/newick.js'
import { inducedNewick, matchSpecies } from '../tree/opentree.js'

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

function Cladogram({ tree, collapsed, onNode, activeId, available, nameOf }) {
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
            {row.node.label && (
              <text className="tree-clade" x={px + 8} y={py - 9}>
                {row.node.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// The same tree, minus the geometry. Narrow screens have no room for a column
// of tips 500px to the right of the root, and indentation carries the nesting
// on its own.
function IndentedTree({ node, collapsed, onNode, activeId, nameOf, depth = 0 }) {
  if (!node.children.length) {
    return (
      <li className="tree-list-tip">
        <span className="tree-list-common">{nameOf(node) || node.sci}</span>
        {nameOf(node) && <span className="tree-list-sci">{abbreviate(node.sci)}</span>}
      </li>
    )
  }

  const folded = collapsed.has(node.id)
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

export default function Tree() {
  const { lang, t } = useLanguage()
  useDocumentTitle(`${t('tree.title')} · ${t('site.name')}`)
  const { data, tree, canEdit, save } = useTree()
  const narrow = useNarrow()

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
      await save({ species: kept, newick, clades })

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

  const addPending = async () => {
    if (!pending) return
    if (data.species.some((s) => s.ott === pending.ott)) {
      setStatus(`${pending.sci} is already on the tree.`)
      return
    }
    await applySpecies([
      ...data.species,
      { ott: pending.ott, sci: pending.sci, common: common.trim(), zh: zh.trim() },
    ])
    setQuery('')
    setMatches(null)
    setPending(null)
    setCommon('')
    setZh('')
  }

  // Renaming touches no topology, so it is a plain document write.
  const rename = async (next) => {
    setBusy(true)
    try {
      await save({
        ...data,
        species: data.species.map((s) => (s.ott === next.ott ? next : s)),
      })
    } catch (error) {
      setStatus(error.message)
    } finally {
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
      await save({ ...data, clades })
      setSelected(null)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="page-section tree-page">
      <div className="section-head">
        <h1>{t('tree.title')}</h1>
      </div>

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

          {status && <p className="tree-status">{status}</p>}
        </div>
      )}
    </section>
  )
}
