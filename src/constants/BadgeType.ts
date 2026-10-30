import type { BrakingLine } from '@/constants/BrakingLine'
import type { ControlType } from '@/constants/ControlType'
import type { TransmissionType } from '@/constants/TransmissionType'
import type { WeatherType } from '@/constants/WeatherType'

export enum BadgeType {
  TRANSMISSION = 'transmission',
  BRAKING_LINE = 'brakingLine',
  CONTROLS = 'controls',
  WEATHER = 'weather'
}

export type BadgeValue = TransmissionType | BrakingLine | ControlType | WeatherType
