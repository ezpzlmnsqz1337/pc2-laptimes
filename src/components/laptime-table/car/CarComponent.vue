<template>
  <img
    v-if="getCarImage(time)"
    :src="getCarImage(time)"
    :alt="getCarName(time)"
  >
  <div @click="handleClickEvent($event)">
    {{ getCarName(time) }}
  </div>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { Options, prop, Vue } from 'vue-class-component'

type UpdateEventKey = 'carId'

export interface CarComponentClickEvent {
  carId: string
}

export interface CarComponentUpdateEvent {
  key: UpdateEventKey
  value: string
}

export class CarProps {
  time = prop<Laptime>({ required: true })
  editable = prop<boolean>({ default: false })
}

@Options({
  emits: ['click']
})
export default class CarComponent extends Vue.with(CarProps) {
  handleClickEvent (e: MouseEvent) {
    if (e.ctrlKey) {
      this.$emit('click', { carId: this.time.carId })
      e.stopPropagation()
    }
  }

  get cars () {
    return this.$dataStore.cars
  }

  getCarName (time: Laptime) {
    return this.$dataStore.getCarById(time.carId)?.name
  }

  getCarImage (time: Laptime): string {
    const car = this.$dataStore.getCarById(time.carId)
    return car ? `images/${car.imageUrl}` : 'Loading...'
  }
}
</script>

<style scoped lang="scss">

</style>
