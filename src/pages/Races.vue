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
            <th>Win rate</th>
            <th>Most won track</th>
            <th>Most won car</th>
            <th>Details</th>
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
          <template
            v-for="row in driverTotals"
            :key="row.driverId"
          >
            <tr>
              <td class="__rank">
                <img
                  :src="row.rank"
                  alt="rank"
                >
              </td>
              <td class="__driver">
                <a
                  href="#"
                  @click.prevent="showDriverRaces(row.driverId)"
                >
                  {{ row.driverName }}
                </a>
              </td>
              <td>{{ row.totalRaces }}</td>
              <td>{{ row.wonRaces }}</td>
              <td>{{ row.winRateLabel }}</td>
              <td>{{ row.mostWonTrackLabel }}</td>
              <td class="__carCell">
                <img
                  v-if="row.mostWonCarImage"
                  :src="row.mostWonCarImage"
                  :alt="row.mostWonCarLabel"
                >
                <div>{{ row.mostWonCarLabel }}</div>
              </td>
              <td>
                <Button
                  :type="ButtonType.SECONDARY"
                  @click.stop="toggleExpanded(row.driverId)"
                >
                  {{ isExpanded(row.driverId) ? 'Hide' : 'Show' }}
                </Button>
              </td>
            </tr>

            <tr
              v-if="isExpanded(row.driverId)"
              class="__detailsRow"
            >
              <td colspan="999">
                <div class="__detailsGrid">
                  <div class="__detailsBlock">
                    <h4>Top 5 won tracks</h4>
                    <ul>
                      <li
                        v-for="track in row.topWonTracks"
                        :key="`track-${row.driverId}-${track.id}`"
                      >
                        {{ track.label }} - {{ track.count }}
                      </li>
                      <li v-if="!row.topWonTracks.length">
                        -
                      </li>
                    </ul>
                  </div>

                  <div class="__detailsBlock">
                    <h4>Top 5 won cars</h4>
                    <ul>
                      <li
                        v-for="car in row.topWonCars"
                        :key="`car-${row.driverId}-${car.id}`"
                        class="__carDetailItem"
                      >
                        <img
                          v-if="car.imageUrl"
                          :src="car.imageUrl"
                          :alt="car.label"
                        >
                        <span>{{ car.label }} - {{ car.count }}</span>
                      </li>
                      <li v-if="!row.topWonCars.length">
                        -
                      </li>
                    </ul>
                  </div>

                  <div class="__detailsBlock">
                    <h4>Head to head</h4>
                    <ul>
                      <li
                        v-for="record in row.headToHead"
                        :key="`h2h-${row.driverId}-${record.opponentId}`"
                      >
                        {{ row.driverName }} vs {{ record.opponentName }} - {{ record.wins }}:{{ record.losses }}
                      </li>
                      <li v-if="!row.headToHead.length">
                        -
                      </li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div
      v-if="activeSection === racesSectionType.LIST"
      class="__listSection"
    >
      <div class="__controls">
        <SelectInput
          :model-value="selectedDriverId"
          class="__driverSelect"
          :options="drivers"
          label="name"
          placeholder="Filter by driver"
          :clearable="true"
          :reduce="driverToId"
          @update:model-value="setDriverFilter($event)"
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

interface DetailCountItem {
  id: string
  label: string
  count: number
  imageUrl?: string
}

interface HeadToHeadItem {
  opponentId: string
  opponentName: string
  wins: number
  losses: number
}

interface DriverTotalRow {
  driverId: string
  driverName: string
  rank: string
  totalRaces: number
  wonRaces: number
  winRateLabel: string
  mostWonTrackLabel: string
  mostWonCarLabel: string
  mostWonCarImage: string
  topWonTracks: DetailCountItem[]
  topWonCars: DetailCountItem[]
  headToHead: HeadToHeadItem[]
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
  expandedDriverId: string | null = null
  displayColumns = ['rank', 'driver', 'laptime', 'car', 'settings']
  selectedTrackId: string | null = null
  selectedTrackVariant: string | null = null

  get drivers () {
    return this.$dataStore.drivers
  }

