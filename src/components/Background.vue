<template>
  <div class="__background" />
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'

/**
 * Static, dimmed backdrop. The app identity is a night circuit — one still
 * image plus the accent glow, no ambient animation (principles: motion explains).
 */
class Background extends Vue {}
export default Background
</script>

<style scoped lang="scss">
.__background {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    radial-gradient(110% 60% at 50% -10%, var(--accent-soft), transparent 60%),
    linear-gradient(to bottom, rgba(8, 13, 22, 0.82), var(--canvas) 70%),
    url('~@/assets/images/project-cars-2-bg-1.jpg');
  background-size: cover, cover, cover;
  background-position: center top;
  background-repeat: no-repeat;
}
</style>
