<template>
  <div class="__tableControls">
    <Button
      v-if="!showFilter"
      class="__showFilter"
      :type="ButtonType.SECONDARY"
      @click="$emit('filter:toggle')"
    >
      <div
        class="fa fa-filter"
      /><span>Filter</span>
    </Button>
    <Button
      class="__share"
      :type="ButtonType.SECONDARY"
      @click="$emit('share:click')"
    >
      <div
        class="fa fa-share"
      /><span>Share</span>
    </Button>
  </div>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component'

export class TableControlsProps {
  showFilter = prop<boolean>({ required: true })
}

@Options({
  emits: ['filter:toggle', 'share:click']
})
class TableControls extends Vue.with(TableControlsProps) {
}
export default TableControls
</script>

<style scoped lang="scss">
.__tableControls {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5xl);
  min-height: var(--target-min);
  margin-bottom: var(--space-2xl);

  .__share {
    margin-left: auto;
  }
}

@media only screen and (max-width: 700px) {
  .__tableControls button {
    font-size: var(--font-size-xs);
  }
}
</style>
