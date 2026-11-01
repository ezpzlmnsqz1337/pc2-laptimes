<template>
  <div class="__menuWrapper">
    <nav
      class="__menu"
      aria-label="Screens"
    >
      <Button
        v-if="isLocal()"
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.ADD_LAPTIME, __highlight: autoSubmit}"
        :aria-current="activeScreen === ScreenType.ADD_LAPTIME ? 'page' : undefined"
        @click="showScreen(ScreenType.ADD_LAPTIME)"
      >
        Add laptime
        <span
          v-if="autoSubmit"
          class="__autoBadge"
        >AUTO</span>
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.BROWSE_TIMES}"
        :aria-current="activeScreen === ScreenType.BROWSE_TIMES ? 'page' : undefined"
        @click="showScreen(ScreenType.BROWSE_TIMES)"
      >
        Browse times
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.STATISTICS}"
        :aria-current="activeScreen === ScreenType.STATISTICS ? 'page' : undefined"
        @click="showScreen(ScreenType.STATISTICS)"
      >
        Statistics
      </Button>
      <Button
        v-if="isLocal()"
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.REALTIME_DATA}"
        :aria-current="activeScreen === ScreenType.REALTIME_DATA ? 'page' : undefined"
        @click="showScreen(ScreenType.REALTIME_DATA)"
      >
        Realtime data
      </Button>
    </nav>

    <div
      v-if="connecting && websocketState !== WebsocketState.ESTABLISHED"
      class="__connecting"
    >
      <PulseLoader
        color="var(--accent)"
        size="8px"
      />
    </div>

    <div
      v-if="isLocal()"
      class="__info"
    >
      <div
        class="__websocket"
        role="status"
      >
        <div>
          <span class="__statusLabel">Websocket</span>
          <span :class="websocketStateClass">{{ websocketStateText }}</span>
          <div v-if="websocketState === WebsocketState.ESTABLISHED && raceStateText">
            <span class="__statusLabel">Race</span>
            <span :class="raceStateClass">{{ raceStateText }}</span>
          </div>
        </div>
        <div
          v-if="websocketState === WebsocketState.ESTABLISHED"
          class="__disconnect"
        >
          <Button
            :type="ButtonType.DANGER"
            @click="disconnect()"
          >
            Disconnect
          </Button>
        </div>
      </div>

      <div
        v-if="!connecting && websocketState !== WebsocketState.ESTABLISHED"
        class="__connect"
      >
        <v-select
          v-model="host"
          class="__select"
          placeholder="Select websocket provider"
          :options="wsHosts"
        />
        <Button
          :type="ButtonType.PRIMARY"
          :disabled="!host"
          @click="connect()"
        >
          Connect
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { RaceState } from '@/constants/RaceState'
import { ScreenType } from '@/constants/ScreenType'
import { WebsocketState } from '@/constants/WebsocketState'
import { Vue } from 'vue-class-component'

class Menu extends Vue {
  connecting = false
  host = 'wallpc'
  wsHosts = ['wallpc', 'deskpc']

  get activeScreen () {
    return this.$dataStore.activeScreen
  }

  get websocketState () {
    return this.$dataStore.websocketState
  }

  get websocketStateText () {
    return this.websocketState === WebsocketState.ESTABLISHED ? 'Connected' : 'Not connected'
  }

  get websocketStateClass () {
    return {
      __connected: this.websocketState === WebsocketState.ESTABLISHED,
      __notConnected: this.websocketState !== WebsocketState.ESTABLISHED
    }
  }

  get autoSubmit () {
    return this.$dataStore.autoSubmit
  }

  get raceState () {
    return this.$realtimeDataStore.raceState
  }

  get raceStateText () {
    switch (this.raceState) {
      case RaceState.MENU:
        return 'In menu'
      case RaceState.BEFORE_RACE_MENU:
        return 'Waiting for race to start'
      case RaceState.RACE_IS_ON:
        return 'Race in progress'
      case RaceState.RACE_FINISHED:
        return 'Race finished'
      default:
        return ''
    }
  }

  get raceStateClass () {
    return {
      __red: this.raceState === RaceState.MENU,
      __yellow: this.raceState === RaceState.BEFORE_RACE_MENU,
      __green: this.raceState === RaceState.RACE_IS_ON,
      __orange: this.raceState === RaceState.RACE_FINISHED
    }
  }

  mounted (): void {
    this.handleUrl()
  }

  showScreen (screen: ScreenType) {
    this.$dataStore.showScreen(screen)
  }

  connect () {
    if (!this.host) return
    this.connecting = true

    if (this.isLocal()) {
      this.$rdb.connect(this.host, 8765)
      setInterval(() => {
        const wsState = this.$rdb.getWebsocketState()
        if (wsState !== WebsocketState.ESTABLISHED) {
          this.connecting = false
        }
        this.$dataStore.setWebsocketState(wsState)
      }, 2500)
    }
  }

  disconnect () {
    this.$rdb.disconnect()
    this.$dataStore.setWebsocketState(WebsocketState.CLOSED_OR_COULD_NOT_OPEN)
  }

  handleUrl () {
    if (this.queryParams.has('wshost')) {
      const wshost = this.queryParams.get('wshost')
      switch (wshost) {
        case 'wallpc':
          this.host = 'wallpc'
          break
        case 'deskpc':
          this.host = 'deskpc'
          break
        default:
          console.error('Unknown websocket host: ', wshost)
      }
      this.connect()
    }
  }
}
export default Menu
</script>

<style scoped lang="scss">
.__menuWrapper {
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: var(--surface);
  border-bottom: 1px solid var(--line);
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-8xl);
  flex-direction: row;
  flex-wrap: wrap;
  padding: var(--space-2xl) var(--space-8xl);
  padding-top: calc(var(--space-2xl) + env(safe-area-inset-top, 0px));

  .__menu {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--space-2xl);
    flex: 1;

    .__selected {
      border-color: var(--accent);
      background-color: var(--accent-soft);
      color: var(--fg);
    }

    .__highlight {
      border-color: var(--success);
    }

    > button {
      font-size: var(--font-size-compact);
      flex: 1;
      min-width: 8rem;
    }
  }

  .__info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-2xl);
    flex-direction: column;
  }

  .__websocket {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-5xl);
    font-size: var(--font-size-compact);
    color: var(--muted);
  }

  .__statusLabel {
    color: var(--muted);
    font-size: var(--font-size-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-right: var(--space-2xs);
  }

  .__notConnected {
    color: var(--danger);
    font-weight: 600;
  }

  .__notConnected::before {
    content: '● ';
  }

  .__connected {
    color: var(--success);
    font-weight: 600;
  }

  .__connected::before {
    content: '● ';
  }

  .__autoBadge {
    border: 1px solid var(--success);
    border-radius: 999px;
    color: var(--success);
    font-size: var(--font-size-xs);
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 0 var(--space-2xl);
  }

  .__connect {
    display: flex;
    justify-content: center;
    gap: var(--space-2xl);

    .__select{
      min-width: 10rem;
    }
  }

  .__disconnect button{
    font-size: var(--font-size-xs);
    padding: var(--space-2xs) var(--space-5xl);
  }
}

@media only screen and (max-width: 700px) {
  .__menuWrapper {
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-2xl);
    padding-top: calc(var(--space-2xl) + env(safe-area-inset-top, 0px));

    .__menu {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2xl);

      > button {
        min-width: 0;
        font-size: var(--font-size-xs);
      }
    }

    .__info,
    .__connecting {
      width: 100%;
    }

    .__connect {
      display: flex;
    }
  }
}
</style>
