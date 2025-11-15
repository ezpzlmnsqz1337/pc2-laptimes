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

class WebsocketTesting extends Vue {
  sendRaceInfo (car: string, track: string, variant: string, driver: string, laptimeS: number) {
    this.$realtimeDataStore.setValues({
      carName: car,
      trackLocation: track,
      trackVariation: variant,
      participants: [
        {
          name: driver,
          fastestLapTime: laptimeS,
          classSameAsPlayer: false,
          currentLap: 0,
          currentLapDistance: 0,
          isActive: 1,
          lapInvalidated: 1,
          lapsCompleted: 0,
          lastSectorTime: 0,
          racePosition: 0,
          sector: 0,
          worldPositionX: 0,
          worldPositionY: 0,
          worldPositionZ: 0
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

export default WebsocketTesting
</script>

<style scoped>
.__websocketTesting {
  padding: 2rem 1rem;
}
</style>
