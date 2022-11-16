<template>
  <div>
    <div
      v-if="!edit"
      class="__textContainer"
      @click="startEditing($event)"
    >
      <div
        v-if="icon"
        :class="`fa fa-${icon}`"
      /><span>{{ text }}</span>
    </div>
    <v-select
      v-if="edit"
      ref="select"
      :model-value="text"
      :options="options"
      :label="label"
      @update:model-value="update($event)"
      @search:blur="edit = false"
    />
  </div>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component'
import { VueSelectInstance } from 'vue-select'

class EditableSelectProps {
  text = prop<string>({ default: 'Editable text' })
  icon = prop<string>({ default: '' })
  options = prop<any[]>({ default: [] })
  label = prop<string>({ default: 'name' })
  editable = prop<boolean>({ default: false })
}

@Options({
  emits: ['value:update']
})
export default class EditableSelect extends Vue.with(EditableSelectProps) {
  edit = false

  $refs!: {
    select: VueSelectInstance
  }

  startEditing (e: MouseEvent) {
    if (!this.editable) return
    if (!this.isLocal() || !e.ctrlKey) return
    this.edit = true
    this.$nextTick(() => (this.$refs.select.$el as HTMLSelectElement).focus())
  }

  update (e?: Event) {
    if (e) this.$emit('value:update', e)
    this.edit = false
  }
}
</script>

<style lang="scss" scoped>
.__textContainer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media only screen and (max-width: 700px) {
  .__textContainer {
    justify-content: center;
  }
}

:deep(.vs__dropdown-toggle) {
  min-width: 10rem;
}

:deep(.vs__dropdown-menu) {
  width: auto;
  overflow-x: hidden;
}
</style>
