<template>
  <div
    class="__appWrapper"
  >
    <Background />
    <Menu />
    <keep-alive>
      <AddLaptime v-if="activeScreen === ScreenType.ADD_LAPTIME" />
    </keep-alive>
    <keep-alive>
      <BrowseTimes v-if="activeScreen === ScreenType.BROWSE_TIMES" />
    </keep-alive>
    <keep-alive>
      <Statistics v-if="activeScreen === ScreenType.STATISTICS" />
    </keep-alive>
    <keep-alive>
      <RealtimeData v-show="activeScreen === ScreenType.REALTIME_DATA" />
    </keep-alive>
    <!-- <SetCarImage v-show="activeScreen === ScreenType.SET_CAR_IMAGE" /> -->
    <WebsocketTesting v-if="activeScreen === ScreenType.WEBSOCKET_TESTING" />
    <transition name="bounce">
      <LaptimeDetailModal
        v-if="editLaptime"
        :laptime-id="editLaptime"
        @close="$dataStore.setEditLaptime(null)"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import AddLaptime from '@/pages/AddLaptime.vue'
import BrowseTimes from '@/pages/BrowseTimes.vue'
// import SetCarImage from '@/components/SetCarImage'
import Menu from '@/components/Menu.vue'
import Background from '@/components/Background.vue'
import RealtimeData from '@/pages/RealtimeData.vue'
import Statistics from '@/pages/Statistics.vue'
import WebsocketTesting from '@/pages/WebsocketTesting.vue'
import LaptimeDetailModal from '@/components/laptime-table/LaptimeDetailModal.vue'
import { unsubscribeAll } from '@/vuex-firestore-binding'
import { Options, Vue } from 'vue-class-component'
import { ScreenType } from './constants/ScreenType'

@Options({
  components: {
    Background,
    Menu,
    AddLaptime,
    BrowseTimes,
    RealtimeData,
    WebsocketTesting,
    Statistics,
    LaptimeDetailModal
    // SetCarImage
  }
})
export default class App extends Vue {
  mounted () {
    this.$dataStore.bindDb()
    this.handleUrl()
  }

  get activeScreen () {
    return this.$dataStore.activeScreen
  }

  get editLaptime () {
    return this.$dataStore.editLaptime
  }

  beforeUnmount () {
    unsubscribeAll()
  }

  handleUrl () {
    if (this.queryParams.has('page')) {
      const page = this.queryParams.get('page')
      switch (page) {
        case ScreenType.ADD_LAPTIME:
          this.$dataStore.showScreen(ScreenType.ADD_LAPTIME)
          break
        case ScreenType.STATISTICS:
          this.$dataStore.showScreen(ScreenType.STATISTICS)
          break
        case ScreenType.BROWSE_TIMES:
          this.$dataStore.showScreen(ScreenType.BROWSE_TIMES)
          break
        default:
          console.error('Unknown page: ', page)
      }
    }
  }
}
</script>

<style lang="scss">
@import './assets/css/v-select.css';
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');
:root {
  --hover: #188cff;
  --active: #1d6ebe;
  --text-light1: #ffffff;
  --text-light2: gray;
  --text-dark1: #242424;
  --bg-dark1: #8b8b8b;
  --bg-dark2: #5d5d5d;
  --bg-dark3: #424242;
  --bg-dark4: #3a3a3a;
  --bg-dark5: #242424;
  --bg-light1: #ffffff;
  --bg-light2: #a0a0a0;
  --bg-light3: #707070;
  --border-light1: #ffffff;
  --border-dark1: #424242;
  --anchor: #2183df;
  --brake: #ff0000;
  --throttle: #00ff00;
  --clutch: #e4e43d;
  --vdp-hover-bg-color: #188cff;
  --vdp-selected-bg-color: #1d6ebe;
  --vdp-bg-color: var(--bg-dark2);
  --vdp-text-color: var(--text-dark1);
}

* {
  box-sizing: border-box;
}

html {
  font-size: 1em;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

h2 {
  margin-top: 0.5rem;
}

#app {
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-light1);
  font-size: 0.7rem;
  margin-top: 0;
}

input[type=text], input[type=password], input[type=email], input[type=number]{
  padding: 0.5rem;
  border-radius: 0.3rem;
  border: 0.1rem solid black;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

select{
  padding: 0.5rem;
  border-radius: 0.3rem;
}

a {
  color: var(--anchor);
}

.__red {
  color: red;
}

.__yellow {
  color: yellow;
}

.__green {
  color: rgb(28, 197, 28);
}

.__orange {
  color: orange;
}

.__appWrapper {
  height: 100vh;
  overflow-y: scroll;
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Hide scrollbar for Chrome, Safari and Opera */
::-webkit-scrollbar {
  display: none;
}

.fa.fa-steering_wheel {
  display: block;
  margin-top: 0.1rem;
  margin-left: -0.1rem;
  width: 1rem;
  height: 0.8rem;
  font-size: 2rem;
  background: url('assets/icons/steering_wheel.svg');
  background-repeat: no-repeat;
}

@media only screen and (max-width: 1024px) {
  .fa.fa-steering_wheel {
    background: url('assets/icons/steering_wheel_sm.svg');
    background-repeat: no-repeat;
    height: 0.5rem;
    margin-left: 0;
  }
}

@media only screen and (min-width: 1600px) {
  html {
    font-size: 1.6em;
  }
}

.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .3s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

</style>
