<template>
  <div class="__realtimeData">
    <div class="__telemetry">
      <div>viewedParticipantIndex: {{ viewedParticipantIndex }}</div>
      // Unfiltered input
      <div>unfilteredThrottle: {{ unfilteredThrottle }}</div>
      <div>unfilteredBrake: {{ unfilteredBrake }}</div>
      <div>unfilteredSteering: {{ unfilteredSteering }}</div>
      <div>unfilteredClutch: {{ unfilteredClutch }}</div>
      // Flags
      <div>raceStateFlags: {{ raceStateFlags }}</div>
      // Data
      <div>oilTempCelsius: {{ oilTempCelsius }}</div>
      <div>oilPressureKPa: {{ oilPressureKPa }}</div>
      <div>waterTempCelsius: {{ waterTempCelsius }}</div>
      <div>waterPressureKPa: {{ waterPressureKPa }}</div>
      <div>fuelPressureKPa: {{ fuelPressureKPa }}</div>
      <div>fuelCapacity: {{ fuelCapacity }}</div>
      <div>brake: {{ brake }}</div>
      <div>throttle: {{ throttle }}</div>
      <div>clutch: {{ clutch }}</div>
      <div>fuelLevel: {{ fuelLevel }}</div>
      <div>speed: {{ speed }}</div>
      <div>rpm: {{ rpm }}</div>
      <div>maxRpm: {{ maxRpm }}</div>
      <div>steering: {{ steering }}</div>
      <div>gearNumGears: {{ gearNumGears }}</div>
      <div>boostAmount: {{ boostAmount }}</div>
      <div>crashState: {{ crashState }}</div>
      // Motion and device
      <div>odometerKM: {{ odometerKM }}</div>
      <div>orientationX: {{ orientationX }}</div>
      <div>orientationY: {{ orientationY }}</div>
      <div>orientationZ: {{ orientationZ }}</div>
      <div>localVelocityX: {{ localVelocityX }}</div>
      <div>localVelocityY: {{ localVelocityY }}</div>
      <div>localVelocityZ: {{ localVelocityZ }}</div>
      <div>worldVelocityX: {{ worldVelocityX }}</div>
      <div>worldVelocityY: {{ worldVelocityY }}</div>
      <div>worldVelocityZ: {{ worldVelocityZ }}</div>
      <div>angularVelocityX: {{ angularVelocityX }}</div>
      <div>angularVelocityY: {{ angularVelocityY }}</div>
      <div>angularVelocityZ: {{ angularVelocityZ }}</div>
      <div>localAccelerationX: {{ localAccelerationX }}</div>
      <div>localAccelerationY: {{ localAccelerationY }}</div>
      <div>localAccelerationZ: {{ localAccelerationZ }}</div>
      <div>worldAccelerationX: {{ worldAccelerationX }}</div>
      <div>worldAccelerationY: {{ worldAccelerationY }}</div>
      <div>worldAccelerationZ: {{ worldAccelerationZ }}</div>
      <div>extentsCentreX: {{ extentsCentreX }}</div>
      <div>extentsCentreY: {{ extentsCentreY }}</div>
      <div>extentsCentreZ: {{ extentsCentreZ }}</div>
    </div>
    <div class="__raceData">
      <div>carName: {{ carName }}</div>
      <div>carClassName: {{ carClassName }}</div>
      <div>trackLocation: {{ trackLocation }}</div>
      <div>trackVariation: {{ trackVariation }}</div>
    </div>
    <div class="__participants">
      <div
        v-for="(p, index) in participants"
        :key="index"
      >
        <div>Name: {{ p.name }}</div>
        <div>fastestLapTime: {{ displayTime(p.fastestLapTime) }}</div>
        <br>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'RealtimeData',
  computed: {
    ...mapState('realtimeData', [
      'viewedParticipantIndex',
      // Unfiltered input
      'unfilteredThrottle',
      'unfilteredBrake',
      'unfilteredSteering',
      'unfilteredClutch',
      // Flags
      'raceStateFlags',
      // Data
      'oilTempCelsius',
      'oilPressureKPa',
      'waterTempCelsius',
      'waterPressureKPa',
      'fuelPressureKPa',
      'fuelCapacity',
      'brake',
      'throttle',
      'clutch',
      'fuelLevel',
      'speed',
      'rpm',
      'maxRpm',
      'steering',
      'gearNumGears',
      'boostAmount',
      'crashState',
      // Motion and device
      'odometerKM',
      'orientationX',
      'orientationY',
      'orientationZ',
      'localVelocityX',
      'localVelocityY',
      'localVelocityZ',
      'worldVelocityX',
      'worldVelocityY',
      'worldVelocityZ',
      'angularVelocityX',
      'angularVelocityY',
      'angularVelocityZ',
      'localAccelerationX',
      'localAccelerationY',
      'localAccelerationZ',
      'worldAccelerationX',
      'worldAccelerationY',
      'worldAccelerationZ',
      'extentsCentreX',
      'extentsCentreY',
      'extentsCentreZ',
      // UDP1
      'carName',
      'carClassName',
      'trackLocation',
      'trackVariation',
      'participants'
    ])
  },
  created () {
    this.$rdb.addListener(this.onMessageCallback)
  },
  methods: {
    ...mapMutations('realtimeData', ['setValueByKey', 'setValues']),
    onMessageCallback (msg) {
      try {
        const data = JSON.parse(msg.data)
        if (data.packetType === undefined) return
        // console.log('Packet type: ', data)
        this.setValues(data)
      } catch (e) {
        console.log('Error: ', e.message, msg)
      }
    },
    displayTime (seconds) {
      const d = new Date(seconds * 1000)
      return `${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`
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
