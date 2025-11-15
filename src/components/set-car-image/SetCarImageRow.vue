<template>
  <div
    class="__row"
  >
    <div class="__name">
      {{ car.name }}
    </div>
    <div class="__imageUrl">
      <v-select
        v-model="imageUrl"
        placeholder="Select car image"
        :options="images"
      />
    </div>
    <div>
      <Button @click="setCarImage(car.uid, imageUrl)">
        Link
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { Car } from '@/constants/Car'
import { carImages } from '@/constants/CarImages'
import { prop, Vue } from 'vue-class-component'

class SetCarImageRowProps {
  car = prop<Car>({ default: null })
}

class SetCarImageRow extends Vue.with(SetCarImageRowProps) {
  images = carImages
  imageUrl = ''

  setCarImage (carId: string, imageUrl: string) {
    this.$utilsStore.setCarImage(carId, imageUrl)
  }
}

export default SetCarImageRow
</script>

<style scoped lang="scss">
.__row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  .__imageUrl {
    width: 30rem;
  }
}
</style>
