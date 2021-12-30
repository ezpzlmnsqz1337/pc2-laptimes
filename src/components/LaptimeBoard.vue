<template>
  <div class="__laptimeBoardWrapper">
    <div class="__filter">
      <h2>Filter times</h2>
      <div class="__inputRow">
        <!-- object value -->
        <v-select
          :model-value="carId"
          placeholder="Select car"
          :options="cars"
          :reduce="car => car.uid"
          label="name"
          :class="{__activeFilter: carId}"
          @update:model-value="setFilter({carId: $event})"
        />
      </div>
      <div class="__inputRow">
        <v-select
          :model-value="trackId"
          placeholder="Select track"
          :options="tracks"
          :reduce="track => track.uid"
          label="track"
          :class="{__activeFilter: trackId}"
          @update:model-value="setFilter({trackId: $event})"
        />
      </div>
      <div
        v-if="trackId"
        class="__inputRow"
      >
        <v-select
          :model-value="trackVariant"
          placeholder="Select track variant"
          :options="getTrackVariants(trackId)"
          :class="{__activeFilter: trackVariant}"
          @update:model-value="setFilter({trackVariant: $event})"
        />
      </div>
      <div
        class="__inputRow"
      >
        <v-select
          :model-value="driverId"
          placeholder="Select driver"
          :options="drivers"
          :reduce="driver => driver.uid"
          label="name"
          :class="{__activeFilter: driverId}"
          @update:model-value="setFilter({driverId: $event})"
        />
      </div>
      <div class="__header">
        Transmission
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="transmission"
          :values="Object.values(TransmissionType)"
          :value="transmission"
          @changed="e => setFilter({transmission: e})"
        />
      </div>

      <div class="__header">
        Weather
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="weather"
          :values="Object.values(WeatherType)"
          :value="weather"
          @changed="e => setFilter({weather: e})"
        />
      </div>

      <div class="__header">
        Braking line
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="brakingLine"
          :values="Object.values(BrakingLine)"
          :value="brakingLine"
          @changed="e => setFilter({brakingLine: e})"
        />
      </div>

      <div class="__header">
        Controls
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="controls"
          :values="Object.values(ControlType)"
          :value="controls"
          @changed="e => setFilter({controls: e})"
        />
      </div>

      <div class="__header">
        Start type
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="startType"
          :values="Object.values(StartType)"
          :value="startType"
          @changed="e => setFilter({startType: e})"
        />
      </div>

      <div class="__header">
        Distinct
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="distinct"
          :values="Object.values(Distinct)"
          :value="distinct"
          @changed="e => setFilter({distinct: e})"
        />
      </div>

      <Button
        :type="ButtonType.SECONDARY"
        @click="clearFilter()"
      >
        Clear filter
      </Button>
    </div>
    <div class="__laptimeBoard">
      <h2>Laptime board</h2>
      <table>
        <tr class="__row __header">
          <th>Rank</th>
          <th>Driver</th>
          <th>Laptime</th>
          <th>Losing</th>
          <th>Car</th>
          <th>Track</th>
          <th>Settings</th>
        </tr>
        <tr
          v-for="(time, index) in times"
          :key="index"
          class="__row"
          :title="getRowTitleText(time)"
        >
          <td class="__id">
            {{ index+1 }}.
          </td>
          <td class="__driver">
            <div @click="setFilter({driverId: time.driverId})">
              <EditableSelect
                label="name"
                :text="getDriver(time)"
                :options="drivers"
                @value:update="updateLaptime({uid: time.uid, driverId: $event.uid})"
              />
            </div>
          </td>
          <td class="__laptime">
            {{ time.laptime }}
          </td>
          <td class="__losing">
            <span v-if="index > 0">{{ getLaptimeDiff(time.laptime) }}</span>
          </td>
          <td class="__car">
            <div @click="setFilter({carId: time.carId})">
              <EditableSelect
                :text="getCarById(time.carId).name"
                :options="cars"
                @value:update="updateLaptime({uid: time.uid, carId: $event.uid})"
              />
            </div>
          </td>
          <td class="__track">
            <div @click="setFilter({trackId: time.trackId})">
              <EditableSelect
                label="track"
                :text="getTrackById(time.trackId).track"
                :options="tracks"
                @value:update="updateLaptime({uid: time.uid, trackId: $event.uid})"
              />
            </div>
            <div @click="setFilter({trackId: time.trackId, trackVariant: time.trackVariant})">
              <EditableSelect
                :text="time.trackVariant"
                :options="getTrackVariants(trackId)"
                @value:update="updateLaptime({uid: time.uid, trackVariant: $event})"
              />
            </div>
          </td>
          <td class="__settings">
            <div
              :class="transmissionClass(time.transmission)"
              @click="setFilter({transmission: time.transmission})"
            >
              <EditableSelect
                :text="time.transmission"
                :icon="time.transmission"
                :options="Object.values(TransmissionType).map(x => ({name: x}))"
                @value:update="updateLaptime({uid: time.uid, transmission: $event.name})"
              />
            </div>
            <div
              :class="weatherClass(time.weather)"
              @click="setFilter({weather: time.weather})"
            >
              <EditableSelect
                :text="time.weather"
                :icon="weatherIcon(time.weather)"
                :options="Object.values(WeatherType).map(x => ({name: x}))"
                @value:update="updateLaptime({uid: time.uid, weather: $event.name})"
              />
            </div>
            <div
              :class="brakingLineClass(time.brakingLine)"
              @click="setFilter({brakingLine: time.brakingLine})"
            >
              <EditableSelect
                :text="time.brakingLine"
                :icon="time.brakingLine === BrakingLine.ON ? 'check-circle' : 'times-circle'"
                :options="Object.values(BrakingLine).map(x => ({name: x}))"
                @value:update="updateLaptime({uid: time.uid, brakingLine: $event.name})"
              />
            </div>
            <div
              :class="controlsClass(time.controls)"
              @click="setFilter({controls: time.controls})"
            >
              <EditableSelect
                :text="time.controls"
                :icon="time.controls"
                :options="Object.values(ControlType).map(x => ({name: x}))"
                @value:update="updateLaptime({uid: time.uid, controls: $event.name})"
              />
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import BrakingLine from '@/constants/BrakingLine'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import WeatherType from '@/constants/WeatherType'
import TransmissionType from '@/constants/TransmissionType'
import ControlType from '@/constants/ControlType'

