<template>
  <div @click="handleClickEvent($event)">
    <EditableSelect
      :editable="editable"
      label="track"
      :text="getTrackName(time)"
      :options="tracks"
      @value:update="handleUpdateEvent('trackId', $event.uid)"
    />
  </div>
  <div @click="handleClickEvent($event)">
    <EditableSelect
      :editable="editable"
      :text="time.trackVariant"
      :options="getTrackVariants(time.trackId)"
      @value:update="handleUpdateEvent('trackVariant', $event)"
    />
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
  emits: ['click', 'value:update']
})
export default class TrackComponent extends Vue.with(TrackProps) {
  handleClickEvent (e: MouseEvent) {
    if (!e.ctrlKey) {
      this.$emit('click', { trackId: this.time.trackId, trackVariant: this.time.trackVariant })
    }
  }

  handleUpdateEvent (key: UpdateEventKey, value: string) {
    this.$emit('value:update', { key, value })
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
</script>

<style scoped lang="scss">

</style>
