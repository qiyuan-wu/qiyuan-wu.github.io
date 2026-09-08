// One Firebase project backs the whole site; likes are just the first collection.
// This config is not a secret — it identifies the project, it doesn't authorize
// anything. Security lives in the Firestore rules (public read, owner-only write).
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCW9jsEvhfITS374gi98KTeBZzWW89gw5M',
  authDomain: 'qiyuan-site.firebaseapp.com',
  projectId: 'qiyuan-site',
  storageBucket: 'qiyuan-site.firebasestorage.app',
  messagingSenderId: '788369323838',
  appId: '1:788369323838:web:9f31ed50df504cd5bd9e6f',
}

// Mirrors the Firestore rule. This only tightens the UI; the rule on the
// server is what actually keeps other people out.
export const OWNER_UID = 'WA4dhJRtX5dFdXX5Ay0CLjmIeuu2'

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export function isOwner(user) {
  if (!user) return false
  return OWNER_UID ? user.uid === OWNER_UID : true
}
