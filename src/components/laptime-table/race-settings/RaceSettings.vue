<template>
  <RaceSettingsBadge
    v-for="(s, index) in settings"
    :key="index"
    :type="s"
    :value="time[s as keyof Laptime]"
    :editable="editable"
    @click="handleClickEvent($event)"
    @value:update="handleUpdateEvent($event)"
  />
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { LaptimeFilter } from '@/store/dataStore'
import { Options, prop, Vue } from 'vue-class-component'
import RaceSettingsBadge from '../race-settings/RaceSettingsBadge.vue'

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

  handleClickEvent (e: LaptimeFilter) {
    this.$emit('click', e)
  }

  handleUpdateEvent (e: Laptime) {
    this.$emit('value:update', { ...e, uid: this.time.uid })
  }
}

</script>

<style scoped lang="scss">

</style>
