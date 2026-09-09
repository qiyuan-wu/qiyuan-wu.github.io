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

  // Several trees, one write. What a species is called and how often it has
  // been observed belong to the species, not to a tree, so both land on every
  // tree the species sits on at once.
  const saveMany = async (updates) => {
    const entries = Object.entries(updates)
    if (!entries.length) return
    const batch = writeBatch(db)
    for (const [id, next] of entries) batch.set(doc(db, 'tree', id), next)
    const previous = docs
    setDocs((current) => ({ ...current, ...updates }))
    try {
      await batch.commit()
    } catch (error) {
      setDocs(previous)
      throw error
    }
  }

  // A species is named once. Renaming it here updates every tree it sits on.
  const renameEverywhere = (species) =>
    saveMany(
      Object.fromEntries(
        Object.entries(docs)
          .filter(([, d]) => d.species?.some((s) => s.ott === species.ott))
          .map(([id, d]) => [
            id,
            {
              ...d,
              // A rename must not clobber what the last iNaturalist sync found.
              species: d.species.map((s) =>
                s.ott === species.ott ? { ...s, ...species } : s,
              ),
            },
          ]),
      ),
    )

  return { docs, focusTrees, canEdit: isOwner(user), save, saveMany, remove, renameEverywhere }
}
