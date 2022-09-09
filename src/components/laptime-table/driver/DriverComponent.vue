<template>
  <div @click="handleClickEvent($event)">
    <EditableSelect
      label="name"
      :editable="editable"
      :text="getDriver(time)"
      :options="drivers"
      @value:update="handleUpdateEvent('driverId', $event.uid)"
    />
  </div>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
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

  getDriver (time: Laptime) {
    const driver = this.$dataStore.getDriverById(time.driverId)
    return driver ? driver.name : 'Loading...'
  }
}
</script>

<style scoped lang="scss">

</style>
