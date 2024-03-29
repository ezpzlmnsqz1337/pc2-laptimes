<template>
  <div class="__menuWrapper">
    <div
      v-if="isLocal()"
      class="__info"
    >
      <div class="__websocket">
        <div>
          <span>Websocket state: </span>
          <span :class="websocketStateClass">{{ websocketStateText }}</span>
          <div v-if="websocketState === WebsocketState.ESTABLISHED && raceStateText">
            <span>Race state: </span>
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

    <div
      v-if="connecting && websocketState !== WebsocketState.ESTABLISHED"
      class="__connecting"
    >
      <PulseLoader
        color="#188cff"
        size="8px"
      />
    </div>

    <div class="__menu">
      <Button
        v-if="isLocal()"
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.ADD_LAPTIME, __highlight: autoSubmit}"
        @click="showScreen(ScreenType.ADD_LAPTIME)"
      >
        Add laptime
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.BROWSE_TIMES}"
        @click="showScreen(ScreenType.BROWSE_TIMES)"
      >
        Browse times
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.STATISTICS}"
        @click="showScreen(ScreenType.STATISTICS)"
      >
        Statistics
      </Button>
      <Button
        v-if="isLocal()"
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.REALTIME_DATA}"
        @click="showScreen(ScreenType.REALTIME_DATA)"
      >
        Realtime data
      </Button>
      <!-- <Button
          :type="ButtonType.SECONDARY"
          :class="{__selected: activeScreen === ScreenType.SET_CAR_IMAGE}"
          @click="showScreen(ScreenType.SET_CAR_IMAGE)"
        >
          Set car image
        </Button> -->
      <!-- <Button
        v-if="isLocal()"
        :type="ButtonType.DANGER"
        :class="{__selected: activeScreen === ScreenType.WEBSOCKET_TESTING}"
        @click="showScreen(ScreenType.WEBSOCKET_TESTING)"
      >
        Websocket testing
      </Button> -->
    </div>
  </div>
</template>

<script lang="ts">
import { RaceState } from '@/constants/RaceState'
import { ScreenType } from '@/constants/ScreenType'
import { WebsocketState } from '@/constants/WebsocketState'
import { Vue } from 'vue-class-component'

export default class Menu extends Vue {
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
</script>

<style scoped lang="scss">
.__menuWrapper {
  background-color: rgba(72, 72, 72, 0.7);
  top: 0;
  position: absolute;
  width: 100vw;
  padding-top: 0.1rem;
  z-index: 999;
  text-align: center;

  &:hover {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;

    .__connect {
      display: flex;
    }

    .__menu {
      display: initial;
      height: initial;

      > button {
        padding: 8px 12px;
        height: initial;
        font-size: initial;
        width: initial;
        top: 0;
        position: initial;
      }
    }
  }

  .__menu {
    height: 5px;

    .__selected {
      background-color: #242424;
    }

    .__highlight {
      background-color: #4081C2;
      box-shadow: 0px 0px 5px 2px #4081C2;
    }

    > button {
      padding: 0;
      height: 5px;
      font-size: 0;
      vertical-align: top;
      width: 6rem;
      top: -4px;
      position: relative;
    }
  }

  .__info {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.3rem;
    gap: 0.1rem;
    flex-direction: column;
  }

  .__websocket {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .__notConnected {
    color: red;
  }

  .__connected {
    color: rgb(28, 197, 28);
  }

  .__connect {
    display: none;
    justify-content: center;

    .__select{
      min-width: 10rem;
    }
  }

  .__disconnect button{
    font-size: 0.6rem;
    padding: 0.4rem 0.3rem;
  }

  @media only screen and (max-width: 700px) {
    &:hover .__menu > button {
      font-size: 0.6rem;
    }
  }
}
</style>
