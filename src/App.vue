<template>
  <div class="__wrapper">
    <div class="__menuWrapper">
      <div
        v-if="isAdmin()"
        class="__connectionState"
      >
        <span>Websocket state: </span><span :class="websocketStateClass">{{ websocketStateText }}</span>
      </div>
      <div class="__menu">
        <Button
          v-if="isAdmin()"
          :type="ButtonType.SECONDARY"
          :class="{__selected: activeScreen === ScreenType.ADD_LAPTIME}"
          @click="showScreen({screen: ScreenType.ADD_LAPTIME})"
        >
          Add laptime
        </Button>
        <Button
          :type="ButtonType.SECONDARY"
          :class="{__selected: activeScreen === ScreenType.LAPTIME_BOARD}"
          @click="showScreen({screen: ScreenType.LAPTIME_BOARD})"
        >
          Laptime board
        </Button>
        <Button
          :type="ButtonType.SECONDARY"
          :class="{__selected: activeScreen === ScreenType.STATISTICS}"
          @click="showScreen({screen: ScreenType.STATISTICS})"
        >
          Statistics
        </Button>
        <Button
          v-if="isAdmin()"
          :type="ButtonType.SECONDARY"
          :class="{__selected: activeScreen === ScreenType.REALTIME_DATA}"
          @click="showScreen({screen: ScreenType.REALTIME_DATA})"
        >
          Realtime data
        </Button>
      <!-- <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.SET_CAR_IMAGE}"
        @click="showScreen({screen: ScreenType.SET_CAR_IMAGE})"
      >
        Set car image
      </Button> -->
      </div>
    </div>
    <keep-alive>
      <AddLaptime v-if="activeScreen === ScreenType.ADD_LAPTIME" />
    </keep-alive>
    <div
      v-show="activeScreen === ScreenType.LAPTIME_BOARD"
      class="__laptimes"
    >
      <keep-alive>
        <LaptimeFilter v-if="activeScreen === ScreenType.LAPTIME_BOARD" />
      </keep-alive>
      <keep-alive>
        <LaptimeBoard v-if="activeScreen === ScreenType.LAPTIME_BOARD" />
      </keep-alive>
    </div>
    <keep-alive>
      <Statistics v-if="activeScreen === ScreenType.STATISTICS" />
    </keep-alive>
    <keep-alive>
      <RealtimeData v-show="activeScreen === ScreenType.REALTIME_DATA" />
    </keep-alive>
    <!-- <SetCarImage v-show="activeScreen === ScreenType.SET_CAR_IMAGE" /> -->
  </div>
</template>

<script>
import { unsubscribeAll } from '@/vuex-firestore-binding'
import AddLaptime from '@/components/AddLaptime'
import LaptimeBoard from '@/components/LaptimeBoard'
import LaptimeFilter from '@/components/LaptimeFilter'
import Statistics from '@/components/Statistics'
import RealtimeData from '@/components/RealtimeData'
// import SetCarImage from '@/components/SetCarImage'
import { mapActions, mapMutations, mapState } from 'vuex'
import WebsocketState from './constants/WebsocketState'
import ScreenType from './constants/ScreenType'

export default {
  name: 'App',
  components: {
    AddLaptime,
    LaptimeBoard,
    LaptimeFilter,
    Statistics,
    RealtimeData
    // SetCarImage
  },
  computed: {
    ...mapState(['activeScreen', 'websocketState']),
    websocketStateText () {
      return this.websocketState === WebsocketState.ESTABLISHED ? 'Connected' : 'Not connected'
    },
    websocketStateClass () {
      return {
        __connected: this.websocketState === WebsocketState.ESTABLISHED,
        __notConnected: this.websocketState !== WebsocketState.ESTABLISHED
      }
    }
  },
  created () {
    // connect to the websocket server
    if (this.isAdmin()) {
      this.$rdb.connect('wallpc', 8765)
      setInterval(() => {
      // connect to ws for realtime data
        this.setWebsocketState(this.$rdb.getWebsocketState())
      }, 2500)
    }
  },
  async mounted () {
    await this.bindDb()
    this.handleUrl()
    this.refreshTimes()
  },
  unmounted () {
    unsubscribeAll()
  },
  methods: {
    ...mapActions(['bindDb', 'refreshTimes']),
    ...mapMutations(['showScreen', 'setWebsocketState']),
    handleUrl () {
      if (this.queryParams.has('page')) {
        const page = this.queryParams.get('page')
        switch (page) {
          case ScreenType.STATISTICS:
            this.showScreen({ screen: ScreenType.STATISTICS })
            break
          case ScreenType.LAPTIME_BOARD:
            this.showScreen({ screen: ScreenType.LAPTIME_BOARD })
            break
          default:
            console.error('Unkonwn page: ', page)
        }
      }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');
:root {
  --hover: #188cff;
  --active: #205b95;
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
}

* {
  box-sizing: border-box;
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
  font-size: 12px;
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

.__inputRow {
  display: flex;
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  justify-content: center;
}

.__noColumn {
  flex-direction: row !important;
  border-bottom: 0.1rem solid white;
}

.__noColumn > div {
  padding: 0.5rem 1rem;
}

.__connectionState {
  margin-top: 0.5rem;
  text-align: center;
}

.__notConnected {
  color: red;
}

.__connected {
  color: rgb(28, 197, 28);
}

/* custom scrollbar overrides */
.ps .ps__rail-x:hover, .ps .ps__rail-y:hover, .ps .ps__rail-x:focus, .ps .ps__rail-y:focus, .ps .ps__rail-x.ps--clicking, .ps .ps__rail-y.ps--clicking {
  background-color: transparent !important;
}

.ps__rail-y:hover > .ps__thumb-y, .ps__rail-y:focus > .ps__thumb-y, .ps__rail-y.ps--clicking .ps__thumb-y {
  width: 7px !important;
}

.__wrapper {
  background-color: var(--bg-dark3);
  height: 100vh;
  overflow-y: scroll;
  padding-top: 5.5rem;
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.__wrapper::-webkit-scrollbar {
  display: none;
}

.__menuWrapper {
  background-color: var(--bg-dark3);
  border-bottom: 0.1rem solid var(--border-light1);
  top: 0;
  position: fixed;
  width: 100vw;
  padding-bottom: 1rem;
  z-index: 999;
}

.__menu {
  padding-top: 0.5rem;
  text-align: center;
}

.__menu .__selected {
  background-color: #242424 !important;
}

.__inputRow > input, .__inputRow > .v-select {
  width: 100%;
}

.__laptimes {
  padding: 0 2rem 0 2rem;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.v-select > .vs__dropdown-toggle {
  background-color: var(--bg-light1);
  border-radius: 0.3rem;
  padding: 0.5rem;
  border: 0.1rem solid black;
}

.vs__actions .vs__clear {
  fill: red;
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
  .__laptimes {
    flex-direction: column;
  }

  .fa.fa-steering_wheel {
    background: url('assets/icons/steering_wheel_sm.svg');
    background-repeat: no-repeat;
    height: 0.5rem;
    margin-left: 0;
  }
}

@media only screen and (max-width: 700px) {
  .__laptimes {
    padding: 1rem;
  }

  .__menu button {
    font-size: 0.6rem;
  }
}
</style>
