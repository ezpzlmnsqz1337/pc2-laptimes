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
      <Button @click="setCarImage({carId: car.uid, imageUrl})">
        Link
      </Button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { carImages } from '@/assets/db/images'

export default {
  name: 'SetCarImage',
  props: {
    car: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      images: carImages,
      imageUrl: ''
    }
  },
  computed: {
    ...mapState(['cars'])
  },
  methods: {
    ...mapActions(['setCarImage'])
  }
}
</script>

<style scoped>
.__row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.__row .__imageUrl {
  width: 30rem;
}
</style>
