import { db } from '@/firebase'
import { doc, updateDoc } from 'firebase/firestore'

export interface UtilsStore {
  setCarImage (carId: string, imageUrl: string) :void
}

export const utilsStore: UtilsStore = {
  async setCarImage (carId: string, imageUrl: string) {
    if (!carId || !imageUrl) return
    const docRef = doc(db, 'cars', carId)
    await updateDoc(docRef, { imageUrl })
  }
}
