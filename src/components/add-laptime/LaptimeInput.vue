<template>
  <div
    class="__laptimeInputs"
    :class="{__error: laptimeError}"
  >
    <input
      ref="minutesRef"
      v-model="minutes"
      tabindex="1"
      type="text"
      maxlength="2"
      class="__minutes"
      placeholder="0"
      :disabled="disabled"
      @keydown="onLaptimeInputKeyDown($event, undefined, 'secondsRef')"
      @input="onLaptimeInput()"
    >
    <div class="__colon">
      :
    </div>
    <input
      ref="secondsRef"
      v-model="seconds"
      tabindex="2"
      maxlength="2"
      type="text"
      class="__seconds"
      placeholder="00"
      :disabled="disabled"
      @keydown="onLaptimeInputKeyDown($event, 'minutesRef', 'millisecondsRef')"
      @input="onLaptimeInput()"
    >
    <div class="__dot">
      .
    </div>
    <input
      ref="millisecondsRef"
      v-model="milliseconds"
      tabindex="3"
      maxlength="3"
      type="text"
      class="__milliseconds"
      placeholder="000"
      :disabled="disabled"
      @keydown="onLaptimeInputKeyDown($event, 'secondsRef')"
      @input="onLaptimeInput()"
    >
  </div>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { Options, prop, Vue } from 'vue-class-component'

export class LaptimeInputProps {
  value = prop<Laptime>({ default: null, required: false })
  disabled = prop<boolean>({ default: false })
}

@Options({
  emits: ['changed']
})
class LaptimeInput extends Vue.with(LaptimeInputProps) {
  minutes: string = ''
  seconds: string = ''
  milliseconds: string = ''
  laptimeError = false

  get valid () {
    return this.laptime && !this.laptimeError
  }

  get laptime () {
    const [m, s, ms] = [this.minutes, this.seconds, this.milliseconds]
    if (!m || !s || !ms) return

    return this.$ltb.isLaptimeValid(m, s, ms) ? this.$ltb.laptimeFromComponents(m, s, ms) : undefined
  }

  mounted () {
    if (this.value) {
      this.setLaptime(this.value.laptime)
    }
  }

  onLaptimeInputKeyDown (e: any, leftInput?: string, rightInput?: string) {
    if (e.key === 'ArrowRight') {
      if (!rightInput) return
      const ri = (this.$refs as any)[rightInput]
      if (e.target.selectionStart === e.target.value.length) {
        ri.selectionStart = 0
        ri.focus()
      }
    } else if (e.key === 'ArrowLeft') {
      if (!leftInput) return
      const li = (this.$refs as any)[leftInput]
      if (e.target.selectionStart === 0) {
        li.selectionStart = li.value.length
        li.focus()
      }
    }
  }

  onLaptimeInput () {
    this.validateLaptimeFormat()
    if (!this.laptimeError) {
      this.$emit('changed', this.$ltb.laptimeFromComponents(this.minutes, this.seconds, this.milliseconds))
    }
  }

  reset (): void {
    this.minutes = ''
    this.seconds = ''
    this.milliseconds = ''
  }

  setLaptime (laptime: string) {
    const d = this.$ltb.laptimeToDate(laptime)
    this.minutes = `${d?.getMinutes()}`
    this.seconds = `${d?.getSeconds()}`.padStart(2, '0')
    this.milliseconds = `${d?.getMilliseconds()}`.padStart(3, '0')
  }

  validateLaptimeFormat () {
    this.laptimeError = !this.laptime || this.laptime.match(/^\d{1,2}:\d{2}.\d{3}$/) === null
  }
}
export default LaptimeInput
</script>

<style lang="scss" scoped>
.__laptimeInputs {
  display: flex;
  width: 100%;

  .__minutes {
    width: 100%;
    text-align: right;
    border: none;
    padding-right: var(--space-lg);
  }

  .__seconds {
    width: 3.1rem;
    border: none;
    text-align: center;
    padding-left: var(--space-lg);
    padding-right: var(--space-lg);
  }

  .__milliseconds {
    width: 100%;
    border: none;
    padding-left: var(--space-lg);
  }

  .__colon, .__dot {
    background-color: var(--bg-light1);
    color: var(--text-dark1);
    font-size: var(--font-size-xl);
    padding-top: var(--space-sm);
    border: none;
  }

  input {
    font-size: var(--font-size-xl);

    &:focus {
      outline: 0;
    }

    &:disabled {
      background-color: var(--bg-light1);
    }
  }

  &.__error {
    .__minutes {
      border: 0.15rem solid var(--status-error);
      color: var(--status-error);
      border-right: none;
    }
    .__seconds,  .__colon,  .__dot {
      border: 0.15rem solid var(--status-error);
      color: var(--status-error);
      border-right: none;
      border-left: none;
    }

    .__milliseconds {
      border: 0.15rem solid var(--status-error);
      color: var(--status-error);
      border-left: none;
    }
  }
}
</style>
