<template>
  <div class="__realtimeData">
    <div class="__telemetry">
      <div>brake: {{ brake }}</div>
      <div>throttle: {{ throttle }}</div>
      <div>speed: {{ speed }}</div>
      <div>rpm: {{ rpm }}</div>
      <div>maxRpm: {{ maxRpm }}</div>
    </div>
    <div class="__raceData">
      <div>carName: {{ carName }}</div>
      <div>carClassName: {{ carClassName }}</div>
      <div>trackLocation: {{ trackLocation }}</div>
      <div>trackVariation: {{ trackVariation }}</div>
    </div>
    <div>
      <div>
        Realtime data:
        <Button
          :type="realtimeData ? ButtonType.SUCCESS : ButtonType.DANGER"
          @click="toggleRealtimeData()"
        >
          {{ realtimeData ? 'Enabled' : 'Disabled' }}
        </Button>
      </div>
      <div v-if="realtimeData">
        Lights enabled:
        <Button
          :type="lightsEnabled ? ButtonType.SUCCESS : ButtonType.DANGER"
          @click="toggleLights()"
        >
          {{ lightsEnabled ? 'Enabled' : 'Disabled' }}
        </Button>
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
      lightsEnabled: false
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
    }
  }
}
</script>

<style scoped>
.__realtimeData {
  padding: 1rem;
  display: flex;
  justify-content: space-around;
}
</style>
