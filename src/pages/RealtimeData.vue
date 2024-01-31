<template>
  <div class="__realtimeData">
    <div class="__topContent">
      <div class="__raceData">
        <div>carName: {{ carName }}</div>
        <div>carClassName: {{ carClassName }}</div>
        <div>trackLocation: {{ trackLocation }}</div>
        <div>trackVariation: {{ trackVariation }}</div>
      </div>

      <div class="__controls">
        <div>
          <div>Realtime data:</div>
          <Button
            :type="realtimeData ? ButtonType.SUCCESS : ButtonType.DANGER"
            @click="toggleRealtimeData()"
          >
            {{ realtimeData ? 'Enabled' : 'Disabled' }}
          </Button>
        </div>

        <div v-if="realtimeData">
          <div>Lights enabled:</div>
          <Button
            :type="lightsEnabled ? ButtonType.SUCCESS : ButtonType.DANGER"
            @click="toggleLights()"
          >
            {{ lightsEnabled ? 'Enabled' : 'Disabled' }}
          </Button>
        </div>

        <div v-if="lightsEnabled">
          <label for="lightsOpacity">Lights opacity</label>
          <input
            id="lightsOpacity"
            v-model="lightsOpacity"
            type="range"
            min="0.1"
            step="0.1"
            max="1"
          >
        </div>
      </div>
    </div>

    <div class="__middleContent">
      <div class="__participants">
        <div
          v-for="(p, index) in sortedActiveParticipants"
          :key="`participant-${index}`"
          :class="{
            __player1: p.name === 'ezpzlmnsqz1337',
            __player2: p.name === 'tvojemama'
          }"
        >
          <div class="__heading">
            {{ p.racePosition }}. {{ p.name }}
          </div>
          <div v-if="p.fastestLapTime">
            Fastest laptime: {{ $ltb.dateToLaptime(new Date(p.fastestLapTime*1000)) }}
          </div>
          <div>Class same as player: {{ p.classSameAsPlayer }}</div>
          <div>Current lap: {{ p.currentLap }}</div>
          <div>Current lap distance: {{ p.currentLapDistance }}</div>
          <div>Is active: {{ p.isActive }}</div>
          <div>Lap invalidated: {{ p.lapInvalidated }}</div>
          <div>Laps completed: {{ p.lapsCompleted }}</div>
          <div>Last sector time: {{ $ltb.dateToLaptime(new Date(p.lastSectorTime*1000)) }}</div>
          <div>Sector: {{ p.sector }}</div>
          <div>World position x: {{ p.worldPositionX }}</div>
          <div>World position y: {{ p.worldPositionY }}</div>
          <div>World position z: {{ p.worldPositionZ }}</div>
        </div>
      </div>
    </div>

    <div class="__bottomContent">
      <div class="__telemetry">
        <div class="__brake">
          <div class="__verticalDial">
            <div
              ref="brake"
              class="__filler"
            />
          </div>
          <div>brake: {{ brake }}</div>
        </div>
        <div class="__clutch">
          <div class="__verticalDial">
            <div
              ref="clutch"
              class="__filler"
            />
          </div>
          <div>clutch: {{ clutch }}</div>
        </div>

        <div class="__speedometer">
          <div class="__rpm">
            <div class="__rpmValue">
              {{ rpm }} rpm
            </div>
            <div
              class="__horizontalDial"
            >
              <div
                ref="rpm"
                class="__filler"
              />
            </div>
          </div>
          <div class="__speed">
            <div>{{ Math.round(speed * (3600/1000)) }} km/h</div>
          </div>
        </div>

        <div class="__throttle">
          <div class="__verticalDial">
            <div
              ref="throttle"
              class="__filler"
            />
          </div>
          <div>throttle: {{ throttle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { RealtimeDataListener } from '@/builders/RealtimeDataBuilder'
import { PacketType } from '@/constants/PacketType'
import { Vue } from 'vue-class-component'

export default class RealtimeData extends Vue {
  protected realtimeDataListener!: RealtimeDataListener;
  protected lightsUrl = 'http://malina:4500'
  protected lightsId = 'C82B96407FD3'

  realtimeData = true
  lightsEnabled = false
  lightsOpacity = 1

  $refs!: {
    throttle: HTMLDivElement,
    brake: HTMLDivElement,
    clutch: HTMLDivElement,
    rpm: HTMLDivElement
  }

  get brake () {
    return this.$realtimeDataStore.brake
  }

  get throttle () {
    return this.$realtimeDataStore.throttle
  }

  get clutch () {
    return this.$realtimeDataStore.clutch
  }

  get speed () {
    return this.$realtimeDataStore.speed
  }

  get rpm () {
    return this.$realtimeDataStore.rpm
  }

  get maxRpm () {
    return this.$realtimeDataStore.maxRpm
  }

  get gearNumGears () {
    return this.$realtimeDataStore.gearNumGears
  }

  get carName () {
    return this.$realtimeDataStore.carName
  }

  get carClassName () {
    return this.$realtimeDataStore.carClassName
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

  get sortedActiveParticipants () {
    return this.participants.filter(p => p.isActive === 1).sort((a, b) => a.racePosition - b.racePosition)
  }

  created () {
    this.realtimeDataListener = this.$rdb.addListener(this.onRealtimeDataReceived)
  }

  toggleLights () {
    this.lightsEnabled = !this.lightsEnabled
    this.$lb.setLightsPower(this.lightsUrl, this.lightsId, this.lightsEnabled)
  }

  toggleRealtimeData () {
    if (this.realtimeData) {
      this.$rdb.removeListener(this.realtimeDataListener)
    } else {
      this.realtimeDataListener = this.$rdb.addListener(this.onRealtimeDataReceived)
    }
    this.realtimeData = !this.realtimeData
  }

  onRealtimeDataReceived (data: any) {
    if (data.packetType === PacketType.TELEMETRY) {
      this.setDials()
      if (this.lightsEnabled) {
        const { throttle, rpm, maxRpm, brake } = data.data
        this.setLightsColor(throttle, rpm, maxRpm, brake)
      }
    }
    this.$realtimeDataStore.setValues(data.data)
  }

  setDials () {
    this.$refs.throttle.style.maxHeight = `${(this.throttle / 255) * 100}%`
    this.$refs.brake.style.maxHeight = `${(this.brake / 255) * 100}%`
    this.$refs.clutch.style.maxHeight = `${(this.clutch / 255) * 100}%`
    this.$refs.rpm.style.maxWidth = `${(this.rpm / this.maxRpm) * 100}%`
  }

  setLightsColor (throttle: number, rpm: number, maxRpm: number, brake: number) {
    let color = '#00ff00'
    let brightness = rpm / maxRpm * 100
    // if braking, red color, brightness is intensity of braking
    if (brake > 0) {
      color = '#ff0000'
      brightness = brake / 255 * 100 // 255 is max brake
    }
    // if braking and throttle, yellow color, brightness is combination
    if (brake > 0 && throttle > 0) {
      color = '#ffff00'
      brightness = brake / 500 * 100 // 500 is max brake + max throttle
    }
    // if no throttle, nor brake, yellow, brightness is rpm/maxRpm percent
    if (throttle === 0 && brake === 0) {
      color = '#ffff00'
    }
    this.$lb.setLightsColor(this.lightsUrl, this.lightsId, color, brightness * this.lightsOpacity)
  }

  displayTime (seconds: number) {
    const d = new Date(seconds * 1000)
    return this.$ltb.dateToLaptime(d)
  }
}
</script>

<style scoped lang="scss">
.__realtimeData {
  padding: 2rem 1rem;
}

.__topContent {
  padding: 1rem;
  display: flex;
  justify-content: space-around;
}

.__middleContent {
  .__participants {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    > div {
      width: 15rem;
      padding: 1rem;
      margin-bottom: 1rem;
      background-color: rgba(46, 46, 46, 0.809);
      border-radius: 0.3rem;
      border: 0.3rem solid rgba(0, 0, 0, 0.464);

      &.__player1 {
        border: 0.3rem solid rgb(15, 0, 255);
      }

      &.__player2 {
        border: 0.3rem solid rgb(0, 131, 17);
      }
    }
  }
}

@media only screen and (max-width: 1280px) {
  .__middleContent {
    .__participants {
      justify-content: center;
    }
  }
}

.__bottomContent > .__telemetry {
  width: 80vw;
  height: 60vh;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(46, 46, 46, 0.809);
  border-radius: 50% 50% 5rem 5rem;
  border: 0.3rem solid rgba(0, 0, 0, 0.464);
}

.__controls > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.__speedometer {
  font-size: 5rem;
  text-align: center;
}

.__verticalDial {
  transform: rotateZ(180deg);
  position: relative;
  width: 1.5rem;
  height: 10rem;
  border-radius: 0.5rem;
  border: 0.1rem solid var(--border-dark1);
  background-color: var(--bg-light1);
  display: inline-block;

  > .__filler{
    position: relative;
    width: 1.3rem;
    height: 100%;
    border-radius: 0.5rem;
  }
}

.__horizontalDial {
  position: relative;
  width: 10rem;
  height: 1.5rem;
  border-radius: 0.5rem;
  border: 0.1rem solid var(--border-dark1);
  background-color: var(--bg-light1);

  > .__filler {
    position: relative;
    width: 100%;
    height: 1.3rem;
    border-radius: 0.5rem;
    margin-top: 0.03rem;
    margin-left: 0.03rem;
  }
}

.__brake, .__throttle, .__clutch {
  text-align: center;
  padding: 1rem;
}

.__brake > .__verticalDial > .__filler {
  background-color: var(--brake);
}

.__throttle > .__verticalDial > .__filler {
  background-color: var(--throttle);
}

.__clutch > .__verticalDial > .__filler{
  background-color: var(--clutch);
}

.__throttle > .__verticalDial > .__filler {
  background-color: var(--throttle);
}

.__rpm {
  > .__horizontalDial {
    width: 30rem;
    height: 4rem;

    > .__filler {
      height: 3.8rem;
      max-width: 29.75rem;
      width: 100%;
      background-color: #1a27db;
    }
  }
}

.__rpmValue {
  position: absolute;
  text-shadow: 0 0 0.5rem #080808;
  width: 30rem;
  text-align: center;
  font-weight: bold;
  font-size: 2rem;
  z-index: 10;
  line-height: 4rem;
}

.__heading {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
</style>
