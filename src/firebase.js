import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import firebaseConfig from '@/firebaseConfig'

// Get a Firestore instance
initializeApp(firebaseConfig)
export const db = getFirestore()
