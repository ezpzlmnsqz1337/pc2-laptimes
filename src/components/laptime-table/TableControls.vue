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

export interface TableControlsClickEvent {
  laptime: string
}

export class TableControlsProps {
  showFilter = prop<boolean>({ required: true })
}

@Options({
  emits: ['filter:toggle', 'share:click']
})
export default class TableControls extends Vue.with(TableControlsProps) {
}
</script>

<style scoped lang="scss">
.__tableControls {
  position: relative;

  .__share {
    position: absolute;
    right: 0;
    top: 0;
  }
  .__showFilter {
    position: absolute;
    left: 0;
    top: 0;
  }
}

@media only screen and (max-width: 700px) {
  .__tableControls button {
    font-size: 0.6rem;
  }
}
</style>
