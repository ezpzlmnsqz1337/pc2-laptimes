<template>
  <div class="__medals">
    <div
      class="__item"
    >
      <h2>Medals</h2>
      <table class="__medalsTable">
        <tbody>
          <tr>
            <th>Driver</th><th>Events</th>
            <th
              v-for="place in 7"
              :key="`place-heading-${place}`"
            >
              <span v-if="place === 1">{{ place }}st</span>
              <span v-if="place === 2">{{ place }}nd</span>
              <span v-if="place === 3">{{ place }}rd</span>
              <span v-if="place > 3">{{ place }}th</span>
            </th>
            <th>Points</th><th>Rank</th>
          </tr>
          <tr
            v-show="!medals.length"
          >
            <td
              colspan="7"
              class="__loading"
            >
              <PulseLoader
                color="#188cff"
                size="15px"
              />
            </td>
          </tr>
          <tr
            v-for="m in medals"
            :key="m.driverId"
            class="__driver"
          >
            <td class="__name">
              {{ getDriverName(m.driverId) }}
            </td>
            <td class="__totalRaces">
              {{ getDriverTotalRaces(m.driverId) }}
            </td>
            <td
              v-for="place in 7"
              :key="`place-${place}`"
              class="__place"
            >
              <span @click="setFilter({ distinct: Distinct.YES, driverId: m.driverId, position: place})">{{ m.places[place-1] }}</span>
            </td>
            <td class="__points">
              <span>{{ $sb.calculatePoints(m) }}</span>
            </td>
            <td class="__rank">
              <img
                :src="getRank(m.driverId)"
                alt="rank"
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Rank } from '@/constants/Rank'
import { StatisticsScreenType } from '@/constants/StatisticsScreenType'
import { StatisticsFilter } from '@/store/statisticsStore'
import { prop, Vue } from 'vue-class-component'

class MedalsProps {
  refresh = prop<Function>({ default: () => {} })
}

class MedalsComponent extends Vue.with(MedalsProps) {
  get medals () {
    return this.$statisticsStore.medals
  }

  setFilter (filter: StatisticsFilter) {
    this.$statisticsStore.clearFilter()
    this.$statisticsStore.showScreen(StatisticsScreenType.LEADERBOARDS)
    this.$statisticsStore.setFilter(filter)
    this.refresh()
  }

  clearFilter () {
    this.$statisticsStore.clearFilter()
    this.refresh()
  }

  getDriverName (driverId: string) {
    return this.$dataStore.getDriverById(driverId)?.name
  }

  getDriverTotalRaces (driverId: string) {
    return this.$statisticsStore.getDriverTotalRaces(driverId)
  }

  getRank (driverId: string): string {
    const driver = this.$dataStore.getDriverById(driverId)
    if (!driver) return Rank.UNRANKED as unknown as string
    return this.$sb.getRank(driver, this.$statisticsStore.totalRaces, this.$statisticsStore.medals) as unknown as string
  }
}

export default MedalsComponent
</script>

<style scoped lang="scss">
@import '../../assets/css/table.scss';

.__medals {
  display: flex;
  flex-direction: row;
  justify-content: center;
  .__item {
    padding: var(--space-8xl);
    text-align: center;
  }
}

.__place:hover > span {
  cursor: pointer;
  color: var(--hover);
}

.__totalRacesTable, .__medalsTable {
  text-align: center;
  margin-bottom: var(--space-10xl);
}

.__totalRacesTable td{
  height: 2.47rem;
}

.__medalsTable .__rank {
  padding: 0;
  padding-right: var(--space-2xl);

  img {
    width: 5rem;
    margin-top: var(--space-sm);
    box-shadow: 0.2rem 0.2rem 0.3rem 0.2rem var(--shadow-dark);
  }
}

@media only screen and (max-width: 1024px) {
  .__medals {
    flex-direction: column;
    align-items: center;
  }

  .__totalRacesTable, .__medalsTable {
    font-size: var(--font-size-base) !important;
  }

  .__medals .__item {
    width: 80%;
  }
}

@media only screen and (max-width: 700px) {
  .__medals .__item {
    width: 100%;
  }

  .__medalsTable .__rank img{
    width: 3rem;
  }

  .__totalRacesTable, .__medalsTable {
    font-size: var(--font-size-compact) !important;
  }
}
</style>
