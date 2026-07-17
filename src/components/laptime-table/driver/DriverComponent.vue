<template>
  <div
    class="__driverContent"
    @click="handleClickEvent($event)"
  >
    <div>{{ getDriverName(time) }}</div>
    <img
      :src="getRank(time.driverId)"
      alt="rank"
    >
  </div>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { Rank } from '@/constants/Rank'
import { Options, prop, Vue } from 'vue-class-component'

export class DriverProps {
  time = prop<Laptime>({ required: true })
  editable = prop<boolean>({ default: false })
}

@Options({
  emits: ['click']
})
class DriverComponent extends Vue.with(DriverProps) {
  handleClickEvent (e: MouseEvent) {
    if (!e.ctrlKey) {
      this.$emit('click', { driverId: this.time.driverId })
    }
  }

  get drivers () {
    return this.$dataStore.drivers
  }

  getDriverName (time: Laptime) {
    const driver = this.$dataStore.getDriverById(time.driverId)
    return driver ? driver.name : 'Loading...'
  }

  getRank (driverId: string): string {
    const driver = this.$dataStore.getDriverById(driverId)
    if (!driver) return Rank.UNRANKED as unknown as string
    return this.$sb.getRank(driver, this.$statisticsStore.totalRaces, this.$statisticsStore.medals) as unknown as string
  }
}
export default DriverComponent
</script>

<style scoped lang="scss">
.__driverContent {
  padding: var(--space-sm);
}

img {
  margin: var(--space-lg);
  width: 4.5rem;
}

@media only screen and (max-width: 700px) {
  img {
    margin: var(--space-2xs);
    width: 3rem;
  }
}

</style>
