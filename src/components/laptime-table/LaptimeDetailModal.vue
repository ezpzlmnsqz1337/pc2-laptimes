<template>
  <Modal
    @close="$emit('close')"
  >
    <template #header>
      <div class="__header">
        <Button
          v-if="isLocal() && !editEnabled"
          class="__edit"
          :type="ButtonType.SECONDARY"
          @click="showLoginModal()"
        >
          <div
            class="fa fa-pen"
          /><span>Edit</span>
        </Button>
        <Button
          v-if="editEnabled"
          class="__delete"
          :type="ButtonType.DANGER"
          @click="deleteLaptime(laptimeId)"
        >
          <div
            class="fa fa-trash"
          /><span>Delete</span>
        </Button>
        <h2>Laptime detail</h2>
      </div>
    </template>
    <template #body>
      <Modal
        v-show="showLogin"
        class="__authorizeModal"
        @close="$emit('close')"
      >
        <template #header>
          <h2>Enter password</h2>
        </template>
        <template
          #body
        >
          <input
            ref="passwordInputRef"
            v-model="password"
            type="password"
            @keypress.enter="login()"
          >
          <Button
            :type="ButtonType.PRIMARY"
            @click="login()"
          >
            Authorize
          </Button>
        </template>
      </Modal>
      <div class="__wrapper">
        <div class="__firstPanel">
          <InputRow>
            <LaptimeInput
              :value="laptime"
              :disabled="!editEnabled"
              @changed="updateLaptime({ laptime: $event}, laptime)"
            />
          </InputRow>

          <InputRow>
            <SelectInput
              :model-value="laptime.carId"
              :options="cars"
              :reduce="(car: typeof Car) => car.uid"
              placeholder="Select car"
              label="name"
              :clearable="false"
              :disabled="!editEnabled"
              @update:model-value="updateLaptime({ carId: $event}, laptime)"
            />
          </InputRow>
          <img
            v-if="getCarImage(laptime)"
            class="__carImage"
            :src="getCarImage(laptime)"
            :alt="getCarName(laptime)"
          >

          <InputRow>
            <SelectInput
              :model-value="laptime.trackId"
              :options="tracks"
              :reduce="(track: typeof Track) => track.uid"
              placeholder="Select track"
              label="track"
              :clearable="false"
              :disabled="!editEnabled"
              @update:model-value="updateLaptime({ trackId: $event }, laptime)"
            />
          </InputRow>

          <InputRow>
            <SelectInput
              :model-value="laptime.trackVariant"
              :options="getTrackVariants(laptime.trackId)"
              :reduce="(variant: string) => variant"
              placeholder="Select track variant"
              :clearable="false"
              :disabled="!editEnabled"
              @update:model-value="updateLaptime({ trackVariant: $event }, laptime)"
            />
          </InputRow>
          <InputRow>
            <SelectInput
              :model-value="laptime.driverId"
              :options="drivers"
              :reduce="(driver: typeof Driver) => driver.uid"
              placeholder="Select driver"
              label="name"
              :clearable="false"
              :disabled="!editEnabled"
              @update:model-value="updateLaptime({driverId: $event}, laptime)"
            />
          </InputRow>

          <InputRow
            v-for="b in buttonsFirstPanel"
            :key="b.name"
            :heading="b.heading"
            :border-bottom="true"
          >
            <RadioButtons
              :name="`${b.name}-laptime-detail-modal`"
              :values="b.values"
              :value="laptime[b.name as keyof Laptime]"
              :no-any="true"
              :disabled="!editEnabled"
              @changed="updateLaptime({[b.name]: $event}, laptime)"
            />
          </InputRow>
        </div>
        <div class="__secondPanel">
          <InputRow
            v-for="b in buttonsSecondPanel"
            :key="b.name"
            :heading="b.heading"
            :border-bottom="true"
          >
            <RadioButtons
              :name="`${b.name}-laptime-detail-modal`"
              :values="b.values"
              :value="laptime[b.name as keyof Laptime]"
              :no-any="true"
              :disabled="!editEnabled"
              @changed="updateLaptime({[b.name]: $event}, laptime)"
            />
          </InputRow>

          <InputRow
            heading="Notes"
          >
            <textarea
              :value="laptime.notes"
              :disabled="!editEnabled"
              style="resize: none"
              @change="updateLaptime({notes: ($event.target as HTMLTextAreaElement).value}, laptime)"
            />
          </InputRow>

          <span>{{ getDateTimeString() }}</span>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import InputRow from '@/components/add-laptime/InputRow.vue'
