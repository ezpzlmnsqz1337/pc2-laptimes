import { reactive } from 'vue'
import { LaptimeFilterStore, laptimeFilterStore } from './laptimeFilterStore'
import { RealtimeDataStore, realtimeDataStore } from './realtimeDataStore'
import { StatisticsStore, statisticsStore } from './statisticsStore'
import { DataStore, dataStore } from './dataStore'

export interface StoreState {
  laptimeFilterStore: LaptimeFilterStore
  realtimeDataStore: RealtimeDataStore
  statisticsStore: StatisticsStore
  dataStore: DataStore
}

export interface AppStore {
  state: StoreState
}

const state: StoreState = {
  laptimeFilterStore,
  realtimeDataStore,
  statisticsStore,
  dataStore
}

const store: AppStore = reactive({
  state
})

export default store
