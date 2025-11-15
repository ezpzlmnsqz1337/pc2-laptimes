<template>
  <div class="__laptimeComponent">
    <div>{{ time.laptime }}</div>
    <div
      v-if="showDiff"
      class="__losing"
    >
      <span>{{ $ltb.getLaptimeDiff(firstPlace.laptime, time.laptime) }}</span>
    </div>
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
  emits: ['click']
})
class LaptimeComponent extends Vue.with(LaptimeProps) {
  handleClickEvent (e: MouseEvent) {
    if (!e.ctrlKey) {
      this.$emit('click', { laptime: this.time.laptime })
    }
  }
}
export default LaptimeComponent
</script>

<style scoped lang="scss">
.__laptimeComponent {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  gap: 1rem;
  padding: 0 1rem;
}

@media only screen and (max-width: 1300px) {
  .__laptimeComponent {
    flex-direction: column;
  }
}
</style>
