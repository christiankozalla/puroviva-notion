import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import {
  initializeAnalytics,
  setAnalyticsCollectionEnabled,
  Analytics,
  AnalyticsSettings
} from 'firebase/analytics'

let firebaseCredentials: {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

if (typeof window === 'undefined') {
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

const analyticsSettings: AnalyticsSettings = {
  config: {
    send_page_view: true
  }
}

if (!getApps.length && typeof window !== 'undefined') {
  firebaseApp = initializeApp(firebaseCredentials)
  firebaseAnalytics = initializeAnalytics(firebaseApp, analyticsSettings)
  setAnalyticsCollectionEnabled(firebaseAnalytics, false)
}

export { firebaseApp, firebaseAnalytics }
