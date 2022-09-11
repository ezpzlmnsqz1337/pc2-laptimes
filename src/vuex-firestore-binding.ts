import { CollectionReference, onSnapshot } from 'firebase/firestore'

export interface FirestoreSubscription {
  key: string
  unsubscribe(): void
}

const subs: FirestoreSubscription[] = []

export const unsubscribeAll = () => {
  subs.forEach(x => x.unsubscribe())
  subs.splice(0)
}

export const unsubscribe = (key: string) => {
  const index = subs.findIndex(x => x.key === key)
  if (index === -1) return
  subs[index].unsubscribe()
  subs.splice(index, 1)
}

const clearFirestoreCollection = (state: any, { key }: any) => {
  state[key].splice(0)
}

const addFirestoreDocument = (state: any, { key, data }: any) => {
  state[key].push(data)
}

const modifyFirestoreDocument = (state: any, { key, data }: any) => {
  const index = state[key].findIndex((x: any) => x.uid === data.uid)
  state[key].splice(index, 1, data)
}

const removeFirestoreDocument = (state: any, { key, data }: any) => {
  const index = state[key].findIndex((x: any) => x.uid === data.uid)
  state[key].splice(index, 1)
}

export const bindFirestoreCollection = (state: any, key: string, collectionRef: CollectionReference<any>) => {
  unsubscribe(key)
  clearFirestoreCollection(state, { key })
  const unsub = onSnapshot(collectionRef,
    snapshot => snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        addFirestoreDocument(state, { key, data: change.doc.data() })
      }
      if (change.type === 'modified') {
        modifyFirestoreDocument(state, { key, data: change.doc.data() })
      }
      if (change.type === 'removed') {
        removeFirestoreDocument(state, { key, data: change.doc.data() })
      }
    })
  )
  subs.push({ key, unsubscribe: unsub })
}
