<template>
  <div @click="handleClickEvent($event)">
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

type UpdateEventKey = 'driverId'

export interface DriverComponentClickEvent {
  driverId: string
}

export interface DriverComponentUpdateEvent {
  key: UpdateEventKey
  value: string
}

export class DriverProps {
  time = prop<Laptime>({ required: true })
  editable = prop<boolean>({ default: false })
}

@Options({
  emits: ['click', 'value:update']
})
export default class DriverComponent extends Vue.with(DriverProps) {
  handleClickEvent (e: MouseEvent) {
    if (!e.ctrlKey) {
      this.$emit('click', { driverId: this.time.driverId })
    }
  }

  handleUpdateEvent (key: UpdateEventKey, value: string) {
    this.$emit('value:update', { key, value })
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
</script>

<style scoped lang="scss">

</style>
