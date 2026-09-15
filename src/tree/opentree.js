// Open Tree of Life is asked at edit time only. What gets stored is its answer,
// so ordinary page loads read Firestore and nothing else — no network call on
// the critical path, and the tree renders identically every time.
const API = 'https://api.opentreeoflife.org/v3'

async function post(path, body) {
  const response = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.message ?? `Open Tree returned ${response.status}`)
    error.data = data
    throw error
  }
  return data
}

// Resolve a typed name to real taxa. Approximate matching is on so a small
// misspelling still finds the animal instead of returning nothing.
export async function matchSpecies(query) {
  const data = await post('/tnrs/match_names', {
    names: [query],
    do_approximate_matching: true,
  })
  return (data.results?.[0]?.matches ?? []).slice(0, 6).map((match) => ({
    ott: match.taxon.ott_id,
    sci: match.taxon.name,
    rank: match.taxon.rank ?? '',
    approximate: match.is_approximate_match,
  }))
}

// The tree containing exactly these tips and nothing else. An ott id the
// synthetic tree has never heard of fails the whole request, so drop those and
// ask again rather than leaving the page with no tree at all.
//
// A taxon Open Tree does not consider a natural group — the genus Taraxacum,
// say — comes back "broken": it is stood in for by its members' common
// ancestor, and that tip is labelled `mrcaott320ott27859` rather than
// `Taraxacum_ott524978`. The page keys tips by ott id, so such a tip would
// draw blank. Relabel it with the id that was asked for. If that ancestor is
// not a tip at all — because another tip on the tree sits inside it — the
// taxon has nowhere to be drawn, and counts as dropped.
export async function inducedNewick(ottIds) {
  const ask = async (ids) => {
    const data = await post('/tree_of_life/induced_subtree', {
      ott_ids: ids,
      label_format: 'name_and_id',
    })
    let newick = data.newick
    const dropped = []
    for (const [key, standIn] of Object.entries(data.broken ?? {})) {
      const ott = Number(key.replace(/^ott/, ''))
      const leaf = new RegExp(`(?<=[(,])${standIn}(?=[,)])`)
      if (leaf.test(newick)) newick = newick.replace(leaf, `broken_ott${ott}`)
      else dropped.push(ott)
    }
    return { newick, dropped }
  }

  try {
    return await ask(ottIds)
  } catch (error) {
    const unknown = Object.keys(error.data?.unknown ?? {}).map((key) =>
      Number(key.replace(/^ott/, '')),
    )
    if (!unknown.length) throw error
    const kept = ottIds.filter((id) => !unknown.includes(id))
    if (kept.length < 2) throw error
    const result = await ask(kept)
    return { ...result, dropped: [...unknown, ...result.dropped] }
  }
}

// A clade to root a focus tree in: anything above species rank.
export async function matchClade(query) {
  const data = await post('/tnrs/match_names', { names: [query], do_approximate_matching: true })
  return (data.results?.[0]?.matches ?? [])
    .filter((m) => !['species', 'subspecies', 'variety', 'form'].includes(m.taxon.rank))
    .slice(0, 6)
    .map((m) => ({ ott: m.taxon.ott_id, name: m.taxon.name, rank: m.taxon.rank ?? '' }))
}

// Every taxon above this one, root-most last — the test for "is this a primate".
export async function lineageOf(ott) {
  const data = await post('/taxonomy/taxon_info', { ott_id: ott, include_lineage: true })
  return [data.ott_id, ...(data.lineage ?? []).map((l) => l.ott_id)]
}
