<template>
  <div class="__racesPage">
    <div class="__menu">
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeSection === racesSectionType.TOTAL}"
        @click="showSection(racesSectionType.TOTAL)"
      >
        Total races
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeSection === racesSectionType.LIST}"
        @click="showSection(racesSectionType.LIST)"
      >
        Race list
      </Button>
    </div>

    <div
      v-if="activeSection === racesSectionType.TOTAL"
      class="__totalSection"
    >
      <h2>Total races</h2>
      <div class="__controls">
        <Button
          :type="ButtonType.SECONDARY"
          :class="{__selected: includeSolo}"
          @click="toggleIncludeSolo()"
        >
          {{ includeSolo ? 'Hide solo entries' : 'Show solo entries' }}
        </Button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Driver</th>
            <th>Total races</th>
            <th>Won races</th>
            <th>Most won track</th>
            <th>Most won car</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!driverTotals.length">
            <td
              colspan="999"
              class="__loading"
            >
              <span class="__noLaptimesFound">No races found.</span>
            </td>
          </tr>
          <tr
            v-for="row in driverTotals"
            :key="row.driverId"
          >
            <td class="__rank">
              <img
                :src="row.rank"
                alt="rank"
              >
            </td>
            <td class="__driver">
              {{ row.driverName }}
            </td>
            <td>{{ row.totalRaces }}</td>
            <td>{{ row.wonRaces }}</td>
            <td>{{ row.mostWonTrackLabel }}</td>
            <td class="__carCell">
              <img
                v-if="row.mostWonCarImage"
                :src="row.mostWonCarImage"
                :alt="row.mostWonCarLabel"
              >
              <div>{{ row.mostWonCarLabel }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="activeSection === racesSectionType.LIST"
      class="__listSection"
    >
      <div class="__controls">
        <SelectInput
          v-model="selectedDriverId"
          class="__driverSelect"
          :options="drivers"
          label="name"
          placeholder="Filter by driver"
          :reduce="driverToId"
        />
        <Button
          :type="ButtonType.SECONDARY"
          :class="{__selected: includeSolo}"
          @click="toggleIncludeSolo()"
        >
          {{ includeSolo ? 'Hide solo entries' : 'Show solo entries' }}
        </Button>

        <SelectInput
          :model-value="selectedTrackId"
          class="__trackSelect"
          :options="trackOptions"
          placeholder="Select track"
          label="label"
          :sort-options="false"
          :clearable="false"
          :reduce="trackOptionToId"
          @update:model-value="setTrack($event)"
        />

        <SelectInput
          :model-value="selectedTrackVariant"
          class="__variantSelect"
          :options="variantOptions"
          placeholder="Select variant"
          label="label"
          :sort-options="false"
          :clearable="false"
          :disabled="!selectedTrackId || !variantOptions.length"
          :reduce="variantOptionToValue"
          @update:model-value="setTrackVariant($event)"
        />
      </div>

      <h2>Races</h2>
      <div
        v-if="!races.length"
        class="__empty"
      >
        No races found matching your filter.
      </div>

      <div class="__racesList">
        <div
          v-for="race in races"
          :key="race.uid"
          class="__raceItem"
        >
          <h3>
            {{ raceDate(race) }} - {{ raceTrackName(race) }} - {{ race.trackVariant || '-' }}
          </h3>

          <div class="__raceMeta">
            <div><strong>Winner:</strong> {{ raceWinner(race) }}</div>
            <div><strong>Gap:</strong> {{ raceGap(race) }}</div>
          </div>

          <LaptimeTable
            :rows="raceTimesSorted(race)"
            :display-columns="displayColumns"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import StatisticsBuilder, { Driver, Medals } from '@/builders/StatisticsBuilder'
import LaptimeTable from '@/components/laptime-table/LaptimeTable.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import { Race } from '@/store/dataStore'
import { Options, Vue } from 'vue-class-component'

enum RacesSectionType {
  TOTAL = 'total_races',
  LIST = 'races_list'
}

interface CountedOption {
  value: string
  label: string
  count: number
}

interface DriverTotalRow {
  driverId: string
  driverName: string
  rank: string
  totalRaces: number
  wonRaces: number
  mostWonTrackLabel: string
  mostWonCarLabel: string
  mostWonCarImage: string
}

@Options({
  components: {
    SelectInput,
    LaptimeTable
  }
})
class Races extends Vue {
  racesSectionType = RacesSectionType
  activeSection = RacesSectionType.TOTAL
  selectedDriverId: string | null = null
  includeSolo = false
  displayColumns = ['rank', 'driver', 'laptime', 'car', 'settings']
  selectedTrackId: string | null = null
  selectedTrackVariant: string | null = null

  get drivers () {
    return this.$dataStore.drivers
  }

  get baseRaces () {
    return this.$dataStore.getRaces({
      driverId: this.selectedDriverId,
      includeSolo: this.includeSolo
    })
  }

  get races () {
    return this.baseRaces.filter(r => {
      if (!this.selectedTrackId) return true
      if (r.trackId !== this.selectedTrackId) return false
      if (!this.selectedTrackVariant) return true
      return r.trackVariant === this.selectedTrackVariant
    })
  }

  get trackOptions (): CountedOption[] {
    const byTrack = this.baseRaces.reduce((acc, race) => {
      acc[race.trackId] = (acc[race.trackId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(byTrack)
      .map(([trackId, count]) => {
        const trackName = this.$dataStore.getTrackById(trackId)?.track || 'Unknown track'
        return {
          value: trackId,
          label: `${trackName} (${count})`,
          count
        }
      })
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }

  get variantOptions (): CountedOption[] {
    if (!this.selectedTrackId) return []
    const byVariant = this.baseRaces
      .filter(r => r.trackId === this.selectedTrackId)
      .reduce((acc, race) => {
        const variant = race.trackVariant || '-'
        acc[variant] = (acc[variant] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return Object.entries(byVariant)
      .map(([variant, count]) => ({
        value: variant,
        label: `${variant} (${count})`,
        count
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }

  get driverTotals (): DriverTotalRow[] {
    const winners = this.baseRaces.filter(r => r.winnerDriverId)
    const totalByDriver = this.baseRaces.reduce((acc, race) => {
      for (const t of race.times) {
        acc[t.driverId] = (acc[t.driverId] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const winsByDriver = winners.reduce((acc, race) => {
      if (race.winnerDriverId) {
        acc[race.winnerDriverId] = (acc[race.winnerDriverId] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const wonTracksByDriver = winners.reduce((acc, race) => {
      if (!race.winnerDriverId) return acc
      if (!acc[race.winnerDriverId]) acc[race.winnerDriverId] = {}
      acc[race.winnerDriverId][race.trackId] = (acc[race.winnerDriverId][race.trackId] || 0) + 1
      return acc
    }, {} as Record<string, Record<string, number>>)

    const wonCarsByDriver = winners.reduce((acc, race) => {
      if (!race.winnerDriverId) return acc
      const winnerTime = race.times.find(x => x.driverId === race.winnerDriverId)
      if (!winnerTime) return acc
      if (!acc[race.winnerDriverId]) acc[race.winnerDriverId] = {}
      acc[race.winnerDriverId][winnerTime.carId] = (acc[race.winnerDriverId][winnerTime.carId] || 0) + 1
      return acc
    }, {} as Record<string, Record<string, number>>)

    const medals = this.buildRaceMedals(this.baseRaces)
    const totalRaces = Object.keys(totalByDriver).map(driverId => {
      return {
        driver: this.$dataStore.getDriverById(driverId)!,
        races: totalByDriver[driverId]
      }
    })
      .sort((a, b) => b.races - a.races)

    const sb = StatisticsBuilder.getInstance()

    return Object.keys(totalByDriver)
      .map((driverId) => {
        const driver = this.$dataStore.getDriverById(driverId)
        const wonTracks = wonTracksByDriver[driverId] || {}
        const wonCars = wonCarsByDriver[driverId] || {}

        const bestTrackId = this.maxByCount(wonTracks)
        const bestCarId = this.maxByCount(wonCars)
        const bestCar = bestCarId ? this.$dataStore.getCarById(bestCarId) : null
        const bestCarImage = bestCar?.imageUrl ? `images/${bestCar.imageUrl}` : ''

        return {
          driverId,
          driverName: driver?.name || 'Unknown',
          rank: driver ? sb.getRank(driver, totalRaces as any, medals) as unknown as string : '',
          totalRaces: totalByDriver[driverId],
          wonRaces: winsByDriver[driverId] || 0,
          mostWonTrackLabel: bestTrackId
            ? `${this.$dataStore.getTrackById(bestTrackId)?.track || 'Unknown'} (${wonTracks[bestTrackId]})`
            : '-',
          mostWonCarLabel: bestCarId
            ? `${this.$dataStore.getCarById(bestCarId)?.name || 'Unknown'} (${wonCars[bestCarId]})`
            : '-',
          mostWonCarImage: bestCarImage
        }
      })
      .sort((a, b) => b.wonRaces - a.wonRaces || b.totalRaces - a.totalRaces || a.driverName.localeCompare(b.driverName))
  }

  driverToId (driver: Driver) {
    return driver.uid
  }

  trackOptionToId (option: CountedOption) {
    return option.value
  }

  variantOptionToValue (option: CountedOption) {
    return option.value
  }

  showSection (section: RacesSectionType) {
    this.activeSection = section
  }

  toggleIncludeSolo () {
    this.includeSolo = !this.includeSolo
    this.ensureTrackAndVariantSelection()
  }

  setTrack (trackId: string | null) {
    this.selectedTrackId = trackId
    const firstVariant = this.variantOptions[0]
    this.selectedTrackVariant = firstVariant ? firstVariant.value : null
  }

  setTrackVariant (variant: string | null) {
    this.selectedTrackVariant = variant
  }

  raceDate (race: Race) {
    return new Date(race.startDate).toLocaleString()
  }

  raceTrackName (race: Race) {
    return this.$dataStore.getTrackById(race.trackId)?.track || 'Unknown track'
  }

  raceWinner (race: Race) {
    if (!race.winnerDriverId) return '-'
    const winnerTime = race.times.find(x => x.driverId === race.winnerDriverId)
    const driverName = this.$dataStore.getDriverById(race.winnerDriverId)?.name || '-'
    const carName = winnerTime ? (this.$dataStore.getCarById(winnerTime.carId)?.name || 'Unknown car') : 'Unknown car'
    return `${driverName} - ${carName}`
  }

  raceGap (race: Race) {
    const sorted = this.raceTimesSorted(race)
    if (sorted.length < 2) return '-'
    return this.$ltb.getLaptimeDiff(sorted[0].laptime, sorted[1].laptime)
  }

  raceTimesSorted (race: Race) {
    return [...race.times].sort((a, b) => this.$ltb.compareLaptimes(a.laptime, b.laptime))
  }

  maxByCount (data: Record<string, number>) {
    const entries = Object.entries(data)
    if (!entries.length) return ''
    return entries.sort((a, b) => b[1] - a[1])[0][0]
  }

  buildRaceMedals (races: Race[]): Medals[] {
    const MAX_SAVED_PLACES = 7
    const medalsByDriver = {} as Record<string, Medals>

    races.forEach(race => {
      const ranked = [...race.times].sort((a, b) => this.$ltb.compareLaptimes(a.laptime, b.laptime))
      const distinctDrivers = Array.from(new Set(ranked.map(x => x.driverId))).slice(0, MAX_SAVED_PLACES)

      distinctDrivers.forEach((driverId, index) => {
        if (!medalsByDriver[driverId]) {
          medalsByDriver[driverId] = { driverId, places: new Array(MAX_SAVED_PLACES).fill(0) }
        }
        medalsByDriver[driverId].places[index] += 1
      })
    })

    return Object.values(medalsByDriver)
      .sort((a, b) => StatisticsBuilder.getInstance().calculatePoints(b) - StatisticsBuilder.getInstance().calculatePoints(a))
  }

  ensureTrackAndVariantSelection () {
    const firstTrack = this.trackOptions[0]
    if (!this.selectedTrackId) {
      this.selectedTrackId = firstTrack ? firstTrack.value : null
    }
    const hasSelectedTrack = this.trackOptions.some(x => x.value === this.selectedTrackId)
    if (!hasSelectedTrack) {
      this.selectedTrackId = firstTrack ? firstTrack.value : null
    }

    const firstVariant = this.variantOptions[0]
    const hasSelectedVariant = this.variantOptions.some(x => x.value === this.selectedTrackVariant)
    if (!hasSelectedVariant) {
      this.selectedTrackVariant = firstVariant ? firstVariant.value : null
    }
  }

  mounted () {
    this.ensureTrackAndVariantSelection()
  }
}

export default Races
</script>

<style scoped lang="scss">
@import '../assets/css/table.css';

.__racesPage {
  --races-driver-column-width: 14rem;
  padding: 3rem 1rem 1rem;
}

.__menu {
  text-align: center;
  margin-bottom: 1rem;

  .__selected {
    background-color: #242424 !important;
  }
}

h3 {
  margin-bottom: 0.5rem;
}

.__controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.__driverSelect {
  width: 16rem;
  max-width: 100%;
}

.__trackSelect,
.__variantSelect {
  width: 16rem;
  max-width: 100%;
}

.__selected {
  background-color: #242424;
}

.__totalSection table {
  width: 100%;
}

.__totalSection td,
.__totalSection th {
  text-align: center;
}

.__totalSection th:nth-child(2),
.__totalSection td.__driver {
  width: var(--races-driver-column-width);
}

.__rank img {
  width: 4rem;
}

.__carCell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.__carCell img {
  width: 6rem;
  margin-bottom: 0.3rem;
}

.__empty {
  background-color: #888888;
  padding: 1rem;
  margin-top: 1rem;
}

.__racesList {
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.__raceItem {
  padding-left: 10vw;
  padding-right: 10vw;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.__raceMeta {
  margin-bottom: 0.7rem;
  display: flex;
  gap: 1rem;
}

.__raceItem :deep(table) {
  width: 100%;
}

.__raceItem :deep(th),
.__raceItem :deep(td.__id),
.__raceItem :deep(td.__driver),
.__raceItem :deep(td.__car) {
  text-align: center;
}

.__raceItem :deep(th:nth-child(2)),
.__raceItem :deep(td.__driver) {
  width: var(--races-driver-column-width);
}

.__raceItem :deep(td.__driver > div) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.__raceItem :deep(td.__car > div) {
  text-align: center;
}

@media only screen and (max-width: 700px) {
  .__racesPage {
    padding: 1rem;
  }

  .__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .__rank img {
    width: 3rem;
  }

  .__carCell img {
    width: 4rem;
  }

  .__raceItem {
    padding: 0 0 1rem;
  }

  .__raceMeta {
    flex-direction: column;
    gap: 0.2rem;
  }
}
</style>
