import { DataStore } from '@/store/dataStore'
import { LaptimeFilterStore } from '@/store/laptimeFilterStore'
import { RealtimeDataStore } from '@/store/realtimeDataStore'
import { StatisticsStore } from '@/store/statisticsStore'
import store, { AppStore } from '../store/store'
import { App, Plugin } from 'vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: AppStore
    $laptimeFilterStore: LaptimeFilterStore
    $realtimeDataStore: RealtimeDataStore
    $statisticsStore: StatisticsStore
    $dataStore: DataStore
  }
}

declare type StorePluginOptions = any

export const storePlugin: Plugin = {
  install (app: App, options: StorePluginOptions) {
    app.config.globalProperties.$store = store
    app.config.globalProperties.$laptimeFilterStore = store.state.laptimeFilterStore
    app.config.globalProperties.$realtimeDataStore = store.state.realtimeDataStore
    app.config.globalProperties.$statisticsStore = store.state.statisticsStore
    app.config.globalProperties.$dataStore = store.state.dataStore
  }
}
