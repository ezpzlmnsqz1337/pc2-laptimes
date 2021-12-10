import { createApp } from 'vue'
import App from '@/App'
import store from '@/store/index.js'
import PerfectScrollbar from 'vue3-perfect-scrollbar'
import Button from '@/components/ui/Button'
import ButtonType from '@/constants/ButtonType'
import Modal from '@/components/ui/Modal'
import { debounce } from 'debounce'
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css'
import 'material-icons/iconfont/material-icons.css'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const app = createApp(App)
app.config.globalProperties.ButtonType = ButtonType
app.config.globalProperties.debounce = debounce
app.use(store)
app.use(PerfectScrollbar)
app.component('Button', Button)
app.component('Modal', Modal)
app.component('VSelect', vSelect)
app.mount('#app')
