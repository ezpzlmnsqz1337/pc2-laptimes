import { DataStore } from '@/store/dataStore'
import { RealtimeDataStore } from '@/store/realtimeDataStore'
import { StatisticsStore } from '@/store/statisticsStore'
import { UtilsStore } from '@/store/utilsStore'
import { App, Plugin } from 'vue'
import store, { AppStore } from '../store/store'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: AppStore
    $realtimeDataStore: RealtimeDataStore
    $statisticsStore: StatisticsStore
    $dataStore: DataStore
    $utilsStore: UtilsStore
  }
}

export const storePlugin: Plugin = {
  install (app: App) {
    app.config.globalProperties.$store = store
    app.config.globalProperties.$realtimeDataStore = store.state.realtimeDataStore
    app.config.globalProperties.$statisticsStore = store.state.statisticsStore
    app.config.globalProperties.$dataStore = store.state.dataStore
    app.config.globalProperties.$utilsStore = store.state.utilsStore
  }
}
