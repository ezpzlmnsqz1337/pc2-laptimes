import { BrakingLine } from '@/constants/BrakingLine'
import { WeatherType } from '@/constants/WeatherType'
import { TransmissionType } from '@/constants/TransmissionType'
import { ControlType } from '@/constants/ControlType'
import { Laptime } from '@/builders/LaptimeBuilder'

export const tableMixin = {
  getDriver (time: Laptime) {
    const driver = this.$dataStore.getDriverById(time.driverId)
    return driver ? driver.name : 'Loading...'
  },

  getTrack (time: Laptime) {
    const track = this.$dataStore.getTrackById(time.trackId)
    return track ? `${track.track} - ${time.trackVariant}` : 'Loading...'
  },

  getTrackName (time: Laptime) {
    const track = this.$dataStore.getTrackById(time.trackId)
    return track ? track.track : 'Loading...'
  },

  getCar (time: Laptime) {
    const car = this.$dataStore.getCarById(time.carId)
    return car ? car.name : 'Loading...'
  },

  getCarImage (time: Laptime) {
    const car = this.$dataStore.getCarById(time.carId)
    if (!car?.imageUrl) return false
    return car ? `images/${car.imageUrl}` : 'Loading...'
  },

  getRowTitleText (laptime: Laptime) {
    const date = new Date(laptime.date).toLocaleString()
    let result = `Date: ${date}`
    if (laptime.notes) result += `\nNotes: ${laptime.notes}`
    return result
  },

  getBrakingLineClass (brakingLine: BrakingLine) {
    return {
      __brakingLineOn: brakingLine === BrakingLine.ON,
      __brakingLineOff: brakingLine === BrakingLine.OFF
    }
  },

  getWeatherClass (weather: WeatherType) {
    return {
      __weatherSunny: weather === WeatherType.SUN,
      __weatherRainy: weather === WeatherType.RAIN,
      __weatherSnow: weather === WeatherType.SNOW
    }
  },

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
  },

  getTransmissionClass (transmission: TransmissionType) {
    return {
      __transmissionAutomatic: transmission === TransmissionType.AUTOMATIC,
      __transmissionSequential: transmission === TransmissionType.SEQUENTIAL,
      __transmissionHPattern: transmission === TransmissionType.H_PATTERN
    }
  },

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
  },

  getControlsClass (controls: ControlType) {
    return {
      __controlsKeyboard: controls === ControlType.KEYBOARD,
      __controlsGamepad: controls === ControlType.GAMEPAD,
      __controlsSteeringWheel: controls === ControlType.STEERING_WHEEL
    }
  }
}
