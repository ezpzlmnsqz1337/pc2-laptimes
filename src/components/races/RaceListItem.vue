<template>
  <div class="__raceItem">
    <h3>
      {{ raceDate }} - {{ raceTrackName }} - {{ race.trackVariant || '-' }}
    </h3>

    <div class="__raceMeta">
      <div><strong>Winner:</strong> {{ raceWinner }}</div>
      <div><strong>Gap:</strong> {{ raceGap }}</div>
    </div>

    <LaptimeTable
      :rows="raceTimesSorted"
      :display-columns="displayColumns"
    />
  </div>
</template>

<script lang="ts">
import LaptimeTable from '@/components/laptime-table/LaptimeTable.vue'
import { Race } from '@/store/dataStore'
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
    LaptimeTable
  },
  props: {
    race: {
      type: Object,
      required: true
    },
    displayColumns: {
      type: Array,
      required: true
    }
  }
})
class RaceListItem extends Vue {
  readonly race!: Race
  readonly displayColumns!: string[]

  get raceDate () {
    return new Date(this.race.startDate).toLocaleString()
  }

  get raceTrackName () {
    return this.$dataStore.getTrackById(this.race.trackId)?.track || 'Unknown track'
  }

  get raceWinner () {
    if (!this.race.winnerDriverId) return '-'
    const winnerTime = this.race.times.find(x => x.driverId === this.race.winnerDriverId)
    const driverName = this.$dataStore.getDriverById(this.race.winnerDriverId)?.name || '-'
    const carName = winnerTime ? (this.$dataStore.getCarById(winnerTime.carId)?.name || 'Unknown car') : 'Unknown car'
    return `${driverName} - ${carName}`
  }

  get raceTimesSorted () {
    return [...this.race.times].sort((a, b) => this.$ltb.compareLaptimes(a.laptime, b.laptime))
  }

  get raceGap () {
    if (this.raceTimesSorted.length < 2) return '-'
    return this.$ltb.getLaptimeDiff(this.raceTimesSorted[0].laptime, this.raceTimesSorted[1].laptime)
  }
}

export default RaceListItem
</script>

<style scoped lang="scss">
.__raceItem {
  padding-left: 10vw;
  padding-right: 10vw;
  padding-top: var(--space-9xl);
  padding-bottom: var(--space-9xl);
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  :deep(table) {
    width: 100%;
  }

  :deep(th),
  :deep(td.__id),
  :deep(td.__driver),
  :deep(td.__car) {
    text-align: center;
  }

  :deep(th:nth-child(2)),
  :deep(td.__driver) {
    width: var(--races-driver-column-width, 14rem);
  }

  :deep(td.__driver > div) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  :deep(td.__car > div) {
    text-align: center;
  }
}

.__raceMeta {
  margin-bottom: var(--space-5xl);
  display: flex;
  gap: var(--space-8xl);
}

@media only screen and (max-width: 700px) {
  .__raceItem {
    padding-bottom: var(--space-8xl);
  }

  .__raceMeta {
    flex-direction: column;
    gap: var(--space-sm);
  }
}
</style>