export default {
  name: 'LaptimeBoard',
  computed: {
    ...mapState(['cars', 'tracks', 'drivers', 'times']),
    ...mapGetters(['getCarById', 'getTrackById', 'getDriverById', 'getTrackVariants']),
    ...mapState('laptimeFilter', ['carId', 'trackId', 'trackVariant', 'driverId', 'transmission', 'weather', 'brakingLine', 'controls', 'startType', 'distinct']),
    ...mapGetters('laptimeFilter', ['getFilter']),
    firstLaptime () {
      return this.times[0].laptime
    }
  },
  methods: {
    ...mapMutations('laptimeFilter', { sf: 'setFilter', cf: 'clearFilter' }),
    ...mapActions(['updateLaptime', 'getTimes']),
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
    controlsClass (controls) {
      return {
        __controlsKeyboard: controls === ControlType.KEYBOARD,
        __controlsGamepad: controls === ControlType.GAMEPAD,
        __controlsSteeringWheel: controls === ControlType.STEERING_WHEEL
      }
    },
    setFilter (filter) {
      filter = { ...this.getFilter(), ...filter }
      this.sf(filter)
      this.getTimes(filter)
    },
    clearFilter () {
      this.cf()
      this.getTimes(this.getFilter())
    },
    getLaptimeDiff (laptime) {
      const SECONDS_LENGTH = 2
      const MILLISECONDS_LENGTH = 3

      const pattern = /^(\d{1,2}):(\d{2})\.(\d{3})$/

      const l1 = this.firstLaptime.match(pattern)
      const l2 = laptime.match(pattern)

      const time1 = new Date(parseInt(l1[1]) * 60 * 1000 + parseInt(l1[2]) * 1000 + parseInt(l1[3]))
      const time2 = new Date(parseInt(l2[1]) * 60 * 1000 + parseInt(l2[2]) * 1000 + parseInt(l2[3]))

      const diff = new Date(time2.getTime() - time1.getTime())

      const [m, s, ms] = [diff.getMinutes(), diff.getSeconds(), diff.getMilliseconds()].map(x => String(x))
      return `+ ${m}:${s.padStart(SECONDS_LENGTH, '0')}.${ms.padStart(MILLISECONDS_LENGTH, '0')}`
    },
    getDriver (time) {
      const driver = this.getDriverById(time.driverId)
      return driver ? driver.name : 'Loading'
    }
  }
}
</script>

