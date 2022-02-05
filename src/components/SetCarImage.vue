<template>
  <div class="__setCarImage">
    <div
      v-for="(c, index) in cars"
      :key="`car-${index}`"
    >
      <SetCarImageRow
        v-if="!c.imageUrl"
        :car="c"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import SetCarImageRow from '@/components/SetCarImageRow'

export default {
  name: 'SetCarImage',
  components: {
    SetCarImageRow
  },
  computed: {
    ...mapState(['cars'])
  }
}
</script>

<style scoped>
</style>
