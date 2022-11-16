<template>
  <div
    ref="wrapper"
    class="__radioWrapper"
    @keydown="keydownHandler($event)"
  >
    <div
      v-for="v in getValues"
      :key="v"
    >
      <Button
        :type="ButtonType.SECONDARY"
        block
        :disabled="disabled"
        :class="selectedClass(v)"
        @click="setValue(v)"
      >
        <input
          :id="`${v}${name}Radio`"
          v-model="selected"
          :name="`${name}Radio`"
          :value="v"
          type="radio"
          @change="$emit('changed', selected)"
        >
        <div><label :for="`${v}${name}Radio`">{{ v ? v : 'any' }}</label></div>
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { prop, Vue } from 'vue-class-component'

class RadioButtonsProps {
  noAny = prop<boolean>({ default: false })
  name = prop<string>({ default: 'name' })
  value = prop<string>({ default: '' })
  values = prop<any[]>({ default: [] })
  disabled = prop<boolean>({ default: false })
}

export default class RadioButtons extends Vue.with(RadioButtonsProps) {
  selected: string | null = null

  $refs!: {
    wrapper: HTMLDivElement
  }

  get getValues () {
    return this.values.filter(x => this.noAny ? x : true)
  }

  selectedClass (value: string) {
    return {
      __selected: this.value === value
    }
  }

  setValue (value: string | null) {
    this.selected = value
    this.$emit('changed', this.selected)
  }

  keydownHandler (e: KeyboardEvent) {
    const currentIndex = this.getValues.indexOf(this.value)
    if (this.$refs.wrapper === document.activeElement) {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        this.setValue(this.getValues[currentIndex - 1])
      } else if (e.key === 'ArrowRight' && currentIndex < this.getValues.length - 1) {
        this.setValue(this.getValues[currentIndex + 1])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.__radioWrapper{
  display: flex;
  width: 100%;
  justify-content: center;
}

input[type=radio] {
  display: none;
}

label {
  cursor: pointer;
}

button {
  &:hover {
    background-color: #005db9 !important;
  }

  &.__selected {
    background-color: #1d6ebe !important;
    font-weight: bold;
    color: var(--text-light1);
  }

  &:disabled {
    background-color: #8c8c8c !important;

    &.__selected {
      background-color: #265a8f !important;
      font-weight: bold;
      color: var(--text-light1);
    }
  }
}
</style>
