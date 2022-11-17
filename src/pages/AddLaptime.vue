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
        <InputRow
          :label="fastestLapTime ? `In game best lap: ${fastestLapTime}` : ''"
          :show-set-button="fastestLapTime"
          @set="onLaptimeSet(fastestLapTime)"
        >
          <LaptimeInput ref="laptimeInput" />
        </InputRow>

        <InputRow
          :label="carName ? `In game car name: ${carName}` : ''"
          :show-add-button="true"
          :show-set-button="canSetCar"
          :show-link-button="carId && !canSetCar && !carAlreadyLinked"
          @set="setCarName(carName)"
          @link="linkCarToGameId(carId, carName)"
          @add="showNewCarModal = true"
        >
          <SelectInput
            ref="carInput"
            v-model="carId"
            :options="cars"
            :reduce="o => o.uid"
            placeholder="Select car"
            label="name"
          />
        </InputRow>

        <InputRow
          :label="trackLocation ? `In game track location: ${trackLocation}` : ''"
          :show-add-button="true"
          :show-set-button="canSetTrack"
          :show-link-button="trackId && !canSetTrack && !trackAlreadyLinked"
          @set="setTrackLocation(trackLocation)"
          @link="linkTrackToGameId(trackId, trackLocation)"
          @add="showNewTrackModal = true"
        >
          <SelectInput
            ref="trackInput"
            v-model="trackId"
            :options="tracks"
            :reduce="o => o.uid"
            placeholder="Select track"
            label="track"
            @update:model-value="trackVariant = getTrackVariants($event.uid)[0]"
          />
        </InputRow>

        <InputRow
          v-if="trackId"
          :label="trackVariation ? `In game track variant: ${trackVariation}` : ''"
          :show-add-button="true"
          :show-set-button="canSetTrack"
          @set="setTrackVariation(trackVariation)"
          @link="linkTrackToGameId(trackId, trackLocation)"
          @add="showNewTrackVariantModal = true"
        >
          <SelectInput
            ref="trackVariantInput"
            v-model="trackVariant"
            placeholder="Select track variant"
            :options="getTrackVariants(trackId)"
            :reduce="o => o"
          />
        </InputRow>
        <InputRow
          :show-add-button="true"
          @add="showNewDriverModal = true"
        >
          <SelectInput
            ref="driverInput"
            v-model="driverId"
            :options="drivers"
            :reduce="o => o.uid"
            placeholder="Select driver"
            label="name"
          />
        </InputRow>

        <InputRow
          class="__lg"
          heading="Notes"
          :border-bottom="true"
        >
          <textarea
            v-model="notes"
            class="__textarea"
          />
        </InputRow>

        <InputRow
          heading="Game"
          class="__lg"
        >
          <RadioButtons
            :no-any="true"
            name="ALgame"
            :values="Object.values(Game)"
            :value="game"
            @changed="e => game = e"
          />
        </InputRow>
      </div>

      <div class="__secondPanel">
        <InputRow
          heading="Transmission"
          :border-bottom="true"
        >
          <RadioButtons
            :no-any="true"
            name="ALtransmission"
            :values="Object.values(TransmissionType)"
            :value="transmission"
            @changed="e => transmission = e"
          />
        </InputRow>

        <InputRow
          heading="Weather"
          :border-bottom="true"
        >
          <RadioButtons
            :tabindex="9"
            :no-any="true"
            name="ALweather"
            :values="Object.values(WeatherType)"
            :value="weather"
            @changed="e => weather = e"
          />
        </InputRow>

        <InputRow
          heading="Braking line"
          :border-bottom="true"
        >
          <RadioButtons
            :no-any="true"
            name="ALbrakingLine"
            :values="Object.values(BrakingLine)"
            :value="brakingLine"
            @changed="e => brakingLine = e"
          />
        </InputRow>

        <InputRow
          heading="Controls"
          :border-bottom="true"
        >
          <RadioButtons
            :no-any="true"
            name="ALcontrols"
            :values="Object.values(ControlType)"
            :value="controls"
            @changed="e => controls = e"
          />
        </InputRow>

        <InputRow
          heading="Start type"
          :border-bottom="true"
        >
          <RadioButtons
            :no-any="true"
            name="ALstartType"
            :values="Object.values(StartType)"
            :value="startType"
            @changed="e => startType = e"
          />
        </InputRow>

        <InputRow
          v-if="canAutoSubmit"
          heading="Auto submit"
        >
          <div
            class="__autoSubmit"
            :class="{__autoSubmitAnimation: autoSubmit}"
          >
            <input
              :checked="autoSubmit"
              type="checkbox"
              @change="toggleAutoSubmit()"
            >
            <span>{{ autoSubmit ? 'on' : 'off' }}</span>
          </div>
        </InputRow>

        <InputRow
          heading="Game"
          class="__sm"
        >
          <RadioButtons
            no-any
            name="ALgame"
            :values="Object.values(Game)"
            :value="game"
            @changed="e => game = e"
          />
        </InputRow>

        <InputRow
          heading="Notes"
          class="__sm"
        >
          <textarea v-model="notes" />
        </InputRow>

        <InputRow
          v-if="!autoSubmit"
          class="__sm"
        >
          <Button
            :type="ButtonType.PRIMARY"
            :block="true"
            class="__submit"
            :disabled="!valid"
            @click="submit()"
          >
            Submit
          </Button>
        </InputRow>
      </div>
    </div>

    <div class="__timeWrapper __lg">
      <Button
        v-if="!autoSubmit"
        :type="ButtonType.PRIMARY"
        :block="true"
        class="__submit"
        :disabled="!valid"
        @click="submit()"
      >
        Submit
      </Button>
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
import LaptimeInput from '@/components/add-laptime/LaptimeInput.vue'
import InputRow from '@/components/add-laptime/InputRow.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import eb from '@/eventBus'
import { LaptimeFilter } from '@/store/dataStore'
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
    NewCarModal,
    NewTrackModal,
    NewTrackVariantModal,
    NewDriverModal,
    LaptimeInput,
    InputRow,
    SelectInput
  }
})
export default class AddLaptime extends Vue {
  protected dataListener!: RealtimeDataListener

