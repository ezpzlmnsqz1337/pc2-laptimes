<template>
  <div class="__appWrapper">
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
import Background from '@/components/Background.vue'
import Menu from '@/components/Menu.vue'
import LaptimeDetailModal from '@/components/laptime-table/LaptimeDetailModal.vue'
import RealtimeData from '@/pages/RealtimeData.vue'
import Statistics from '@/pages/Statistics.vue'
import { Options, Vue } from 'vue-class-component'
import { ScreenType } from '@/constants/ScreenType'
import { StatisticsScreenType } from '@/constants/StatisticsScreenType'
import { RealtimeDataListener } from '@/builders/RealtimeDataBuilder'
import { RaceState } from '@/constants/RaceState'

@Options({
  components: {
    Background,
    Menu,
    AddLaptime,
    BrowseTimes,
    RealtimeData,
    Statistics,
    LaptimeDetailModal
  }
})
class App extends Vue {
  protected dataListener!: RealtimeDataListener
  lastRaceState = RaceState.MENU

  created () {
    this.dataListener = this.$rdb.addListener(this.onRealTimeDataReceived)
  }

  mounted () {
    this.$dataStore.bindDb()
    this.$dataStore.setupDbNotifications()
    this.refresh()
    this.handleUrl()
  }

  get activeScreen () {
    return this.$dataStore.activeScreen
  }

  get editLaptime () {
    return this.$dataStore.editLaptime
  }

  onRealTimeDataReceived (data: any) {
    data = data.data
    if ('raceState' in data) {
      if (this.lastRaceState === RaceState.BEFORE_RACE_MENU && data.raceState === RaceState.RACE_IS_ON) {
        this.$dataStore.showScreen(ScreenType.REALTIME_DATA)
      }
      this.lastRaceState = data.raceState
    }
  }

  beforeUnmount () {
    this.$rdb.removeListener(this.dataListener)
    this.$dataStore.disconnectDbNotifications()
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
        case ScreenType.RACES:
          this.$dataStore.showScreen(ScreenType.STATISTICS)
          this.$statisticsStore.showScreen(StatisticsScreenType.RACES)
          break
        default:
          console.error('Unknown page: ', page)
      }
    }
  }

  refresh () {
    setTimeout(() => {
      const laptimes = this.$dataStore.getTimes()
      this.$statisticsStore.refreshData(laptimes)
    }, 1000)
  }
}

export default App
</script>

<style lang="scss">
@import './assets/css/v-select.css';
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');

:root {
  --font-size-root: 1em;
  --font-size-root-lg: 1.6em;
  --font-size-2xs: 0.5rem;
  --font-size-xs: 0.6rem;
  --font-size-sm: 0.7rem;
  --font-size-compact: 0.8rem;
  --font-size-base: 1rem;
  --font-size-md: 1.1rem;
  --font-size-lg: 1.3rem;
  --font-size-xl: 2rem;
  --font-size-display: 5rem;
  --space-3xs: 0.03rem;
  --space-2xs: 0.1rem;
  --space-sm: 0.2rem;
  --space-lg: 0.3rem;
  --space-2xl: 0.5rem;
  --space-5xl: 0.75rem;
  --space-8xl: 1rem;
  --space-9xl: 1.5rem;
  --space-10xl: 2rem;
  --space-11xl: 3rem;
  --space-12xl: 5rem;
  --space-13xl: 6rem;
  --space-neg-2xs: -0.1rem;
  --space-neg-8xl: -1rem;
  --space-btn-mobile-y: 8px;
  --space-btn-mobile-x: 12px;
  --hover: #188cff;
  --active: #274db4;
  --text-light1: #ffffff;
  --text-light2: gray;
  --text-disabled: #939393;
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
  --dark-blue1: #274db4;
  --anchor: #2183df;
  --brake: #ff0000;
  --throttle: #00ff00;
  --clutch: #e4e43d;
  --status-error: #ff0000;
  --status-warning: #ffff00;
  --status-success: #059711;
  --status-orange: orange;
  --medal-gold: gold;
  --medal-silver: silver;
  --medal-bronze: #cd7f32;
  --state-selected-bg: #242424;
  --surface-muted: #f8f8f8;
  --surface-overlay-strong: rgba(72, 72, 72, 0.7);
  --surface-overlay-soft: rgba(72, 72, 72, 0.35);
  --overlay-backdrop: rgba(0, 0, 0, 0.5);
  --shadow-overlay: rgba(0, 0, 0, 0.33);
  --shadow-dark: #333333;
  --telemetry-surface-bg: rgba(46, 46, 46, 0.809);
  --telemetry-surface-border: rgba(0, 0, 0, 0.464);
  --telemetry-player1-border: rgb(15, 0, 255);
  --telemetry-player2-border: rgb(0, 131, 17);
  --telemetry-rpm-fill: #1a27db;
  --text-shadow-strong: #080808;
  --accent-blink: #3a9ee0;
  --interactive-hover-strong: #005db9;
  --interactive-disabled-bg: #8c8c8c;
  --interactive-selected-disabled: #265a8f;
  --btn-default-hover-bg: #e7e7e7;
  --btn-primary-hover-bg: #3f71a3;
  --btn-secondary-bg: #787879;
  --btn-secondary-hover-bg: #5f5f5f;
  --btn-success-bg: #2ab135;
  --btn-success-hover-bg: #0e8b19;
  --btn-danger-bg: #e02c2c;
  --btn-danger-hover-bg: #c71818;
  --btn-warning-bg: #fffb26;
  --btn-warning-hover-bg: #94881a;
  --btn-disabled-bg: #a0a0a0;
  --btn-disabled-text-color: #cacaca;
  --vdp-hover-bg-color: #188cff;
  --vdp-selected-bg-color: #274db4;
  --vdp-bg-color: var(--bg-dark2);
  --vdp-text-color: var(--text-dark1);
}

* {
  box-sizing: border-box;
}

html {
  font-size: var(--font-size-root);
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

h2 {
  margin-top: var(--space-2xl);
}

#app {
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-light1);
  font-size: var(--font-size-sm);
  margin-top: 0;
}

input[type=text],
input[type=password],
input[type=email],
input[type=number] {
  padding: var(--space-2xl);
  border-radius: 0;
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

select {
  padding: var(--space-2xl);
}

a {
  color: var(--anchor);
}

.__red {
  color: var(--status-error);
}

.__yellow {
  color: var(--status-warning);
}

.__green {
  color: var(--status-success);
}

.__orange {
  color: var(--status-orange);
}

.__appWrapper {
  height: 100vh;
  overflow-y: scroll;
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

/* Hide scrollbar for Chrome, Safari and Opera */
::-webkit-scrollbar {
  display: none;
}

.fa.fa-steering_wheel {
  display: block;
  margin-top: var(--space-2xs);
  width: 0.8rem;
  height: 0.8rem;
  margin-left: var(--space-neg-2xs);
  background-image: url('assets/icons/steering_wheel.svg');
  background-size: 0.8rem;
  background-position: 50% 50%;
  background-repeat: no-repeat;
}

@media only screen and (max-width: 1024px) {
  .fa.fa-steering_wheel {
    background-image: url('assets/icons/steering_wheel_sm.svg');
    height: 0.5rem;
  }
}

@media only screen and (max-width: 768px) {
  .fa.fa-steering_wheel {
    margin-left: 0;
  }
}

@media only screen and (min-width: 1600px) {
  html {
    font-size: var(--font-size-root-lg);
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
}</style>