<style scoped>
.__laptimeBoardWrapper {
  padding: 2rem;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.__laptimeBoard {
  padding: 1rem;
  border-radius: 0.3rem;
}

.__filter {
  padding: 1rem;
}

.__activeFilter :deep(.vs__dropdown-toggle) {
  border: 0.1rem solid #4081C2;
  box-shadow: 0px 0px 5px 2px #4081C2;
}

.__activeFilter :deep(span.vs__selected) {
  color: #4081C2;
  font-weight: bold;
}

.__laptimeBoard table {
  min-width: 55vw;
  overflow: hidden;
  border-spacing:0;
  border-radius: 0.3rem;
  font-size: 1rem;
}

th {
  border-bottom: 1px solid var(--border-dark1);
  background-color: #4081c2;
  color: var(--text-light1);
  padding: 1rem 0.5rem;
}

tr:nth-child(even) {
  background-color: #888888;
}

tr:nth-child(odd) {
  color: var(--text-dark1);
  background-color: white;
}

tr:hover {
  color: var(--text-dark1);
  background-color: #93c4f5;
}

td {
  padding: 0.5rem;
}

td div:hover {
  cursor: pointer;
  color: var(--hover);
}

.__id, .__driver  {
  font-weight: bold;
}

tr:nth-child(2) :deep(.__driver span) {
  color: gold;
  background-color: var(--bg-dark3);
  padding: 0.2rem;
}

tr:nth-child(3) :deep(.__driver span) {
  color: silver;
  background-color: var(--bg-dark3);
  padding: 0.2rem;
}

tr:nth-child(4) :deep(.__driver span) {
  color: #cd7f32;
  background-color: var(--bg-dark3);
  padding: 0.2rem;
}

.__losing span{
  white-space: nowrap;
  color: #c20000;
}

.__weatherSunny {
  background-color: #fbff00;
  color: var(--text-dark1);
}

.__weatherRainy {
  background-color: #274db4;
  color: var(--text-light1);
}

.__weatherSnow {
  background-color: #f3f3f3;
  color: var(--text-dark1);
}

.__brakingLineOff {
  background-color: #e00707;
  color: var(--text-light1);
}

.__brakingLineOn {
  background-color: #059711;
  color: var(--text-light1);
}

.__transmissionAutomatic {
  background-color: #059711;
  color: var(--text-light1);
}

.__transmissionSequential {
  background-color: #274db4;
  color: var(--text-light1);
}

.__transmissionHPattern {
  background-color: #954401;
  color: var(--text-light1);
}

.__controlsKeyboard {
  background-color: #059711;
  color: var(--text-light1);
}

.__controlsGamepad {
  background-color: #233974;
  color: var(--text-light1);
}

.__controlsSteeringWheel {
  background-color: #424242;
  color: var(--text-light1);
}

.__settings:hover {
  cursor: pointer;
}

.__settings > div {
  padding: 0.3rem;
  border-radius: 0.3rem;
  margin-bottom: 0.3rem;
  font-size: 0.7rem;
  min-width: 6rem;
}

@media only screen and (max-width: 1024px) {
  .__laptimeBoardWrapper {
    flex-direction: column;
    align-items: center;
  }

  .__laptimeBoard table {
    width: 90vw;
  }

  .__filter {
    width: 50%;
  }
}

@media only screen and (max-width: 700px) {
  .__laptimeBoardWrapper {
    padding: 1rem;
  }

  .__laptimeBoard table {
    font-size: 0.5rem;
  }

  th {
    border-bottom: 1px solid var(--border-dark1);
    background-color: #4081c2;
    color: var(--text-light1);
    padding: 1rem 0.2rem;
  }

  td {
    padding: 0.2rem;
  }

  .__filter {
    padding: 0;
    width: 100%;
  }

  .__laptimeBoard {
    padding: 0;
  }
}
</style>
