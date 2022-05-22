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
          <div class="__verticalDial">
            <div
              ref="brake"
              class="__filler"
            />
          </div>
          <div>brake: {{ brake }}</div>
        </div>
        <div class="__clutch">
          <div class="__verticalDial">
            <div
              ref="clutch"
              class="__filler"
            />
          </div>
          <div>clutch: {{ clutch }}</div>
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
            <div>{{ parseInt(speed*(3600/1000)) }} km/h</div>
          </div>
        </div>

        <div class="__throttle">
          <div class="__verticalDial">
            <div
              ref="throttle"
              class="__filler"
            />
          </div>
          <div>throttle: {{ throttle }}</div>
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
      'gearNumGears',
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
      }
      this.realtimeData = !this.realtimeData
    },
    onMessageCallback (msg) {
      try {
        const data = JSON.parse(msg.data)
        if (data.packetType === undefined) return
        // console.log('Packet type: ', data)
        if (data.packetType === PacketType.TELEMETRY) {
          this.setDials()
          if (this.lightsEnabled) {
            this.setLightsColor(data.data)
          }
        }
        this.setValues(data)
      } catch (e) {
        console.log('Error: ', e.message, msg)
      }
    },
    setDials () {
      this.$refs.throttle.style.maxHeight = `${(this.throttle / 255) * 100}%`
      this.$refs.brake.style.maxHeight = `${(this.brake / 255) * 100}%`
      this.$refs.clutch.style.maxHeight = `${(this.clutch / 255) * 100}%`
      this.$refs.rpm.style.maxWidth = `${(this.rpm / this.maxRpm) * 100}%`
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
      this.$lb.setLightsColor(this.lightsUrl, this.lightsId, color, brightness * this.lightsOpacity)
    },
    displayTime (seconds) {
      const d = new Date(seconds * 1000)
      return this.$ltb.dateToLaptime(d)
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
  justify-content: center;
  align-items: center;
  background-color: rgba(46, 46, 46, 0.809);
  border-radius: 50% 50% 5rem 5rem;
  border: 0.3rem solid rgba(0, 0, 0, 0.464);
}

.__controls > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.__speedometer {
  font-size: 5rem;
  text-align: center;
}

.__verticalDial {
  transform: rotateZ(180deg);
  position: relative;
  width: 1.5rem;
  height: 10rem;
  border-radius: 0.5rem;
  border: 0.1rem solid var(--border-dark1);
  background-color: var(--bg-light1);
  display: inline-block;
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

.__brake, .__throttle, .__clutch {
  text-align: center;
  padding: 1rem;
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
