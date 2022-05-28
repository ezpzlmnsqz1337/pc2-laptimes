<template>
  <div class="__menuWrapper">
    <div
      v-if="isLocal()"
      class="__info"
    >
      <div class="__websocket">
        <span>Websocket state: </span>
        <span :class="websocketStateClass">{{ websocketStateText }}</span>
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

      <div v-if="websocketState === WebsocketState.ESTABLISHED && raceStateText">
        <span>Race state: </span>
        <span :class="raceStateClass">{{ raceStateText }}</span>
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
        v-if="isLocal()"
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
</template>

<script>
import WebsocketState from '@/constants/WebsocketState'
import { mapMutations, mapState } from 'vuex'
import RaceState from '@/constants/RaceState'

export default {
  name: 'Menu',
  data () {
    return {
      connecting: false,
      host: 'wallpc',
      wsHosts: ['wallpc', 'deskpc']
    }
  },
  computed: {
    ...mapState(['websocketState', 'activeScreen']),
    ...mapState('realtimeData', ['raceState']),
    websocketStateText () {
      return this.websocketState === WebsocketState.ESTABLISHED ? 'Connected' : 'Not connected'
    },
    websocketStateClass () {
      return {
        __connected: this.websocketState === WebsocketState.ESTABLISHED,
        __notConnected: this.websocketState !== WebsocketState.ESTABLISHED
      }
    },
    raceStateText () {
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
    },
    raceStateClass () {
      return {
        __red: this.raceState === RaceState.MENU,
        __yellow: this.raceState === RaceState.BEFORE_RACE_MENU,
        __green: this.raceState === RaceState.RACE_IS_ON,
        __orange: this.raceState === RaceState.RACE_FINISHED
      }
    }
  },
  methods: {
    ...mapMutations(['showScreen', 'setWebsocketState']),
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
          this.setWebsocketState(wsState)
        }, 2500)
      }
    },
    disconnect () {
      this.$rdb.disconnect()
      this.setWebsocketState(WebsocketState.CLOSED_OR_COULD_NOT_OPEN)
    }
  }
}
</script>

<style scoped>
.__menuWrapper {
  background-color: rgba(72, 72, 72, 0.7);
  top: 0;
  width: 100vw;
  padding-bottom: 1rem;
  padding-top: 0.5rem;
  z-index: 999;
  text-align: center;
}

.__menu {
  padding-top: 0.2rem;
}

.__menu .__selected {
  background-color: #242424 !important;
}

.__info {
  text-align: center;
  margin-bottom: 0.3rem;
}

.__websocket {
  position: relative;
}

.__notConnected {
  color: red;
}

.__connected {
  color: rgb(28, 197, 28);
}

.__connect {
  display: flex;
  justify-content: center;
}

.__connect .__select{
  min-width: 10rem;
}

.__disconnect button{
  position: absolute;
  margin-left: 5.5rem;
  top: -0.35rem;
  font-size: 0.6rem;
  padding: 0.4rem 0.3rem;
}

</style>
