<template>
  <div class="__addLaptime">
    <NewCarModal
      v-if="showNewCarModal"
      @close="showNewCarModal = false"
    />
    <NewTrackModal
      v-if="showNewTrackModal"
      @close="showNewTrackModal = false"
    />
    <NewTrackVariantModal
      v-if="showNewTrackVariantModal"
      :track-id="trackId"
      @close="showNewTrackVariantModal = false"
    />
    <NewDriverModal
      v-if="showNewDriverModal"
      @close="showNewDriverModal = false"
    />

    <div class="__heading">
      <h1>Add Laptime</h1>
    </div>
    <div class="__timeWrapper">
      <div class="__firstPanel">
        <div
          v-if="fastestLapTime"
          class="__gameInfoColumn"
        >
          <div>In game best lap: {{ fastestLapTime }}</div>
          <Button
            :type="ButtonType.SECONDARY"
            @click="setLaptime(fastestLapTime)"
          >
            Set
          </Button>
        </div>
        <div class="__inputRow">
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
              @keydown="onLaptimeInputKeyDown($event, null, 'secondsRef')"
              @input="validateLaptimeFormat()"
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
              @keydown="onLaptimeInputKeyDown($event, 'minutesRef', 'millisecondsRef')"
              @input="validateLaptimeFormat()"
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
              @keydown="onLaptimeInputKeyDown($event, 'secondsRef')"
              @input="validateLaptimeFormat()"
            >
          </div>
        </div>

        <div
          v-if="carName"
          class="__gameInfoColumn"
        >
          <div>In game car name: {{ carName }}</div>
          <Button
            v-if="canSetCar"
            :type="ButtonType.SECONDARY"
            @click="setCarName(carName)"
          >
            Set
          </Button>
          <Button
            v-if="carId && !canSetCar && !carAlreadyLinked"
            :type="ButtonType.DANGER"
            @click="linkCarToGameId(carId, carName)"
          >
            Link
          </Button>
        </div>
        <div class="__inputRow">
          <v-select
            v-model="carId"
            :tabindex="4"
            placeholder="Select car"
            :options="cars"
            :reduce="car => car.uid"
            :class="{__selected: carId}"
            label="name"
          />
          <Button
            :type="ButtonType.SUCCESS"
            @click="showNewCarModal = true"
          >
            Add
          </Button>
        </div>

        <div
          v-if="trackLocation"
          class="__gameInfoColumn"
        >
          <div>In game track location: {{ trackLocation }}</div>
          <Button
            v-if="canSetTrack"
            :type="ButtonType.SECONDARY"
            @click="setTrackLocation(trackLocation)"
          >
            Set
          </Button>
          <Button
            v-if="trackId && !canSetTrack && !trackAlreadyLinked"
            :type="ButtonType.DANGER"
            @click="linkTrackToGameId(trackId, trackLocation)"
          >
            Link
          </Button>
        </div>
        <div class="__inputRow">
          <v-select
            v-model="trackId"
            :tabindex="5"
            placeholder="Select track"
            :options="tracks"
            :reduce="track => track.uid"
            label="track"
            :class="{__selected: trackId}"
            @option:selected="trackVariant=getTrackVariants($event.uid)[0]"
          /><Button
            :type="ButtonType.SUCCESS"
            @click="showNewTrackModal = true"
          >
            Add
          </Button>
        </div>
        <div
          v-if="trackId && trackVariation"
          class="__gameInfoColumn"
        >
          <div>In game track variant: {{ trackVariation }}</div>
          <Button
            :type="ButtonType.SECONDARY"
            @click="setTrackVariation(trackVariation)"
          >
            Set
          </Button>
        </div>
        <div
          v-if="trackId"
          class="__inputRow"
        >
          <v-select
            v-model="trackVariant"
            :tabindex="6"
            placeholder="Select track variant"
            :options="getTrackVariants(trackId)"
            :class="{__selected: trackVariant}"
          /><Button
            :type="ButtonType.SUCCESS"
            @click="showNewTrackVariantModal = true"
          >
            Add
          </Button>
        </div>
        <div
          class="__inputRow"
        >
          <v-select
            v-model="driverId"
            :tabindex="7"
            placeholder="Select driver"
            :options="drivers"
            :reduce="driver => driver.uid"
            :class="{__selected: driverId}"
            label="name"
          />
          <Button
            :type="ButtonType.SUCCESS"
            @click="showNewDriverModal = true"
          >
            Add
          </Button>
        </div>
        <div class="__header __lg">
          Notes
        </div>
        <div class="__inputRow __noColumn  __lg">
          <textarea
            v-model="notes"
            class="__textarea"
            :tabindex="8"
          />
        </div>

        <div class="__header __lg">
          Game
        </div>
        <div class="__inputRow __lg">
          <RadioButtons
            :tabindex="8"
            no-any
            name="ALgame"
            :values="Object.values(Game)"
            :value="game"
            @changed="e => game = e"
          />
        </div>
      </div>

      <div class="__secondPanel">
        <div class="__header">
          Transmission
        </div>
        <div class="__inputRow __noColumn">
          <RadioButtons
            :tabindex="8"
            no-any
            name="ALtransmission"
            :values="Object.values(TransmissionType)"
            :value="transmission"
            @changed="e => transmission = e"
          />
        </div>

        <div class="__header">
          Weather
        </div>
        <div class="__inputRow __noColumn">
          <RadioButtons
            :tabindex="9"
            no-any
            name="ALweather"
            :values="Object.values(WeatherType)"
            :value="weather"
            @changed="e => weather = e"
          />
        </div>

        <div class="__header">
          Braking line
        </div>
        <div class="__inputRow __noColumn">
          <RadioButtons
            :tabindex="10"
            no-any
            name="ALbrakingLine"
            :values="Object.values(BrakingLine)"
            :value="brakingLine"
            @changed="e => brakingLine = e"
          />
        </div>

        <div class="__header">
          Controls
        </div>
        <div class="__inputRow __noColumn">
          <RadioButtons
            :tabindex="11"
            no-any
            name="ALcontrols"
            :values="Object.values(ControlType)"
            :value="controls"
            @changed="e => controls = e"
          />
        </div>

        <div class="__header">
          Start type
        </div>
        <div class="__inputRow __noColumn">
          <RadioButtons
            :tabindex="12"
            no-any
            name="ALstartType"
            :values="Object.values(StartType)"
            :value="startType"
            @changed="e => startType = e"
          />
        </div>

        <div
          v-if="canAutoSubmit"
          class="__header"
        >
          Auto submit
        </div>
        <div
          v-if="canAutoSubmit"
          class="__inputRow __noColumn __autoSubmit"
          :class="{__autoSubmitAnimation: autoSubmit}"
        >
          <input
            v-model="autoSubmit"
            type="checkbox"
          >
          <span>{{ autoSubmit ? 'on' : 'off' }}</span>
        </div>

        <div class="__header __sm">
          Game
        </div>
        <div class="__inputRow __noColumn __sm">
          <RadioButtons
            :tabindex="8"
            no-any
            name="ALgame"
            :values="Object.values(Game)"
            :value="game"
            @changed="e => game = e"
          />
        </div>

        <div class="__header __sm">
          Notes
        </div>
        <div class="__inputRow __noColumn __sm">
          <textarea
            v-model="notes"
            :tabindex="13"
          />
        </div>

        <div
          v-if="!autoSubmit"
          class="__inputRow __sm"
        >
          <Button
            :tabindex="14"
            :type="ButtonType.PRIMARY"
            block
            class="__submit"
            :disabled="!valid"
            @click="submit()"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
    <div class="__timeWrapper">
      <div
        v-if="!autoSubmit"
        class="__inputRow __lg"
      >
        <Button
          :tabindex="14"
          :type="ButtonType.PRIMARY"
          block
          class="__submit"
          :disabled="!valid"
          @click="submit()"
        >
          Submit
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { RealtimeDataListener } from '@/builders/RealtimeDataBuilder'
import NewCarModal from '@/components/add-laptime/NewCarModal.vue'
import NewDriverModal from '@/components/add-laptime/NewDriverModal.vue'
import NewTrackModal from '@/components/add-laptime/NewTrackModal.vue'
import NewTrackVariantModal from '@/components/add-laptime/NewTrackVariantModal.vue'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { Game } from '@/constants/Game'
import { RaceState } from '@/constants/RaceState'
import { ScreenType } from '@/constants/ScreenType'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import { WebsocketState } from '@/constants/WebsocketState'
import eb from '@/eventBus'
import { LaptimeFilter } from '@/store/dataStore'
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
    NewCarModal,
    NewTrackModal,
    NewTrackVariantModal,
    NewDriverModal
  }
})
export default class AddLaptime extends Vue {
  protected dataListener!: RealtimeDataListener