import LaptimeInput from '@/components/add-laptime/LaptimeInput.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { Game } from '@/constants/Game'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import sha256 from 'crypto-js/sha256'
import { Options, prop, Vue } from 'vue-class-component'

interface LaptimeSettings {
  heading: string
  name: string
  values: any[]
}

export class LaptimeDetailModalProps {
  laptimeId = prop<string>({ required: true })
}

@Options({
  components: {
    InputRow,
    SelectInput,
    LaptimeInput
  },
  emits: ['close', 'changed']
})
class LaptimeDetailModal extends Vue.with(LaptimeDetailModalProps) {
  buttonsFirstPanel!: LaptimeSettings[]
  buttonsSecondPanel!: LaptimeSettings[]
  showLogin = false
  password = ''
  passwordHash = ''

  get laptime () {
    return this.$dataStore.getTimeById(this.laptimeId)!
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

  get editEnabled () {
    return this.isLocal() && this.authorize(this.passwordHash)
  }

  created () {
    this.buttonsSecondPanel = [
      {
        heading: 'Transmission',
        name: 'transmission',
        values: Object.values(TransmissionType)
      },
      {
        heading: 'Weather',
        name: 'weather',
        values: Object.values(WeatherType)
      },
      {
        heading: 'Braking line',
        name: 'brakingLine',
        values: Object.values(BrakingLine)
      },
      {
        heading: 'Controls',
        name: 'controls',
        values: Object.values(ControlType)
      },
      {
        heading: 'Start type',
        name: 'startType',
        values: Object.values(StartType)
      }
    ]
    this.buttonsFirstPanel = [
      {
        heading: 'Game',
        name: 'game',
        values: Object.values(Game)
      }
    ]
  }

  mounted () {
    this.password = ''
    this.passwordHash = ''
  }

  showLoginModal () {
    this.showLogin = true
    this.$nextTick(() => (this.$refs.passwordInputRef as HTMLInputElement).focus())
  }

  login () {
    this.passwordHash = sha256(this.password).toString()
    this.password = ''
    this.showLogin = false
  }

  getDriver (time: Laptime) {
    const driver = this.$dataStore.getDriverById(time.driverId)
    return driver ? driver.name : 'Loading...'
  }

  getTrackName (time: Laptime) {
    const track = this.$dataStore.getTrackById(time.trackId)
    return track ? track.track : 'Loading...'
  }

  getTrackVariants (trackId: string) {
    return this.$dataStore.getTrackVariants(trackId)
  }

  getCarName (time: Laptime) {
    return this.$dataStore.getCarById(time.carId)?.name
  }

  getCarImage (time: Laptime) {
    const car = this.$dataStore.getCarById(time.carId)
    return car ? `images/${car.imageUrl}` : 'Loading...'
  }

  getDateTimeString () {
    if (!this.laptime) return
    return new Date(this.laptime.date).toLocaleString()
  }

  updateLaptime (e: any, time: Laptime) {
    if (!this.isLocal() || !this.editEnabled) return
    this.$dataStore.updateLaptime({ uid: time.uid, ...e })
  }

  deleteLaptime (laptimeId: string) {
    this.$emit('close')
    setTimeout(() => this.$dataStore.deleteLaptime(laptimeId))
    this.$toast.success('Laptime deleted successfully')
  }
}

export default LaptimeDetailModal
</script>

<style scoped lang="scss">
.__authorizeModal {
 :deep(.__modalContainer) {
    width: fit-content;
  }
}

.__wrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;
  text-align: center;

  .__firstPanel {
    max-width: 30vw;

    .__carImage {
      width: 100%;
    }
  }

  .__lg {
    display: inherit;
  }

  .__sm {
    display: none;
  }

  textarea {
    width: 100%;
    background-color: var(--bg-light1);
    padding: 0.5rem;
    border: 0.1rem solid black;

    &:disabled {
      background-color: #f8f8f8;
    }
  }

  .__lg textarea {
    height: 7rem;
  }
}

@media only screen and (max-width: 1280px) {
  .__wrapper {
    flex-direction: row;

    .__firstPanel, .__secondPanel {
      max-width: 40%;
    }
  }
}

@media only screen and (max-width: 700px) {
  .__wrapper {
    flex-direction: column;
    width: 100%;
    padding: 1rem;

    .__firstPanel, .__secondPanel {
      max-width: 100%;
    }
  }

  .__lg {
    display: none;
  }

  .__sm {
    display: inherit;
  }
}
</style>
