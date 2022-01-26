<template>
  <div class="__realtimeData">
    <div class="__topContent">
      <div class="__raceData">
        <div>carName: {{ carName }}</div>
        <div>carClassName: {{ carClassName }}</div>
        <div>trackLocation: {{ trackLocation }}</div>
        <div>trackVariation: {{ trackVariation }}</div>
      </div>

      <div class="__controls">
        <div>
          <div>Realtime data:</div>
          <Button
            :type="realtimeData ? ButtonType.SUCCESS : ButtonType.DANGER"
            @click="toggleRealtimeData()"
          >
            {{ realtimeData ? 'Enabled' : 'Disabled' }}
          </Button>
        </div>

        <div v-if="realtimeData">
          <div>Lights enabled:</div>
          <Button
            :type="lightsEnabled ? ButtonType.SUCCESS : ButtonType.DANGER"
            @click="toggleLights()"
          >
            {{ lightsEnabled ? 'Enabled' : 'Disabled' }}
          </Button>
        </div>

        <div v-if="lightsEnabled">
          <label for="lightsOpacity">Lights opacity</label>
          <input
            id="lightsOpacity"
            v-model="lightsOpacity"
            type="range"
            min="0.1"
            step="0.1"
            max="1"
          >
        </div>
      </div>
    </div>

    <div class="__bottomContent">
      <div class="__telemetry">
        <div class="__brake">
          <div>brake: {{ brake }}</div>
          <div class="__verticalDial">
            <div class="__filler" />
          </div>
        </div>
        <div class="__throttle">
          <div>throttle: {{ throttle }}</div>
          <div class="__verticalDial">
            <div class="__filler" />
          </div>
        </div>
        <div class="__clutch">
          <div>clutch: {{ clutch }}</div>
          <div class="__verticalDial">
            <div class="__filler" />
          </div>
        </div>
        <div class="__speedometer">
          <div class="__rpm">
            <div class="__rpmValue">
              {{ rpm }} rpm
            </div>
            <div
              class="__horizontalDial"
            >
              <div
                ref="rpm"
                class="__filler"
              />
            </div>
          </div>
          <div class="__speed">
            <div>{{ speed }} km/h</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import PacketType from '@/constants/PacketType'

export default {
  name: 'RealtimeData',
  data () {
    return {
      realtimeData: true,
      lightsEnabled: false,
      lightsOpacity: 1
    }
  },
  computed: {
    ...mapState('realtimeData', [
      // Data
      'brake',
      'throttle',
      'clutch',
      'speed',
      'rpm',
      'maxRpm',
      // UDP1
      'carName',
      'carClassName',
      'trackLocation',
      'trackVariation'
    ])
  },
  created () {
    this.REALTIME_DATA_LISTENER = this.$rdb.addListener(this.onMessageCallback)
    this.lightsUrl = 'http://malina:4500'
    this.lightsId = 'C82B96407FD3'
  },
  methods: {
    ...mapMutations('realtimeData', ['setValueByKey', 'setValues']),
    toggleLights () {
      this.lightsEnabled = !this.lightsEnabled
      this.$lb.setLightsPower(this.lightsUrl, this.lightsId, this.lightsEnabled)
    },
    toggleRealtimeData () {
      if (this.realtimeData) {
        this.$rdb.removeListener(this.REALTIME_DATA_LISTENER)
      } else {
        this.REALTIME_DATA_LISTENER = this.$rdb.addListener(this.onMessageCallback)
        this.$rdb.addListener(this.onMessageCallback)
      }
      this.realtimeData = !this.realtimeData
    },
    onMessageCallback (msg) {
      try {
        const data = JSON.parse(msg.data)
        if (data.packetType === undefined) return
        // console.log('Packet type: ', data)
        if (this.lightsEnabled && data.packetType === PacketType.TELEMETRY) {
          this.setLightsColor(data.data)
        }
        this.setValues(data)
      } catch (e) {
        console.log('Error: ', e.message, msg)
      }
    },
    setLightsColor ({ throttle, rpm, maxRpm, brake }) {
      let color = '#00ff00'
      let brightness = rpm / maxRpm * 100
      // if braking, red color, brightness is intensity of braking
      if (brake > 0) {
        color = '#ff0000'
        brightness = brake / 255 * 100 // 255 is max brake
      }
      // if braking and throttle, yellow color, brightness is combination
      if (brake > 0 && throttle > 0) {
        color = '#ffff00'
        brightness = brake / 500 * 100 // 500 is max brake + max throttle
      }
      // if no throttle, nor brake, yellow, brightness is rpm/maxRpm percent
      if (throttle === 0 && brake === 0) {
        color = '#ffff00'
      }
      this.$lb.setLightsColor(this.lightsUrl, this.lightsId, color, brightness)
    },
    displayTime (seconds) {
      const d = new Date(seconds * 1000)
      return this.$ltb.dateToLaptime(d)
    },
    watch: {
      // whenever question changes, this function will run
      rpm (newValue, oldValue) {
        let bgColor = '#1a27db'
        const width = newValue / this.maxRpm * 100

        if (width > 70) bgColor = '#ffff00'
        if (width > 80) bgColor = '#d40400'
        if (width > 90) bgColor = '#ff0000'

        this.$refs.rpm.style.backgroundColor = bgColor
        this.$refs.rpm.style.width = `${width}%`
      }
    }
  }
}
</script>

<style scoped>
.__topContent {
  padding: 1rem;
  display: flex;
  justify-content: space-around;
}

.__bottomContent > .__telemetry {
  width: 80vw;
  height: 60vh;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
}

.__controls > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.__speedometer {

}

.__verticalDial {
  transform: rotateZ(180deg);
  position: relative;
  width: 1.5rem;
  height: 10rem;
  border-radius: 0.5rem;
  border: 0.1rem solid var(--border-dark1);
  background-color: var(--bg-light1);
}

.__verticalDial > .__filler{
  position: relative;
  width: 1.3rem;
  height: 100%;
  border-radius: 0.5rem;
}

.__horizontalDial {
  position: relative;
  width: 10rem;
  height: 1.5rem;
  border-radius: 0.5rem;
  border: 0.1rem solid var(--border-dark1);
  background-color: var(--bg-light1);
}

.__horizontalDial > .__filler{
  position: relative;
  width: 100%;
  height: 1.3rem;
  border-radius: 0.5rem;
  margin-top: 0.03rem;
  margin-left: 0.03rem;
}

.__brake > .__verticalDial > .__filler {
  background-color: var(--brake);
}

.__throttle > .__verticalDial > .__filler {
  background-color: var(--throttle);
}

.__clutch > .__verticalDial > .__filler{
  background-color: var(--clutch);
}

.__throttle > .__verticalDial > .__filler {
  background-color: var(--throttle);
}

.__rpm > .__horizontalDial{
  width: 30rem;
  height: 4rem;
}

.__rpm > .__horizontalDial > .__filler {
  height: 3.8rem;
  max-width: 29.75rem;
  width: 100%;
  background-color: #1a27db;
}

.__rpmValue {
  position: absolute;
  text-shadow: 0 0 0.5rem #080808;
  width: 30rem;
  text-align: center;
  font-weight: bold;
  font-size: 2rem;
  z-index: 10;
  line-height: 4rem;
}
</style>
