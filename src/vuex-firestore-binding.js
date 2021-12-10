import { onSnapshot } from 'firebase/firestore'

const subs = []

export const unsubscribeAll = () => {
  subs.forEach(x => x.unsubscribe())
}

export const unsubscribe = key => {
  const index = subs.findIndex(x => x.key === key)
  if (index === -1) return
  subs.at(index).unsubscribe()
  subs.splice(index, 1)
}

export const bindFirestoreCollection = (commit, key, collectionRef) => {
  unsubscribe(key)
  commit('clearFirestoreCollection', { key })
  const unsub = onSnapshot(collectionRef,
    snapshot => snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        commit('addFirestoreDocument', { key, data: change.doc.data() })
      }
      if (change.type === 'modified') {
        commit('modifyFirestoreDocument', { key, data: change.doc.data() })
      }
      if (change.type === 'removed') {
        commit('removeFirestoreDocument', { key, data: change.doc.data() })
      }
    })
  )
  subs.push({ key, unsubscribe: unsub })
}

export const vuexMutations = {
  clearFirestoreCollection (state, { key }) {
    state[key].splice(0)
  },
  addFirestoreDocument (state, { key, data }) {
    state[key].push(data)
  },
  modifyFirestoreDocument (state, { key, data }) {
    const index = state[key].findIndex(x => x.uid === data.uid)
    state[key].splice(index, 1, data)
  },
  removeFirestoreDocument (state, { key, data }) {
    const index = state[key].findIndex(x => x.uid === data.uid)
    state[key].splice(index, 1)
  }
}
