import App from '@/App.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import RadioButtons from '@/components/ui/RadioButtons.vue'
import { BrakingLine } from '@/constants/BrakingLine'
import { ButtonType } from '@/constants/ButtonType'
import { ControlType } from '@/constants/ControlType'
import { Distinct } from '@/constants/Distinct'
import { Game } from '@/constants/Game'
import { ScreenType } from '@/constants/ScreenType'
import { StartType } from '@/constants/StartType'
import { StatisticsScreenType } from '@/constants/StatisticsScreenType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import '@fortawesome/fontawesome-free/css/all.css'
import Toaster from '@meforma/vue-toaster'
import { debounce } from 'debounce'
import 'material-icons/iconfont/material-icons.css'
import { createApp } from 'vue'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import PulseLoader from 'vue-spinner/src/PulseLoader'
import Datepicker from 'vue3-datepicker'
import PerfectScrollbar from 'vue3-perfect-scrollbar'
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css'
import { Car } from './assets/db/cars'
import { Track } from './assets/db/tracks'
import LaptimeBuilder from './builders/LaptimeBuilder'
import LightsBuilder from './builders/LightsBuilder'
import RealtimeDataBuilder from './builders/RealtimeDataBuilder'
import StatisticsBuilder, { Driver } from './builders/StatisticsBuilder'
import { WebsocketState } from './constants/WebsocketState'
import { storePlugin } from './plugins/store-plugin'
import './registerServiceWorker'

export interface VueToasterOptions {
  message?: string // -- Message text/html (required)
  type?: string // default One of success, info, warning, error, default
  position?: string // bottom-right One of top, bottom, top-right, bottom-right,top-left, bottom-left
  duration?: number | false // 4000 Visibility duration in milliseconds or false that disables duration
  dismissible?: boolean // true Allow user close by clicking
  onClick?: Function // -- Do something when user clicks
  onClose?: Function // -- Do something after toast gets dismissed
  queue?: boolean // false Wait for existing to close before showing new
  maxToasts?: number | false // false Defines the max of toasts showed in simultaneous
  pauseOnHover?: boolean // true Pause the timer when mouse on over a toast
  useDefaultCss?: boolean // true User default css styles
}

export type VueToasterFn = (message: string, options?: VueToasterOptions) => void

export interface VueToaster {
  show: VueToasterFn
  success: VueToasterFn
  error: VueToasterFn
  warning: VueToasterFn
  info: VueToasterFn
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $rdb: RealtimeDataBuilder
    $ltb: LaptimeBuilder
    $lb: LightsBuilder
    $sb: StatisticsBuilder
    queryParams: URLSearchParams
    authorize(pass: string): boolean
    isLocal(): boolean
    $toast: VueToaster
    // types
    ButtonType: typeof ButtonType
    TransmissionType: typeof TransmissionType
    WeatherType: typeof WeatherType
    BrakingLine: typeof BrakingLine
    ControlType: typeof ControlType
    StartType: typeof StartType
    ScreenType: typeof ScreenType
    WebsocketState: typeof WebsocketState
    StatisticsScreenType: typeof StatisticsScreenType
    Game: typeof Game
    Track: Track
    Car: Car
    Driver: Driver
    Distinct: typeof Distinct
    debounce: typeof debounce

  }
}

const app = createApp(App)
app.config.globalProperties.ButtonType = ButtonType
app.config.globalProperties.TransmissionType = TransmissionType
app.config.globalProperties.WeatherType = WeatherType
app.config.globalProperties.BrakingLine = BrakingLine
app.config.globalProperties.ControlType = ControlType
app.config.globalProperties.StartType = StartType
app.config.globalProperties.ScreenType = ScreenType
app.config.globalProperties.WebsocketState = WebsocketState
app.config.globalProperties.StatisticsScreenType = StatisticsScreenType
app.config.globalProperties.Game = Game
app.config.globalProperties.Distinct = Distinct
app.config.globalProperties.debounce = debounce
app.config.globalProperties.queryParams = new URLSearchParams(window.location.search)

// builders
app.config.globalProperties.$rdb = RealtimeDataBuilder.getInstance()
app.config.globalProperties.$ltb = LaptimeBuilder.getInstance()
app.config.globalProperties.$lb = LightsBuilder.getInstance()
app.config.globalProperties.$sb = StatisticsBuilder.getInstance()
app.config.globalProperties.isLocal = () => ['localhost:8080', 'pc2laptimes.homelab.net'].includes(window.location.host)
app.config.globalProperties.authorize = (pass: string) => pass === '3f83e9ad5be63bd5bf2fd009fffe6b7dd4066243975bc962edc37459c17e65b9'

app.use(storePlugin)
app.use(Toaster)
app.use(PerfectScrollbar)
// eslint-disable-next-line vue/multi-word-component-names
app.component('Button', Button)
// eslint-disable-next-line vue/multi-word-component-names
app.component('Modal', Modal)
app.component('RadioButtons', RadioButtons)
app.component('VSelect', vSelect)
app.component('PulseLoader', PulseLoader)
app.component('DatePicker', Datepicker)
app.mount('#app')
