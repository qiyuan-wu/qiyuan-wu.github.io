import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore'
import { auth, db, isOwner } from './firebase.js'
import { SEED } from './tree/seed.js'

// Every tree is one document in the `tree` collection. `global` is the main
// tree; any other document is a focus tree rooted in a clade — Primates, say —
// with its own species list, which may hold species the main tree never shows.
// One subscription covers them all. Public read, owner-only write, enforced by
// the Firestore rule.
export function useTrees() {
  const [docs, setDocs] = useState({ global: SEED })
  const [user, setUser] = useState(null)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  useEffect(
    () =>
      onSnapshot(
        collection(db, 'tree'),
        (snapshot) => {
          const next = {}
          snapshot.forEach((d) => {
            next[d.id] = d.data()
          })
          if (!next.global) next.global = SEED
          setDocs(next)
        },
        // Unreachable Firestore still leaves the seed tree, which beats nothing.
        () => setDocs({ global: SEED }),
      ),
    [],
  )

  const focusTrees = useMemo(
    () =>
      Object.entries(docs)
        .filter(([id, d]) => id !== 'global' && d.root)
        .map(([id, d]) => ({ id, ...d }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [docs],
  )

  // Whole-document writes: a merge cannot delete a species or clear a label.
  const save = async (id, next) => {
    const previous = docs[id]
    setDocs((current) => ({ ...current, [id]: next })) // optimistic
    try {
      await setDoc(doc(db, 'tree', id), next)
    } catch (error) {
      setDocs((current) => ({ ...current, [id]: previous }))
      throw error
    }
  }

  const remove = async (id) => {
    await deleteDoc(doc(db, 'tree', id))
    setDocs((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  // A species is named once. Renaming it here updates every tree it sits on.
  const renameEverywhere = async (species) => {
    const batch = writeBatch(db)
    const next = {}
    for (const [id, d] of Object.entries(docs)) {
      if (!d.species?.some((s) => s.ott === species.ott)) continue
      next[id] = { ...d, species: d.species.map((s) => (s.ott === species.ott ? species : s)) }
      batch.set(doc(db, 'tree', id), next[id])
    }
    const previous = docs
    setDocs((current) => ({ ...current, ...next }))
    try {
      await batch.commit()
    } catch (error) {
      setDocs(previous)
      throw error
    }
  }

  return { docs, focusTrees, canEdit: isOwner(user), save, remove, renameEverywhere }
}
