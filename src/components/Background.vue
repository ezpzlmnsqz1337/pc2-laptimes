<template>
  <div
    ref="background1"
    class="__background1"
  />
  <div
    ref="background2"
    class="__background2 __hidden"
  />
  <div
    ref="background3"
    class="__background3 __hidden"
  />
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  emits: ['close']
})
export default class Background extends Vue {
  protected currentBgIndex = 0

  $refs!: any

  mounted () {
    setInterval(() => {
      this.cycleBackground()
    }, 15000)
  }

  cycleBackground () {
    const bgCount = 3
    this.$refs[`background${this.currentBgIndex + 1}`].style.opacity = 0
    this.currentBgIndex = ++this.currentBgIndex % bgCount
    this.$refs[`background${this.currentBgIndex + 1}`].style.opacity = 1
  }
}
</script>

<style scoped lang="scss">
.__background1, .__background2, .__background3 {
  background-blend-mode: overlay;
  background-color: var(--bg-dark3);
  background-size: cover;
  width: 100%;
  height: 120%;
  position: absolute;
  top: 0;
  z-index: -999;
  opacity: 1;
  transition: opacity 1.5s ease-in;
}

.__background1 {
  background-image: url('~@/assets/images/project-cars-2-bg-1.jpg');
}

.__background2 {
  background-image: url('~@/assets/images/project-cars-2-bg-2.jpg');
}

.__background3 {
  background-image: url('~@/assets/images/project-cars-2-bg-3.jpg');
}

.__hidden {
  opacity: 0;
}

@media only screen and (max-width: 700px) {
  .__background1, .__background2, .__background3 {
    background-position: center center;
    background-size: cover;
  }

  .__laptimes {
    padding: 1rem;
  }

  .__menu button {
    font-size: 0.6rem;
  }
}
</style>
