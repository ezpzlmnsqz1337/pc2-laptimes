import { db } from '@/firebase'
import { doc, updateDoc } from 'firebase/firestore'

export interface UtilsStore {
  linkCarToGameId (carId: string, gameId: string) :void
  linkTrackToGameId (trackId: string, gameId: string) :void
  setCarImage (carId: string, imageUrl: string) :void
}

export const utilsStore: UtilsStore = {
  async linkCarToGameId (carId: string, gameId: string) {
    if (!carId || !gameId) return
    const docRef = doc(db, 'cars', carId)
    console.log('Link: ', carId, docRef)
    await updateDoc(docRef, { gameId })
  },
  async linkTrackToGameId (trackId: string, gameId: string) {
    if (!trackId || !gameId) return
    const docRef = doc(db, 'tracks', trackId)
    console.log('Link: ', trackId, docRef)
    await updateDoc(docRef, { gameId })
  },
  async setCarImage (carId: string, imageUrl: string) {
    if (!carId || !imageUrl) return
    const docRef = doc(db, 'cars', carId)
    await updateDoc(docRef, { imageUrl })
  }
}
