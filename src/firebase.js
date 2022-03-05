import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import firebaseConfig from '@/firebaseConfig'

// Get a Firestore instance
initializeApp(firebaseConfig)
export const db = getFirestore()
connectFirestoreEmulator(db, 'localhost', 9080)
