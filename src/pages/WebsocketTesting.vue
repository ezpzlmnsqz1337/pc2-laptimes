<template>
  <div class="__websocketTesting">
    <div>
      Race state:
      <Button
        :type="ButtonType.DEFAULT"
        @click="sendRaceState(0)"
      >
        Menu
      </Button>
      <Button
        :type="ButtonType.WARNING"
        @click="sendRaceState(1)"
      >
        Before race menu
      </Button>
      <Button
        :type="ButtonType.SUCCESS"
        @click="sendRaceState(2)"
      >
        Race is on
      </Button>
      <Button
        :type="ButtonType.DANGER"
        @click="sendRaceState(3)"
      >
        Race finished
      </Button>
    </div>
    <div>
      Race data:
      <Button
        :type="ButtonType.DEFAULT"
        @click="sendRaceInfo('car1', 'track1', 'Variant2', 'Driver1', 90)"
      >
        Driver1
      </Button>°
      <Button
        :type="ButtonType.DEFAULT"
        @click="sendRaceInfo('car2', 'track3', 'Variant3', 'Driver2', 120)"
      >
        Driver2
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { PacketType } from '@/constants/PacketType'
import { RaceState } from '@/constants/RaceState'
import { Vue } from 'vue-class-component'

export default class WebsocketTesting extends Vue {
  sendRaceInfo (car: string, track: string, variant: string, driver: string, laptimeS: number) {
    this.$realtimeDataStore.setValues({
      carName: car,
      trackLocation: track,
      trackVariation: variant,
      participants: [
        {
          name: driver,
          fastestLapTime: laptimeS
        }
      ]
    })
  }

  sendRaceState (raceState: RaceState) {
    const data = { packetType: PacketType.RACE_DATA, data: { raceState } }
    this.$rdb.listeners.forEach(x => x(data))
    this.$realtimeDataStore.setValues({ raceState })
  }
}
</script>

<style scoped>
</style>
