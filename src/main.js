import { createApp } from 'vue'
import App from '@/App'
import store from '@/store/index.js'
import PerfectScrollbar from 'vue3-perfect-scrollbar'
import Button from '@/components/ui/Button'
import RadioButtons from '@/components/ui/RadioButtons'
import EditableSelect from '@/components/ui/EditableSelect'
import ButtonType from '@/constants/ButtonType'
import TransmissionType from '@/constants/TransmissionType'
import WeatherType from '@/constants/WeatherType'
import BrakingLine from '@/constants/BrakingLine'
import ControlType from '@/constants/ControlType'
import StartType from '@/constants/StartType'
import ScreenType from '@/constants/ScreenType'
import StatisticsScreenType from '@/constants/StatisticsScreenType'
import Game from '@/constants/Game'
import Distinct from '@/constants/Distinct'
import Modal from '@/components/ui/Modal'
import { debounce } from 'debounce'
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css'
import 'material-icons/iconfont/material-icons.css'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Toaster from '@meforma/vue-toaster'
import '@fortawesome/fontawesome-free/css/all.css'
import RealtimeDataBuilder from './builders/RealtimeDataBuilder'
import LaptimeBuilder from './builders/LaptimeBuilder'
import StatisticsBuilder from './builders/StatisticsBuilder'
import LightsBuilder from './builders/LightsBuilder'
import PulseLoader from 'vue-spinner/src/PulseLoader'

const app = createApp(App)
app.config.globalProperties.ButtonType = ButtonType
app.config.globalProperties.TransmissionType = TransmissionType
app.config.globalProperties.WeatherType = WeatherType
app.config.globalProperties.BrakingLine = BrakingLine
app.config.globalProperties.ControlType = ControlType
app.config.globalProperties.StartType = StartType
app.config.globalProperties.ScreenType = ScreenType
app.config.globalProperties.StatisticsScreenType = StatisticsScreenType
app.config.globalProperties.Game = Game
app.config.globalProperties.Distinct = Distinct
app.config.globalProperties.debounce = debounce
app.config.globalProperties.mapValueInRange = (x, inMin, inMax, outMin, outMax) => (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
app.config.globalProperties.isInRange = (n, min, max) => min <= n && n <= max
app.config.globalProperties.queryParams = new URLSearchParams(window.location.search)

// builders
app.config.globalProperties.$rdb = RealtimeDataBuilder.getInstance()
app.config.globalProperties.$ltb = LaptimeBuilder.getInstance()
app.config.globalProperties.$lb = LightsBuilder.getInstance()
app.config.globalProperties.$sb = StatisticsBuilder.getInstance()
app.config.globalProperties.isAdmin = () => ['localhost:8080', 'malina:3000'].includes(window.location.host)

app.use(store)
app.use(Toaster)
app.use(PerfectScrollbar)
app.component('Button', Button)
app.component('Modal', Modal)
app.component('EditableSelect', EditableSelect)
app.component('RadioButtons', RadioButtons)
app.component('VSelect', vSelect)
app.component('PulseLoader', PulseLoader)
app.mount('#app')
