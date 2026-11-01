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
import { RealtimeDataListener, RealtimePacket } from '@/builders/RealtimeDataBuilder'
import { RaceState } from '@/constants/RaceState'
import eb from '@/eventBus'

const TOAST_DURATION_MS = 5000

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
    eb.on('toast:error', this.showErrorToast)
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

  onRealTimeDataReceived (packet: RealtimePacket) {
    const data = packet.data
    if ('raceState' in data) {
      const raceState = data.raceState
      if (typeof raceState !== 'number') return
      if (this.lastRaceState === RaceState.BEFORE_RACE_MENU && raceState === RaceState.RACE_IS_ON) {
        this.$dataStore.showScreen(ScreenType.REALTIME_DATA)
      }
      this.lastRaceState = raceState as RaceState
    }
  }

  showErrorToast (message: string) {
    this.$toast.error(message, { duration: TOAST_DURATION_MS })
  }

  beforeUnmount () {
    this.$rdb.removeListener(this.dataListener)
    eb.off('toast:error', this.showErrorToast)
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
@import './assets/css/tokens';
@import './assets/css/v-select.css';
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

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

  /* Legacy names mapped onto the canonical tokens. New code should use the
     canonical names; these stay so existing components inherit the theme. */
  --hover: var(--accent);
  --active: var(--accent-strong);
  --text-light1: var(--fg);
  --text-light2: var(--muted);
  --text-disabled: var(--muted);
  --text-dark1: var(--canvas);
  --bg-dark1: var(--surface-raised);
  --bg-dark2: var(--surface-raised);
  --bg-dark3: var(--surface);
  --bg-dark4: var(--surface);
  --bg-dark5: var(--canvas);
  --bg-light1: var(--surface-raised);
  --bg-light2: var(--line);
  --bg-light3: var(--line-strong);
  --border-light1: var(--line-strong);
  --border-dark1: var(--line);
  --dark-blue1: var(--accent-strong);
  --anchor: var(--accent);
  --brake: var(--danger);
  --throttle: var(--success);
  --clutch: var(--warning);
  --status-error: var(--danger);
  --status-warning: var(--warning);
  --status-success: var(--success);
  --status-orange: var(--warning);
  --status-success-soft: var(--success-soft);
  --status-error-soft: var(--danger-soft);
  --surface-highlight-soft: var(--accent-soft);
  --chart-color-1: #7aa2f7;
  --chart-color-2: #bb9af7;
  --chart-color-3: #9ece6a;
  --chart-color-4: #ff9e64;
  --chart-color-5: #4d8dff;
  --chart-color-6: #2f6fe0;
  --chart-color-7: #7dcfff;
  --chart-color-8: #b48ead;
  --chart-color-9: #f87171;
  --chart-color-10: #1e2c44;
  --chart-color-11: #6cb6ff;
  --chart-color-12: #e6edf7;
  --chart-color-13: #e0af68;
  --state-selected-bg: var(--surface-raised);
  --surface-muted: var(--surface-raised);
  --surface-overlay-strong: rgba(14, 22, 38, 0.86);
  --surface-overlay-soft: rgba(14, 22, 38, 0.6);
  --shadow-dark: rgba(0, 0, 0, 0.45);
  --telemetry-surface-bg: rgba(14, 22, 38, 0.86);
  --telemetry-surface-border: var(--line-strong);
  --telemetry-player1-border: var(--accent);
  --telemetry-player2-border: var(--success);
  --telemetry-rpm-fill: var(--accent-strong);
  --text-shadow-strong: var(--canvas);
  --accent-blink: var(--accent);
  --interactive-hover-strong: var(--accent-strong);
  --interactive-disabled-bg: var(--line);
  --interactive-selected-disabled: var(--line-strong);
  --btn-default-hover-bg: var(--line-strong);
  --btn-primary-hover-bg: var(--accent-strong);
  --btn-secondary-bg: var(--surface-raised);
  --btn-secondary-hover-bg: var(--line-strong);
  --btn-success-bg: var(--success);
  --btn-success-hover-bg: var(--success-strong);
  --btn-danger-bg: var(--danger);
  --btn-danger-hover-bg: var(--danger-strong);
  --btn-warning-bg: var(--warning);
  --btn-warning-hover-bg: var(--warning-strong);
  --btn-disabled-bg: var(--line);
  --btn-disabled-text-color: var(--muted);
  --vdp-hover-bg-color: var(--accent);
  --vdp-selected-bg-color: var(--accent-strong);
  --vdp-bg-color: var(--surface-raised);
  --vdp-text-color: var(--fg);
}

* {
  box-sizing: border-box;
}

html {
  font-size: var(--font-size-root);
  background: var(--canvas);
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: var(--canvas);
  color: var(--fg);
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: var(--font-size-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h2 {
  margin-top: var(--space-2xl);
}

#app {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--fg);
  font-size: var(--font-size-base);
  margin-top: 0;
}

/* Estate baseline: visible focus, never removed without a replacement. */
:focus-visible {
  outline: var(--focus-width) solid var(--accent);
  outline-offset: var(--focus-offset);
}

input[type=text],
input[type=password],
input[type=email],
input[type=number] {
  padding: var(--space-2xl);
  border-radius: var(--radius-sm);
  border: 1px solid var(--line-control);
  background: var(--surface-raised);
  color: var(--fg);
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
  border-radius: var(--radius-sm);
  border: 1px solid var(--line-control);
  background: var(--surface-raised);
  color: var(--fg);
}

a {
  color: var(--accent);
}

.__red {
  color: var(--danger);
}

.__yellow {
  color: var(--warning);
}

.__green {
  color: var(--success);
}

.__orange {
  color: var(--warning);
}

.__appWrapper {
  min-height: 100vh;
  overflow-y: auto;
}

/* Thin, visible scrollbars: content must stay reachable. */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--line-strong);
  border-radius: 999px;
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
  animation: bounce-in var(--motion-slow);
}

.bounce-leave-active {
  animation: bounce-in var(--motion-base) reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(.96);
  }

  60% {
    transform: scale(1.01);
  }

  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}</style>
