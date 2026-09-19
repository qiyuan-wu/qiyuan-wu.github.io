import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db, isOwner } from './firebase.js'

// The catalog is static (public/catalog.json); what changes is my relation
// to it. One Firestore document, `courses/plan`:
//   status: { [courseKey]: 'want' | 'taking' | 'done' | 'skip' }
//   added:  { [trackId]: [{ key, why }] }   courses put on a track from the browser
//   removed: [courseKey]                    curated courses taken off
//   schedule: { [termId]: [partId] }        the year planner; termId is "2026-FA"
// Public read, owner-only write, like everything else on the site.
const EMPTY = { status: {}, added: {}, removed: [], schedule: {} }

export const STATUSES = ['want', 'taking', 'done', 'skip']

export function useCourses() {
  const [catalog, setCatalog] = useState(null)
  const [plan, setPlan] = useState(EMPTY)
  const [user, setUser] = useState(null)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  useEffect(() => {
    fetch('/catalog.json')
      .then((r) => r.json())
      .then((d) => setCatalog(d))
      .catch(() => setCatalog({ current: '', courses: [] }))
  }, [])

  useEffect(
    () =>
      onSnapshot(
        doc(db, 'courses', 'plan'),
        (snap) => setPlan({ ...EMPTY, ...(snap.data() ?? {}) }),
        () => setPlan(EMPTY),
      ),
    [],
  )

  const save = async (next) => {
    const previous = plan
    setPlan(next) // optimistic
    try {
      await setDoc(doc(db, 'courses', 'plan'), next)
    } catch (error) {
      setPlan(previous)
      throw error
    }
  }

  const setStatus = (key, status) => {
    const next = { ...plan.status }
    if (status) next[key] = status
    else delete next[key]
    return save({ ...plan, status: next })
  }

  const addToTrack = (trackId, key, why = '') =>
    save({
      ...plan,
      removed: plan.removed.filter((k) => k !== key),
      added: { ...plan.added, [trackId]: [...(plan.added[trackId] ?? []), { key, why }] },
    })

  const removeFromTrack = (trackId, key) => {
    const list = plan.added[trackId] ?? []
    if (list.some((c) => c.key === key))
      return save({ ...plan, added: { ...plan.added, [trackId]: list.filter((c) => c.key !== key) } })
    return save({ ...plan, removed: [...new Set([...plan.removed, key])] })
  }

  const setTerm = (termId, parts) =>
    save({ ...plan, schedule: { ...plan.schedule, [termId]: parts } })

  return {
    catalog,
    plan,
    canEdit: isOwner(user),
    setStatus,
    addToTrack,
    removeFromTrack,
    setTerm,
  }
}
