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

<script lang="ts">
import SetCarImageRow from '@/components/SetCarImageRow.vue'
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
    SetCarImageRow
  }
})
export default class SetCarImage extends Vue {
  get cars () {
    return this.$dataStore.cars
  }
}
</script>

<style scoped>
</style>
