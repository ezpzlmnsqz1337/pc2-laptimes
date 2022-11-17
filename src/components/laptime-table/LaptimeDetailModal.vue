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
          @click="showLogin = true"
        >
          <div
            class="fa fa-pen"
          /><span>Edit</span>
        </Button>
        <h2>Laptime detail</h2>
      </div>
    </template>
    <template #body>
      <Modal
        v-show="showLogin"
        @close="$emit('close')"
      >
        <template #header>
          <h2>Enter password</h2>
        </template>
        <template
          #body
        >
          <input
            v-model="password"
            type="password"
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
              :reduce="o => o.uid"
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
              :reduce="o => o.uid"
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
              :reduce="o => o"
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
              :reduce="o => o.uid"
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
              :value="laptime[b.name]"
              :no-any="true"
              :disabled="!editEnabled"
              @changed="updateLaptime({[b.name]: $event}, laptime)"
            />
          </InputRow>

          <InputRow
            heading="Notes"
            class="__lg"
          >
            <textarea
              :value="laptime.notes"
              :disabled="!editEnabled"
              @change="updateLaptime({notes: $event.target.value}, laptime)"
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
              :value="laptime[b.name]"
              :no-any="true"
              :disabled="!editEnabled"
              @changed="updateLaptime({[b.name]: $event}, laptime)"
            />
          </InputRow>

          <InputRow
            heading="Notes"
            class="__sm"
          >
            <textarea
              :value="laptime.notes"
              :disabled="!editEnabled"
              @change="updateLaptime({notes: $event.target.value}, laptime)"
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
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { Game } from '@/constants/Game'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import { Options, prop, Vue } from 'vue-class-component'
import LaptimeInput from '@/components/add-laptime/LaptimeInput.vue'
import InputRow from '@/components/add-laptime/InputRow.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import sha256 from 'crypto-js/sha256'

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
export default class LaptimeDetailModal extends Vue.with(LaptimeDetailModalProps) {
  buttonsFirstPanel!: LaptimeSettings[]
  buttonsSecondPanel!: LaptimeSettings[]
  showLogin = false
  password = ''
  passwordHash = ''

  get laptime () {
    return this.$dataStore.getTimeById(this.laptimeId)
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
    if (!car?.imageUrl) return false
    return car ? `images/${car.imageUrl}` : 'Loading...'
  }

  getDateTimeString () {
    if (!this.laptime) return
    return new Date(this.laptime.date).toLocaleString()
  }

  updateLaptime (e: any, time: Laptime) {
    if (!this.isLocal()) return
    this.$dataStore.updateLaptime({ uid: time.uid, ...e })
  }
}
</script>

<style scoped lang="scss">
.__authorizeModal {
    width: 50%;

    .__header {
      position: relative;

    .__edit {
      position: absolute;
      right: 0;
    }
  }
}

.__wrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;

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
    border-radius: 0.3rem;
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
  }

  .__firstPanel, .__secondPanel {
    max-width: 40%;
  }
}

@media only screen and (max-width: 700px) {
  .__wrapper {
    flex-direction: column;
    width: 100%;
    padding: 1rem;
  }

  .__firstPanel, .__secondPanel {
    max-width: 100%;
  }

  .__lg {
    display: none;
  }

  .__sm {
    display: inherit;
  }
}
</style>