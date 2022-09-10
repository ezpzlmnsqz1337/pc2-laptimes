<template>
  <div>{{ time.laptime }}</div>
  <div
    v-if="showDiff"
    class="__losing __losing_sm"
  >
    {{ $ltb.getLaptimeDiff(firstPlace.laptime, time.laptime) }}
  </div>
  <div class="__losing __losing_lg">
    <span v-if="showDiff">{{ $ltb.getLaptimeDiff(firstPlace.laptime, time.laptime) }}</span>
  </div>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { Options, prop, Vue } from 'vue-class-component'

type UpdateEventKey = 'laptime'

export interface LaptimeComponentClickEvent {
  laptime: string
}

export interface LaptimeComponentUpdateEvent {
  key: UpdateEventKey
  value: string
}

export class LaptimeProps {
  showDiff = prop<boolean>({ default: true })
  firstPlace = prop<Laptime>({ required: true })
  time = prop<Laptime>({ required: true })
}

@Options({
  emits: ['click', 'value:update']
})
export default class LaptimeComponent extends Vue.with(LaptimeProps) {
  handleClickEvent (e: MouseEvent) {
    if (!e.ctrlKey) {
      this.$emit('click', { laptime: this.time.laptime })
    }
  }

  handleUpdateEvent (key: UpdateEventKey, value: string) {
    this.$emit('value:update', { key, value })
  }
}
</script>

<style scoped lang="scss">

</style>