  carId: string | null = null
  trackId: string | null = null
  trackVariant: string | null = null
  driverId: string | null = null
  minutes: string = ''
  seconds: string = ''
  milliseconds: string = ''
  laptimeError = false
  transmission = TransmissionType.SEQUENTIAL
  weather = WeatherType.SUN
  brakingLine = BrakingLine.OFF
  controls = ControlType.STEERING_WHEEL
  startType = StartType.RUNNING
  game = Game.PC2
  notes = ''
  showNewDriverModal = false
  showNewCarModal = false
  showNewTrackModal = false
  showNewTrackVariantModal = false
  autoSubmit = false
  lastRaceState = RaceState.MENU

  created () {
    this.dataListener = this.$rdb.addListener(this.onRealTimeDataReceived)
  }

  get cars () {
    return this.$dataStore.cars
  }

  get tracks () {
    return this.$dataStore.tracks
  }

  get drivers () {
    return this.$dataStore.drivers
  }

  get trackLocation () {
    return this.$realtimeDataStore.trackLocation
  }

  get trackVariation () {
    return this.$realtimeDataStore.trackVariation
  }

  get participants () {
    return this.$realtimeDataStore.participants
  }

  get websocketState () {
    return this.$dataStore.websocketState
  }

  get carName () {
    return this.$realtimeDataStore.carName
  }

