import BrakingLine from '@/constants/BrakingLine'
import WeatherType from '@/constants/WeatherType'
import TransmissionType from '@/constants/TransmissionType'
import ControlType from '@/constants/ControlType'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['getCarById', 'getTrackById', 'getDriverById', 'getTrackVariants'])
  },
  methods: {
    getDriver (time) {
      const driver = this.getDriverById(time.driverId)
      return driver ? driver.name : 'Loading...'
    },
    getTrack (time) {
      const track = this.getTrackById(time.trackId)
      return track ? `${track.track} - ${time.trackVariant}` : 'Loading...'
    },
    getTrackName (time) {
      const track = this.getTrackById(time.trackId)
      return track ? track.track : 'Loading...'
    },
    getCar (time) {
      const car = this.getCarById(time.carId)
      return car ? car.name : 'Loading...'
    },
    getCarImage (time) {
      const car = this.getCarById(time.carId)
      if (!car.imageUrl) return false
      return car ? `images/${car.imageUrl}` : 'Loading...'
    },
    getRowTitleText (laptime) {
      const date = new Date(laptime.date).toLocaleString()
      let result = `Date: ${date}`
      if (laptime.notes) result += `\nNotes: ${laptime.notes}`
      return result
    },
    brakingLineClass (brakingLine) {
      return {
        __brakingLineOn: brakingLine === BrakingLine.ON,
        __brakingLineOff: brakingLine === BrakingLine.OFF
      }
    },
    weatherClass (weather) {
      return {
        __weatherSunny: weather === WeatherType.SUN,
        __weatherRainy: weather === WeatherType.RAIN,
        __weatherSnow: weather === WeatherType.SNOW
      }
    },
    weatherIcon (weather) {
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
    transmissionClass (transmission) {
      return {
        __transmissionAutomatic: transmission === TransmissionType.AUTOMATIC,
        __transmissionSequential: transmission === TransmissionType.SEQUENTIAL,
        __transmissionHPattern: transmission === TransmissionType.H_PATTERN
      }
    },
    transmissionIcon (transmission) {
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
    controlsClass (controls) {
      return {
        __controlsKeyboard: controls === ControlType.KEYBOARD,
        __controlsGamepad: controls === ControlType.GAMEPAD,
        __controlsSteeringWheel: controls === ControlType.STEERING_WHEEL
      }
    }
  }
}
