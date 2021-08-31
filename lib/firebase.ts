import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAnalytics, Analytics } from 'firebase/analytics'

let firebaseCredentials: {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

if (typeof window !== undefined) {
  firebaseCredentials = JSON.parse(
    Buffer.from(process.env.NEXT_PUBLIC_FIREBASE_CONFIG, 'base64').toString()
  )
} else {
  firebaseCredentials = JSON.parse(
    window.atob(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
  )
}

let firebaseAnalytics: Analytics | undefined
let firebaseApp: FirebaseApp

if (!getApps.length && typeof window !== 'undefined') {
  firebaseApp = initializeApp(firebaseCredentials)
  firebaseAnalytics = getAnalytics(firebaseApp)
}

export { firebaseApp, firebaseAnalytics }
