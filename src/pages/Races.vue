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

      <RaceTotalsTable
        :include-solo="includeSolo"
        @show-driver-races="showDriverRaces"
      />
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
        <RaceListItem
          v-for="race in races"
          :key="race.uid"
          :race="race"
          :display-columns="displayColumns"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Driver } from '@/builders/StatisticsBuilder'
import RaceListItem from '@/components/races/RaceListItem.vue'
import RaceTotalsTable from '@/components/races/RaceTotalsTable.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import { Options, Vue, prop } from 'vue-class-component'

enum RacesSectionType {
  TOTAL = 'total_races',
  LIST = 'races_list'
}

interface CountedOption {
  value: string
  label: string
  count: number
}

const EMPTY_VARIANT_VALUE = '__NO_TRACK_VARIANT__'

class RacesProps {
  filterYear = prop<string | null>({ default: null })
}

@Options({
  components: {
    SelectInput,
    RaceListItem,
    RaceTotalsTable
  }
})
class Races extends Vue.with(RacesProps) {
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
    let filtered = this.baseRaces

    if (this.filterYear) {
      const year = this.filterYear
      filtered = filtered.filter(r => new Date(r.startDate).getFullYear()
        .toString() === year)
    }

    return filtered.filter(r => {
      if (!this.selectedTrackId) return true
      if (r.trackId !== this.selectedTrackId) return false
      if (!this.selectedTrackVariant) return true
      if (this.selectedTrackVariant === EMPTY_VARIANT_VALUE) {
        return !r.trackVariant
      }
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
        const variant = race.trackVariant || EMPTY_VARIANT_VALUE
        acc[variant] = (acc[variant] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return Object.entries(byVariant)
      .map(([variant, count]) => ({
        value: variant,
        label: `${variant === EMPTY_VARIANT_VALUE ? '-' : variant} (${count})`,
        count
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
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
.__racesPage {
  --races-driver-column-width: 14rem;
  padding: var(--space-11xl) var(--space-8xl) var(--space-8xl);

  .__menu {
    text-align: center;
    margin-bottom: var(--space-8xl);

    .__selected {
      background-color: var(--state-selected-bg) !important;
    }
  }

  h3 {
    margin-bottom: var(--space-2xl);
  }

  .__controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: var(--space-8xl);
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
    background-color: var(--state-selected-bg);
  }

  .__empty {
    background-color: var(--bg-dark1);
    padding: var(--space-8xl);
    margin-top: var(--space-8xl);
  }

  .__racesList {
    max-width: 100vw;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }
}

@media only screen and (max-width: 700px) {
  .__racesPage {
    padding: var(--space-8xl);

    .__controls {
      flex-direction: column;
      align-items: stretch;
    }

  }
}
</style>
