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
export async function inducedNewick(ottIds) {
  const ask = (ids) =>
    post('/tree_of_life/induced_subtree', {
      ott_ids: ids,
      label_format: 'name_and_id',
    })

  try {
    return { newick: (await ask(ottIds)).newick, dropped: [] }
  } catch (error) {
    const unknown = Object.keys(error.data?.unknown ?? {}).map((key) =>
      Number(key.replace(/^ott/, '')),
    )
    if (!unknown.length) throw error
    const kept = ottIds.filter((id) => !unknown.includes(id))
    if (kept.length < 2) throw error
    return { newick: (await ask(kept)).newick, dropped: unknown }
  }
}