  get allRaces () {
    return this.$dataStore.getRaces({
      includeSolo: this.includeSolo
    })
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
    const winners = this.allRaces.filter(r => r.winnerDriverId)
    const totalByDriver = this.allRaces.reduce((acc, race) => {
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

    const headToHeadByDriver = this.buildHeadToHead(this.allRaces)

    const medals = this.buildRaceMedals(this.allRaces)
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
        const totalRacesForDriver = totalByDriver[driverId]
        const wonRacesForDriver = winsByDriver[driverId] || 0
        const winRate = totalRacesForDriver > 0
          ? (wonRacesForDriver / totalRacesForDriver) * 100
          : 0

        const topWonTracks = this.topCounts(
          wonTracks,
          (trackId) => this.$dataStore.getTrackById(trackId)?.track || 'Unknown',
          5
        )

        const topWonCars = this.topCounts(
          wonCars,
          (carId) => this.$dataStore.getCarById(carId)?.name || 'Unknown',
          5,
          (carId) => {
            const car = this.$dataStore.getCarById(carId)
            return car?.imageUrl ? `images/${car.imageUrl}` : ''
          }
        )

        const headToHead = Object.entries(headToHeadByDriver[driverId] || {})
          .map(([opponentId, score]) => ({
            opponentId,
            opponentName: this.$dataStore.getDriverById(opponentId)?.name || 'Unknown',
            wins: score.wins,
            losses: score.losses
          }))
          .sort((a, b) => b.wins - a.wins || b.losses - a.losses || a.opponentName.localeCompare(b.opponentName))

        return {
          driverId,
          driverName: driver?.name || 'Unknown',
          rank: driver ? sb.getRank(driver, totalRaces as any, medals) as unknown as string : '',
          totalRaces: totalRacesForDriver,
          wonRaces: wonRacesForDriver,
          winRateLabel: `${winRate.toFixed(1)}%`,
          mostWonTrackLabel: bestTrackId
            ? `${this.$dataStore.getTrackById(bestTrackId)?.track || 'Unknown'} (${wonTracks[bestTrackId]})`
            : '-',
          mostWonCarLabel: bestCarId
            ? `${this.$dataStore.getCarById(bestCarId)?.name || 'Unknown'} (${wonCars[bestCarId]})`
            : '-',
          mostWonCarImage: bestCarImage,
          topWonTracks,
          topWonCars,
          headToHead
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
    if (section !== RacesSectionType.TOTAL) {
      this.expandedDriverId = null
    }
  }

  isExpanded (driverId: string) {
    return this.expandedDriverId === driverId
  }

  toggleExpanded (driverId: string) {
    this.expandedDriverId = this.expandedDriverId === driverId ? null : driverId
  }

  showDriverRaces (driverId: string) {
    this.showSection(RacesSectionType.LIST)
    this.setDriverFilter(driverId)
  }

  toggleIncludeSolo () {
    this.includeSolo = !this.includeSolo
    this.ensureTrackAndVariantSelection()
  }

  setDriverFilter (driverId: string | null) {
    this.selectedDriverId = driverId
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

  topCounts (
    data: Record<string, number>,
    resolveLabel: (id: string) => string,
    max: number,
    resolveImage?: (id: string) => string
  ): DetailCountItem[] {
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([id, count]) => ({
        id,
        label: resolveLabel(id),
        count,
        imageUrl: resolveImage ? resolveImage(id) : ''
      }))
  }

  buildHeadToHead (races: Race[]) {
    const result = {} as Record<string, Record<string, { wins: number, losses: number }>>

    races.forEach((race) => {
      if (!race.winnerDriverId) return

      const participants = Array.from(new Set(race.times.map(x => x.driverId)))
      if (participants.length < 2) return

      participants.forEach((driverId) => {
        participants
          .filter(opponentId => opponentId !== driverId)
          .forEach((opponentId) => {
            if (!result[driverId]) result[driverId] = {}
            if (!result[driverId][opponentId]) {
              result[driverId][opponentId] = { wins: 0, losses: 0 }
            }

            if (race.winnerDriverId === driverId) {
              result[driverId][opponentId].wins += 1
            } else if (race.winnerDriverId === opponentId) {
              result[driverId][opponentId].losses += 1
            }
          })
      })
    })

    return result
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

.__totalSection tbody td > div:hover {
  cursor: default;
  color: inherit;
}

.__totalSection tbody tr:nth-child(odd):hover {
  color: var(--text-light1);
  background-color: var(--bg-dark1);
  cursor: default;
}

.__totalSection tbody tr:nth-child(even):hover {
  color: var(--text-dark1);
  background-color: var(--bg-light1);
  cursor: default;
}

.__totalSection .__detailsBlock:hover {
  color: var(--text-dark1);
  cursor: default;
}

.__totalSection td.__driver a {
  color: inherit;
  text-decoration: none;
}

.__totalSection td.__driver a:hover {
  color: var(--hover);
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

.__detailsRow td {
  text-align: left;
}

.__detailsGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding: 0.8rem;
  background-color: rgba(72, 72, 72, 0.35);
}

.__detailsBlock h4 {
  margin-top: 0;
  margin-bottom: 0.4rem;
}

.__detailsBlock ul {
  margin: 0;
  padding-left: 1rem;
}

.__detailsBlock li {
  margin-bottom: 0.25rem;
}

.__carDetailItem {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.__carDetailItem img {
  width: 2.2rem;
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

  .__detailsGrid {
    grid-template-columns: 1fr;
  }
}
</style>
