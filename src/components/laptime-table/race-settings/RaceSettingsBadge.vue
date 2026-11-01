<template>
  <div
    :class="getClass(type)"
    class="__textContainer"
    @click="handleClickEvent($event)"
  >
    <div
      :class="`fa fa-${getIcon(type)}`"
    /><span>{{ value }}</span>
  </div>
</template>

<script lang="ts">
import { BadgeType } from '@/constants/BadgeType'
import type { BadgeValue } from '@/constants/BadgeType'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import { Options, prop, Vue } from 'vue-class-component'

export class RaceSettingsBadgeProps {
  type = prop<BadgeType>({ required: true })
  value = prop<BadgeValue>({ required: true })
  editable = prop<boolean>({ default: false })
}

@Options({
  emits: ['click']
})
class RaceSettingsBadge extends Vue.with(RaceSettingsBadgeProps) {
  handleClickEvent (e: MouseEvent) {
    if (e.ctrlKey) {
      this.$emit('click', { [this.type]: this.value })
      e.stopPropagation()
    }
  }

  getClass (type: BadgeType) {
    switch (type) {
      case BadgeType.TRANSMISSION:
        return this.getTransmissionClass(this.value as TransmissionType)
      case BadgeType.BRAKING_LINE:
        return this.getBrakingLineClass(this.value as BrakingLine)
      case BadgeType.CONTROLS:
        return this.getControlsClass(this.value as ControlType)
      case BadgeType.WEATHER:
        return this.getWeatherClass(this.value as WeatherType)
    }
  }

  getIcon (type: BadgeType) {
    switch (type) {
      case BadgeType.TRANSMISSION:
        return this.getTransmissionIcon(this.value as TransmissionType)
      case BadgeType.BRAKING_LINE:
        return this.getBrakingLineIcon(this.value as BrakingLine)
      case BadgeType.CONTROLS:
        return this.getControlsIcon(this.value as ControlType)
      case BadgeType.WEATHER:
        return this.getWeatherIcon(this.value as WeatherType)
    }
  }

  getBrakingLineClass (brakingLine: BrakingLine) {
    return {
      __brakingLineOn: brakingLine === BrakingLine.ON,
      __brakingLineOff: brakingLine === BrakingLine.OFF
    }
  }

  getBrakingLineIcon (brakingLine: BrakingLine) {
    return brakingLine === BrakingLine.ON ? 'check-circle' : 'times-circle'
  }

  getWeatherClass (weather: WeatherType) {
    return {
      __weatherSunny: weather === WeatherType.SUN,
      __weatherRainy: weather === WeatherType.RAIN,
      __weatherSnow: weather === WeatherType.SNOW
    }
  }

  getWeatherIcon (weather: WeatherType) {
    if (!weather) return
    switch (weather) {
      case WeatherType.SUN:
        return 'sun'
      case WeatherType.RAIN:
        return 'cloud-rain'
      case WeatherType.SNOW:
        return 'snowflake'
    }
  }

  getTransmissionClass (transmission: TransmissionType) {
    return {
      __transmissionAutomatic: transmission === TransmissionType.AUTOMATIC,
      __transmissionSequential: transmission === TransmissionType.SEQUENTIAL,
      __transmissionHPattern: transmission === TransmissionType.H_PATTERN
    }
  }

  getTransmissionIcon (transmission: TransmissionType) {
    if (!transmission) return
    switch (transmission) {
      case TransmissionType.AUTOMATIC:
        return 'font'
      case TransmissionType.SEQUENTIAL:
        return 'sort'
      case TransmissionType.H_PATTERN:
        return 'hospital-symbol'
    }
  }

  getControlsClass (controls: ControlType) {
    return {
      __controlsKeyboard: controls === ControlType.KEYBOARD,
      __controlsGamepad: controls === ControlType.GAMEPAD,
      __controlsSteeringWheel: controls === ControlType.STEERING_WHEEL
    }
  }

  getControlsIcon (controls: ControlType) {
    if (!controls) return
    switch (controls) {
      case ControlType.KEYBOARD:
        return 'keyboard'
      case ControlType.GAMEPAD:
        return 'gamepad'
      case ControlType.STEERING_WHEEL:
        return 'steering_wheel'
    }
  }
}

export default RaceSettingsBadge
</script>

<style scoped lang="scss">
.__textContainer {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: var(--space-lg) var(--space-5xl);
  margin-bottom: var(--space-lg);
  font-size: var(--font-size-sm);
  min-width: 6rem;
}

.__weatherSunny {
  background-color: var(--warning);
  color: var(--canvas);
}

.__weatherRainy {
  background-color: var(--accent-strong);
  color: var(--canvas);
}

.__weatherSnow {
  background-color: var(--surface-raised);
  color: var(--fg);
}

.__brakingLineOff {
  background-color: var(--danger);
  color: var(--canvas);
}

.__brakingLineOn {
  background-color: var(--success);
  color: var(--canvas);
}

.__transmissionAutomatic {
  background-color: var(--success);
  color: var(--canvas);
}

.__transmissionSequential {
  background-color: var(--accent-strong);
  color: var(--canvas);
}

.__transmissionHPattern {
  background-color: var(--warning);
  color: var(--canvas);
}

.__controlsKeyboard {
  background-color: var(--success);
  color: var(--canvas);
}

.__controlsGamepad {
  background-color: var(--accent);
  color: var(--canvas);
}

.__controlsSteeringWheel {
  background-color: var(--surface-raised);
  color: var(--fg);
}

@media only screen and (max-width: 1024px) {
  .__textContainer {
    padding: var(--space-sm) var(--space-lg);
    margin-bottom: var(--space-lg);
    font-size: var(--font-size-sm);
  }
}

@media only screen and (max-width: 700px) {
  .__textContainer {
    justify-content: center;
    padding: var(--space-sm) var(--space-lg);
    margin-bottom: var(--space-lg);
    font-size: var(--font-size-sm);
    min-width: 1.3rem;
    width: 1.3rem;
  }

  /* Keep the value available to screen readers when the badge collapses to its icon. */
  .__textContainer span {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
}
</style>
