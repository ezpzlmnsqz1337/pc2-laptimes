import App from '@/App.vue'
import Button from '@/components/ui/Button.vue'
import EditableSelect from '@/components/ui/EditableSelect.vue'
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
import LaptimeBuilder from './builders/LaptimeBuilder'
import LightsBuilder from './builders/LightsBuilder'
import RealtimeDataBuilder from './builders/RealtimeDataBuilder'
import StatisticsBuilder from './builders/StatisticsBuilder'
import { WebsocketState } from './constants/WebsocketState'
import { storePlugin } from './plugins/store-plugin'
import './registerServiceWorker'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $rdb: RealtimeDataBuilder
    $ltb: LaptimeBuilder
    $lb: LightsBuilder
    $sb: StatisticsBuilder
    queryParams: URLSearchParams
    isLocal(): boolean
    mapValueInRange(x: number, inMin: number, inMax: number, outMin: number, outMax: number): number
    isInRange(n: number, min: number, max: number): boolean
    $toast: any
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
app.config.globalProperties.mapValueInRange = (x: number, inMin: number, inMax: number, outMin: number, outMax: number) => (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
app.config.globalProperties.isInRange = (n: number, min: number, max: number) => min <= n && n <= max
app.config.globalProperties.queryParams = new URLSearchParams(window.location.search)

// builders
app.config.globalProperties.$rdb = RealtimeDataBuilder.getInstance()
app.config.globalProperties.$ltb = LaptimeBuilder.getInstance()
app.config.globalProperties.$lb = LightsBuilder.getInstance()
app.config.globalProperties.$sb = StatisticsBuilder.getInstance()
app.config.globalProperties.isLocal = () => ['localhost:8080', 'malina:3000'].includes(window.location.host)

app.use(storePlugin)
app.use(Toaster)
app.use(PerfectScrollbar)
// eslint-disable-next-line vue/multi-word-component-names
app.component('Button', Button)
// eslint-disable-next-line vue/multi-word-component-names
app.component('Modal', Modal)
app.component('EditableSelect', EditableSelect)
app.component('RadioButtons', RadioButtons)
app.component('VSelect', vSelect)
app.component('PulseLoader', PulseLoader)
app.component('DatePicker', Datepicker)
app.mount('#app')