  get laptime () {
    const [m, s, ms] = [this.minutes, this.seconds, this.milliseconds]
    if (!m || !s || !ms) return

    return this.$ltb.isLaptimeValid(m, s, ms) ? this.$ltb.laptimeFromComponents(m, s, ms) : undefined
  }

  get valid () {
    return this.carId && this.trackId && this.trackVariant && this.driverId && this.laptime && !this.laptimeError && this.transmission && this.weather && this.brakingLine
  }

  get fastestLapTime () {
    const participantId = this.$rdb.getHostname() === 'wallpc' ? 0 : 1
    if (this.participants.length === 0 || !this.participants[participantId]?.fastestLapTime) return

    const d = new Date(this.participants[participantId].fastestLapTime * 1000)
    return this.$ltb.dateToLaptime(d)
  }

  get canAutoSubmit () {
    return this.websocketState === WebsocketState.ESTABLISHED && this.driverId
  }

  get canSetCar () {
    return Boolean(this.$dataStore.getCarByGameId(this.carName))
  }

  get carAlreadyLinked () {
    const car = this.$dataStore.getCarById(this.carId!)
    return car && car.gameId
  }

  get canSetTrack () {
    return Boolean(this.$dataStore.getTrackByGameId(this.trackLocation))
  }

  get trackAlreadyLinked () {
    const track = this.$dataStore.getTrackById(this.trackId!)
    return track && track.gameId
  }

