import { reactive } from 'vue'
import { DataStore, dataStore } from './dataStore'
import { RealtimeDataStore, realtimeDataStore } from './realtimeDataStore'
import { StatisticsStore, statisticsStore } from './statisticsStore'

export interface StoreState {
  realtimeDataStore: RealtimeDataStore
  statisticsStore: StatisticsStore
  dataStore: DataStore
}

export interface AppStore {
  state: StoreState
}

const state: StoreState = {
  realtimeDataStore,
  statisticsStore,
  dataStore
}

const store: AppStore = reactive({
  state
})

export default store
