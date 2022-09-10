<template>
  <RaceSettingsBadge
    v-for="(s, index) in settings"
    :key="index"
    :type="s"
    :value="time[s]"
    :editable="editable"
    @click="handleClickEvent($event)"
    @value:update="handleUpdateEvent($event)"
  />
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { Options, prop, Vue } from 'vue-class-component'
import RaceSettingsBadge, { RaceSettingsBadgeClickEvent, RaceSettingsBadgeUpdateEvent } from '../race-settings/RaceSettingsBadge.vue'

export class RaceSettingsProps {
  time = prop<Laptime>({ required: true })
  editable = prop<boolean>({ default: false })
}

@Options({
  components: {
    RaceSettingsBadge
  },
  emits: ['click', 'value:update']
})
export default class RaceSettings extends Vue.with(RaceSettingsProps) {
  settings = ['transmission', 'weather', 'brakingLine', 'controls']

  handleClickEvent (e: RaceSettingsBadgeClickEvent) {
    this.$emit('click', e)
  }

  handleUpdateEvent (e: RaceSettingsBadgeUpdateEvent) {
    this.$emit('value:update', { uid: this.time.uid, [e.type]: e.value })
  }
}

</script>

<style scoped lang="scss">

</style>
