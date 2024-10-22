<template>
  <v-select
    class="__fullWidth"
    :model-value="modelValue"
    :placeholder="placeholder"
    :options="options"
    :reduce="reduce"
    :class="{__selected: modelValue}"
    :label="label"
    :disabled="disabled"
    :clearable="clearable"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component'

class SelectInputProps {
  options = prop<string[]>({ default: [], required: true })
  modelValue = prop<any>({ default: null })
  placeholder = prop<string>({ default: '' })
  label = prop<string>({ default: '' })
  clearable = prop<boolean>({ default: true })
  disabled = prop<boolean>({ default: false })
  reduce = prop<(o: any) => string>({ default: (o: any) => o })
}

@Options({
  emits: ['update:modelValue']
})
export default class SelectInput extends Vue.with(SelectInputProps) {}
</script>

<style lang="scss" scoped>
.__fullWidth {
  width: 100%
}

.__selected {
  :deep(.vs__dropdown-toggle) {
    border: 0.1rem solid #1d6ebe;
    box-shadow: 0px 0px 5px 2px #1d6ebe;
  }

  :deep(span.vs__selected) {
    color: #1d6ebe;
    font-weight: bold;
  }
}
</style>
