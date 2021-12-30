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
import Modal from '@/components/ui/Modal'
import { debounce } from 'debounce'
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css'
import 'material-icons/iconfont/material-icons.css'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Toaster from '@meforma/vue-toaster'

const app = createApp(App)
app.config.globalProperties.ButtonType = ButtonType
app.config.globalProperties.TransmissionType = TransmissionType
app.config.globalProperties.WeatherType = WeatherType
app.config.globalProperties.BrakingLine = BrakingLine
app.config.globalProperties.ControlType = ControlType
app.config.globalProperties.StartType = StartType
app.config.globalProperties.ScreenType = ScreenType

app.config.globalProperties.debounce = debounce
app.use(store)
app.use(Toaster)
app.use(PerfectScrollbar)
app.component('Button', Button)
app.component('Modal', Modal)
app.component('EditableSelect', EditableSelect)
app.component('RadioButtons', RadioButtons)
app.component('VSelect', vSelect)
app.mount('#app')
