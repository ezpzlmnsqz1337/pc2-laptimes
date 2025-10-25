<template>
  <div @click="handleClickEvent($event)">
    {{ getTrackName(time) }}
  </div>
  <div
    v-if="time.trackVariant"
    @click="handleClickEvent($event)"
  >
    {{ time.trackVariant }}
  </div>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { Options, prop, Vue } from 'vue-class-component'

type UpdateEventKey = 'trackId' | 'trackVariant'

export interface TrackComponentClickEvent {
  trackId: string
  trackVariant?: string
}

export interface TrackComponentUpdateEvent {
  key: UpdateEventKey
  value: string
}

export class TrackProps {
  time = prop<Laptime>({ required: true })
  editable = prop<boolean>({ default: false })
}

@Options({
  emits: ['click']
})
class TrackComponent extends Vue.with(TrackProps) {
  handleClickEvent (e: MouseEvent) {
    if (e.ctrlKey) {
      this.$emit('click', { trackId: this.time.trackId, trackVariant: this.time.trackVariant })
      e.stopPropagation()
    }
  }

  get tracks () {
    return this.$dataStore.tracks
  }

  getTrackName (time: Laptime) {
    const track = this.$dataStore.getTrackById(time.trackId)
    return track ? track.track : 'Loading...'
  }

  getTrackVariants (trackId: string) {
    return this.$dataStore.getTrackVariants(trackId)
  }
}
export default TrackComponent
</script>

<style scoped lang="scss">

</style>
