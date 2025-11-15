import { reactive } from 'vue'
import { DataStore, dataStore } from './dataStore'
import { RealtimeDataStore, realtimeDataStore } from './realtimeDataStore'
import { StatisticsStore, statisticsStore } from './statisticsStore'
import { UtilsStore, utilsStore } from './utilsStore'

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
