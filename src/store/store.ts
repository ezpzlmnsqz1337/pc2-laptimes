import { enableIndexedDbPersistence } from 'firebase/firestore'
import { reactive } from 'vue'
import { db } from '@/firebase'
import { DataStore, dataStore } from './dataStore'
import { RealtimeDataStore, realtimeDataStore } from './realtimeDataStore'
import { StatisticsStore, statisticsStore } from './statisticsStore'
import { UtilsStore, utilsStore } from './utilsStore'

enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Unable to activate local persistance, failed-precondition')
    } else if (err.code === 'unimplemented') {
      console.log('Unable to activate local persistance, unidentified browser')
    }
  })

export interface StoreState {
  realtimeDataStore: RealtimeDataStore
  statisticsStore: StatisticsStore
  dataStore: DataStore
  utilsStore: UtilsStore
}

export interface AppStore {
  state: StoreState
}

const state: StoreState = {
  realtimeDataStore,
  statisticsStore,
  dataStore,
  utilsStore
}

const store: AppStore = reactive({
  state
})

export default store
