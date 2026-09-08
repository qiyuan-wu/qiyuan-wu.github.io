import { useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db, isOwner } from '../firebase.js'
import { useDocumentTitle } from '../useDocumentTitle.js'

// Nothing links here; it's the one place the site asks anyone to sign in.
export default function Admin() {
  useDocumentTitle('Admin · Qiyuan Wu')
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  const signIn = () =>
    signInWithPopup(auth, new GoogleAuthProvider()).catch((error) =>
      setStatus(error.message),
    )

  // One-off: the likes that lived in this browser before Firestore existed.
  const importLocalLikes = async () => {
    let local = {}
    try {
      local = JSON.parse(localStorage.getItem('qw-liked-album-tracks')) ?? {}
    } catch {
      local = {}
    }
    const liked = Object.fromEntries(
      Object.entries(local).filter(([, value]) => value),
    )
    if (!Object.keys(liked).length) {
      setStatus('No likes stored in this browser.')
      return
    }
    try {
      await setDoc(doc(db, 'likes', 'global'), liked, { merge: true })
      setStatus(`Imported ${Object.keys(liked).length} likes.`)
    } catch (error) {
      setStatus(error.message)
    }
  }

  return (
    <section className="page-section admin-page">
      <h1>Admin</h1>

      {!user && (
        <>
          <p>Sign in to edit likes. Everyone else sees them read-only.</p>
          <button type="button" onClick={signIn}>
            Sign in with Google
          </button>
        </>
      )}

      {user && (
        <>
          <p>
            Signed in as <strong>{user.email}</strong>
            {isOwner(user) ? '' : ' — not the owner, edits will be rejected.'}
          </p>
          <p>
            UID: <code>{user.uid}</code>
          </p>
          <p className="admin-actions">
            <button type="button" onClick={importLocalLikes}>
              Import likes from this device
            </button>
            <button type="button" onClick={() => signOut(auth)}>
              Sign out
            </button>
          </p>
        </>
      )}

      {status && <p className="admin-status">{status}</p>}
    </section>
  )
}
