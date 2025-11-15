<template>
  <v-select
    class="__fullWidth"
    :model-value="modelValue"
    :placeholder="placeholder"
    :options="sortedOptions"
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
class SelectInput extends Vue.with(SelectInputProps) {
  get sortedOptions () {
    if (!this.options || !Array.isArray(this.options)) return this.options
    return [...this.options].sort((a, b) => {
      const aVal = this.label && typeof a === 'object' ? a[this.label] : a
      const bVal = this.label && typeof b === 'object' ? b[this.label] : b
      return String(aVal).localeCompare(String(bVal))
    })
  }
}
export default SelectInput
</script>

<style lang="scss" scoped>
.__fullWidth {
  width: 100%
}

.__selected {
  :deep(.vs__dropdown-toggle) {
    border: 0.1rem solid #274db4;
    box-shadow: 0px 0px 5px 2px #274db4;
  }

  :deep(span.vs__selected) {
    color: #274db4;
    font-weight: bold;
  }
}
</style>
