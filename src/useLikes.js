import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db, isOwner } from './firebase.js'

// Every like on the site lives in one document, keyed `${albumId}:${trackIndex}`.
// One read, one live subscription, no per-track fan-out.
const LIKES_DOC = doc(db, 'likes', 'global')

export function useLikes() {
  const [likes, setLikes] = useState({})
  const [user, setUser] = useState(null)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  useEffect(
    () =>
      onSnapshot(
        LIKES_DOC,
        (snapshot) => setLikes(snapshot.data() ?? {}),
        // Likes are decoration: if Firestore is unreachable, show none rather
        // than breaking the page.
        () => setLikes({}),
      ),
    [],
  )

  const canEdit = isOwner(user)

  const toggle = (albumId, index) => {
    if (!canEdit) return
    const key = `${albumId}:${index}`
    const next = !likes[key]
    setLikes((current) => ({ ...current, [key]: next })) // optimistic
    setDoc(LIKES_DOC, { [key]: next }, { merge: true }).catch(() => {
      setLikes((current) => ({ ...current, [key]: !next }))
    })
  }

  return { likes, canEdit, toggle }
}
