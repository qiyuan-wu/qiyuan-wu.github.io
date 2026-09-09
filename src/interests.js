// The personal side of the site, grouped under one nav entry. Order is the
// order on the Interests page and in the sub-nav.
export const INTERESTS = [
  { to: '/guwen', label: 'nav.guwen' },
  { to: '/albums', label: 'nav.albums' },
  { to: '/games', label: 'nav.games' },
  { to: '/soccer', label: 'nav.soccer' },
  { to: '/tree', label: 'nav.tree' },
  { to: '/projects', label: 'nav.projects' },
]

export function isInterestPath(pathname) {
  return (
    pathname === '/interests' ||
    INTERESTS.some((s) => pathname === s.to || pathname.startsWith(s.to + '/'))
  )
}
