import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db, isOwner } from './firebase.js'
import { SEED } from './tree/seed.js'
import { buildTree } from './tree/newick.js'

// The whole tree is one document: a species list, Open Tree's answer for those
// species, and the curated clade labels. Same shape as likes — public read,
// owner-only write, enforced by the Firestore rule rather than by this file.
const TREE_DOC = doc(db, 'tree', 'global')

export function useTree() {
  const [data, setData] = useState(SEED)
  const [user, setUser] = useState(null)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  useEffect(
    () =>
      onSnapshot(
        TREE_DOC,
        (snapshot) => setData(snapshot.exists() ? snapshot.data() : SEED),
        // If Firestore is unreachable the seed tree is still a real tree, which
        // beats an empty page.
        () => setData(SEED),
      ),
    [],
  )

  // Parsing ~4KB of Newick is cheap, but it runs on every render otherwise.
  const tree = useMemo(
    () => buildTree(data.newick, { species: data.species, clades: data.clades }),
    [data],
  )

  // The document holds only these three fields, so a whole-document write is
  // the honest way to drop a species or clear a label — a merge cannot delete.
  const save = async (next) => {
    const previous = data
    setData(next) // optimistic
    try {
      await setDoc(TREE_DOC, next)
    } catch (error) {
      setData(previous)
      throw error
    }
  }

  return { data, tree, canEdit: isOwner(user), signedIn: Boolean(user), save }
}
