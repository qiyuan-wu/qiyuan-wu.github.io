// iNaturalist, like Open Tree, is asked at edit time only. A sync writes the
// counts into Firestore and an ordinary page load reads Firestore and nothing
// else, so the tree still draws without waiting on anybody's API. The cost is
// that counts are as old as the last sync, which for a page about ancestry is
// the right trade.
const API = 'https://api.inaturalist.org/v1'

async function get(path, params) {
  const query = new URLSearchParams(params)
  const response = await fetch(`${API}${path}?${query}`)
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error ?? `iNaturalist returned ${response.status}`)
  }
  return data
}

// iNaturalist keeps its own taxonomy, so a species is found by name rather than
// by ott id. The two usually agree; where they do not — Open Tree's
// `Canis lupus familiaris` is iNaturalist's `Canis familiaris` — the search
// still finds it, and the name it answers with is stored so the disagreement
// shows up in the editor instead of passing silently.
export async function matchTaxon(sci) {
  const { results = [] } = await get('/taxa', { q: sci, per_page: 10 })
  const hit =
    results.find((r) => r.name.toLowerCase() === sci.toLowerCase()) ??
    results.find((r) => r.rank === 'species') ??
    results[0]
  return hit ? { id: hit.id, name: hit.name } : null
}

// How many observations this user has of each of these taxa. One request covers
// the whole tree. Rows come back as the finest taxon each observation was
// identified to, so a fly agaric logged as *A. muscaria flavivolvata* arrives
// under the variety; walking its ancestry is what folds it back into the
// species we asked about.
export async function countsFor(login, taxonIds) {
  const totals = new Map(taxonIds.map((id) => [id, 0]))
  if (!taxonIds.length) return totals

  const PER_PAGE = 200
  let page = 1
  for (;;) {
    const data = await get('/observations/species_counts', {
      user_login: login,
      taxon_id: taxonIds.join(','),
      per_page: PER_PAGE,
      page,
    })
    for (const row of data.results ?? []) {
      const lineage = new Set([...(row.taxon.ancestor_ids ?? []), row.taxon.id])
      for (const id of lineage) {
        if (totals.has(id)) totals.set(id, totals.get(id) + row.count)
      }
    }
    if (page * PER_PAGE >= data.total_results) break
    page += 1
  }
  return totals
}

// This user's observations of this taxon, on iNaturalist.
export function observationsUrl(login, taxonId) {
  return `https://www.inaturalist.org/observations?user_id=${encodeURIComponent(
    login,
  )}&taxon_id=${taxonId}`
}