  carId: string | null = null
  trackId: string | null = null
  trackVariant: string | null = null
  driverId: string | null = null
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
  lastRaceState = RaceState.MENU

  $refs!: {
    laptimeInput: InstanceType<typeof LaptimeInput>,
    carInput: InstanceType<typeof SelectInput>,
    trackInput: InstanceType<typeof SelectInput>,
    trackVariantInput: InstanceType<typeof SelectInput>
  }

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

  get websocketState () {
    return this.$dataStore.websocketState
  }

  get carName () {
    return this.$realtimeDataStore.carName
  }

  get valid () {
    return this.carId && this.trackId && this.trackVariant && this.driverId && this.$refs.laptimeInput.valid && this.transmission && this.weather && this.brakingLine
  }

  get canAutoSubmit () {
    return this.websocketState === WebsocketState.ESTABLISHED && this.driverId
  }

  get autoSubmit () {
    return this.$dataStore.autoSubmit
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

  get participants () {
    return this.$realtimeDataStore.participants
  }

  get fastestLapTime () {
    const participantId = this.$rdb.getHostname() === 'wallpc' ? 0 : 1
    if (this.participants.length === 0 || !this.participants[participantId]?.fastestLapTime) return

    const d = new Date(this.participants[participantId].fastestLapTime * 1000)
    return this.$ltb.dateToLaptime(d)
  }

  onRealTimeDataReceived (data: any) {
    data = data.data
    if ('raceState' in data) {
      if (this.autoSubmit) this.handleAutoSubmit(data.raceState)
      this.lastRaceState = data.raceState
    }
  }

  onLaptimeSet (laptime: string) {
    this.$refs.laptimeInput.setLaptime(laptime)
  }

  toggleAutoSubmit () {
    this.$dataStore.toggleAutoSubmit()
  }

  linkCarToGameId (carId: string, gameId: string) {
    this.$dataStore.linkCarToGameId(carId, gameId)
  }

  linkTrackToGameId (trackId: string, gameId: string) {
    this.$dataStore.linkTrackToGameId(trackId, gameId)
  }

  submit () {
    const laptime: Laptime = {
      uid: '',
      carId: this.carId!,
      trackId: this.trackId!,
      trackVariant: this.trackVariant!,
      driverId: this.driverId!,
      laptime: this.$refs.laptimeInput.laptime!,
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
    this.$dataStore.showScreen(ScreenType.BROWSE_TIMES)
    eb.emit('filter:clear')
    setTimeout(() => {
      eb.emit('filter:set', { carId, trackId, trackVariant } as LaptimeFilter)
    }, 500)
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
        this.$refs.laptimeInput.setLaptime(this.fastestLapTime!)
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
.__addLaptime {
  padding: 2rem 0 1rem;

  .__heading {
    text-align: center;
  }

  .__timeWrapper {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    margin: 0 auto;
    text-align: center;
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

  :deep(.__input) {
    justify-content: center;
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

    .__lg {
      display: none;
    }

    .__sm {
      display: inherit;
    }
  }

  .__submit {
    width: 90%;
    font-size: 2rem;
    margin: 0 auto;
  }

  .__brakingLine {
    width: 5rem;
  }

  textarea {
    width: 100%;
    background-color: var(--bg-light1);
    border-radius: 0.3rem;
    padding: 0.5rem;
    border: 0.1rem solid black;
  }

  .__lg textarea {
    height: 7rem;
  }

  .__autoSubmitAnimation {
    border-radius: 0.3rem;
  }

  .__autoSubmit {
    display: flex;
    align-items: center;
    padding: 0 0.5rem;

    input[type=checkbox] {
      width: 1.7rem;
      height: 1.7rem;
      display: inline-block;
      border-radius: 0.3rem;
      margin: 0.5rem;
    }
  }
}

</style>