  onLaptimeInputKeyDown (e: any, leftInput: string, rightInput: string) {
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

  onRealTimeDataReceived (data: any) {
    data = data.data
    if ('raceState' in data) {
      if (this.autoSubmit) this.handleAutoSubmit(data.raceState)
      this.lastRaceState = data.raceState
    }
  }

  linkCarToGameId (carId: string, gameId: string) {
    this.$dataStore.linkCarToGameId(carId, gameId)
  }

  linkTrackToGameId (trackId: string, gameId: string) {
    this.$dataStore.linkTrackToGameId(trackId, gameId)
  }

  validateLaptimeFormat () {
    this.laptimeError = !this.laptime || this.laptime.match(/^\d{1,2}:\d{2}.\d{3}$/) === null
  }

  submit () {
    const laptime: Laptime = {
      uid: '',
      carId: this.carId!,
      trackId: this.trackId!,
      trackVariant: this.trackVariant!,
      driverId: this.driverId!,
      laptime: this.laptime!,
      transmission: this.transmission,
      weather: this.weather,
      brakingLine: this.brakingLine,
      controls: this.controls,
      startType: this.startType,
      date: new Date().getTime(),
      game: this.game,
      notes: this.notes
    }
    this.$dataStore.addLaptime(laptime)
    if (!this.autoSubmit) {
      this.driverId = null
    }
    this.showTimeInTable(laptime)
    this.$toast.success('Laptime added successfully!', {
      duration: 3000,
      maxToasts: 1,
      queue: false
    })
  }

  showTimeInTable ({ carId, trackId, trackVariant }: Laptime) {
    eb.emit('filter:clear')
    eb.emit('filter:set', { carId, trackId, trackVariant } as LaptimeFilter)
    this.$dataStore.showScreen(ScreenType.LAPTIME_BOARD)
  }

  setLaptime (laptime: string) {
    console.log('Set laptime', laptime)
    const d = this.$ltb.laptimeToDate(laptime)
    this.minutes = `${d?.getMinutes()}`
    this.seconds = `${d?.getSeconds()}`.padStart(2, '0')
    this.milliseconds = `${d?.getMilliseconds()}`.padStart(3, '0')
  }

  setCarName (carName: string) {
    const car = this.$dataStore.getCarByGameId(carName)
    if (!car) {
      this.$toast.error('Unable to set car. Car does not exist.')
      return
    }
    this.carId = car.uid
  }

  setTrackLocation (trackLocation: string) {
    const track = this.$dataStore.getTrackByGameId(trackLocation)
    if (!track) {
      this.$toast.error('Unable to set track. Track does not exist.')
      return
    }
    this.trackId = track.uid
  }

  getTrackVariants (trackId: string) {
    return this.$dataStore.getTrackVariants(trackId)
  }

  setTrackVariation (trackVariation: string) {
    const variant = this.getTrackVariants(this.trackId!)?.find(x => x.includes(trackVariation.replace('_', ' ')))
    if (!variant) {
      this.$toast.error('Unable to set track variant. Track variant does not exist.')
      return
    }
    this.trackVariant = variant
  }

  handleAutoSubmit (raceState: RaceState) {
    if (this.lastRaceState === RaceState.RACE_IS_ON && raceState === RaceState.RACE_FINISHED) {
      this.$dataStore.showScreen(ScreenType.ADD_LAPTIME)
      setTimeout(() => {
        this.setLaptime(this.fastestLapTime!)
        this.setCarName(this.carName)
        this.setTrackLocation(this.trackLocation)
        this.setTrackVariation(this.trackVariation)
        if (this.valid) this.submit()
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.__heading {
  text-align: center;
}

.__timeWrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 2rem;
  margin: 0 auto;
  text-align: center;
}

.__inputRow {
  display: flex;
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  justify-content: center;
}

.__noColumn {
  flex-direction: row !important;
  border-bottom: 0.1rem solid white;
}

.__noColumn > div {
  padding: 0.5rem 1rem;
}

.__firstPanel, .__secondPanel {
  width: 40%;
}

.__lg {
  display: inherit;
}

.__sm {
  display: none;
}

.__raceState {
  text-transform: uppercase;
  font-size: 1.3rem;
  padding: 0 0 0 1rem;
}

@media only screen and (max-width: 1280px) {
  .__timeWrapper {
    flex-direction: row;
  }

  .__firstPanel, .__secondPanel {
    width: 40%;
  }
}

@media only screen and (max-width: 700px) {
  .__timeWrapper {
    flex-direction: column;
    width: 100%;
    padding: 1rem;
  }

  .__firstPanel, .__secondPanel {
    width: 100%;
  }

  .__inputRow {
    flex-direction: column;
  }
  .__lg {
    display: none;
  }

  .__sm {
    display: inherit;
  }
}

.__laptimeInputs {
  border-radius: 0.3rem;
  display: flex;
    width: 100%;

  .__minutes {
    width: 100%;
    text-align: right;
    border-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    padding-right: 0.3rem;
  }

  .__seconds {
    width: 3.1rem;
    border-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    text-align: center;
    padding-left: 0.3rem;
    padding-right: 0.3rem;
  }

  .__milliseconds {
    width: 100%;
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    padding-left: 0.3rem;
  }

  .__colon, .__dot {
    background-color: white;
    color: var(--text-dark1);
    font-size: 2rem;
    padding-top: 0.45rem;
    border-top: 0.1rem solid black;
    border-bottom: 0.1rem solid black;
  }

  input {
    font-size: 2rem;

    &:focus {
      outline: 0;
    }
  }

  &.__error {
    .__minutes {
      border: 0.15rem solid red;
      color: red;
      border-right: none;
    }
    .__seconds,  .__colon,  .__dot {
      border: 0.15rem solid red;
      color: red;
      border-right: none;
      border-left: none;
    }

    .__milliseconds {
      border: 0.15rem solid red;
      color: red;
      border-left: none;
    }
  }
}

.__submit {
  width: 100%;
  font-size: 2rem;
  margin: 0 auto !important;
}

@keyframes blinking {
  0% {
    background-color: green;
  }
  75% {
    background-color: blue;
  }
}

.__autoSubmitAnimation {
    background-color: green;
  /* animation: blinking 1s linear infinite; */
}

.__selectLabel {
  text-align: left;
}

.__brakingLine {
  width: 5rem;
}

.__header {
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 1.1rem;
}

.__selected {
  :deep(.vs__dropdown-toggle) {
    border: 0.1rem solid #4081C2;
    box-shadow: 0px 0px 5px 2px #4081C2;
  }

  :deep(span.vs__selected) {
    color: #4081C2;
    font-weight: bold;
  }
}

.__gameInfoColumn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}

textarea {
  width: 100%;
  background-color: var(--bg-light1);
  border-radius: 0.3rem;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 0.1rem solid black;
}

.__lg > textarea {
  height: 7rem;
}

.__autoSubmit {
  align-items: center;

  input[type=checkbox] {
    width: 1.7rem;
    height: 1.7rem;
    display: inline-block;
    border-radius: 0.3rem;
    margin: 0.5rem;
  }
}

</style>
