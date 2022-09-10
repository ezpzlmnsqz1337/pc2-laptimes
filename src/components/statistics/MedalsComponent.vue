<template>
  <div class="__medals">
    <div
      class="__item"
    >
      <h2>Medals</h2>
      <table class="__medalsTable">
        <tr><th>Driver</th><th>No. of races</th><th>1st</th><th>2nd</th><th>3rd</th><th>Points</th><th>Rank</th></tr>
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
          v-for="(m, index) in medals"
          :key="m.driverId"
          class="__driver"
        >
          <td class="__name">
            {{ getDriverName(m.driverId) }}
          </td>
          <td class="__totalRaces">
            {{ getDriverTotalRaces(m.driverId) }}
          </td>
          <td class="__first">
            <span @click="setFilter({ distinct: Distinct.YES, driverId: m.driverId, position: 1})">{{ m.first }}</span>
          </td>
          <td class="__second">
            <span @click="setFilter({ distinct: Distinct.YES, driverId: m.driverId, position: 2})">{{ m.second }}</span>
          </td>
          <td class="__third">
            <span @click="setFilter({ distinct: Distinct.YES, driverId: m.driverId, position: 3})">{{ m.third }}</span>
          </td>
          <td class="__points">
            <span>{{ $sb.calculatePoints(m) }}</span>
          </td>
          <td class="__rank">
            <img
              :src="getRank(m.driverId, index)"
              alt="rank"
            >
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Medals } from '@/builders/StatisticsBuilder'
import { Rank } from '@/constants/Rank'
import { StatisticsScreenType } from '@/constants/StatisticsScreenType'
import { StatisticsFilter, TotalDriverRaces } from '@/store/statisticsStore'
import { prop, Vue } from 'vue-class-component'

class MedalsProps {
  refresh = prop<Function>({ default: () => {} })
}

export default class MedalsComponent extends Vue.with(MedalsProps) {
  get medals () {
    return this.$statisticsStore.medals
  }

  setFilter (filter: StatisticsFilter) {
    this.$statisticsStore.clearFilter()
    this.$statisticsStore.setFilter(filter)
    this.refresh()
    this.$statisticsStore.showScreen(StatisticsScreenType.LEADERBOARDS)
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

  getRank (driverId: string) {
    const MIN_RACES_FOR_RANK = 10

    const driver = this.$dataStore.getDriverById(driverId)
    if (!driver) return Rank.UNRANKED
    // if (driver.name === 'mazel') return Rank.GLOBAL
    // if (driver.name === 'jara') return Rank.SILVER1

    const driverTotalRaces = this.$statisticsStore.totalRaces.find((x: TotalDriverRaces) => x.driver.name === driver.name)
    if (!driverTotalRaces) return Rank.UNRANKED
    if (driverTotalRaces.races < MIN_RACES_FOR_RANK) return Rank.UNRANKED

    const driverMedals = this.$statisticsStore.medals.find((x: Medals) => x.driverId === driver.uid)

    // get max points currently
    const maxBonus = this.$sb.calculateBonus(this.$statisticsStore.medals[0], this.$statisticsStore.totalRaces[0].races)
    const maxPoints = driverTotalRaces.races / this.$sb.calculatePoints(this.$statisticsStore.medals[0]) * 10 + maxBonus

    const bonus = this.$sb.calculateBonus(driverMedals!, driverTotalRaces.races)
    const points = driverTotalRaces.races / this.$sb.calculatePoints(driverMedals!) * 10 + bonus

    const weightedPoints = this.mapValueInRange(points, 0, maxPoints, 0, 1) * 1000

    if (weightedPoints > 910) return Rank.GLOBAL
    if (this.isInRange(weightedPoints, 510, 910)) return Rank.SUPREME
    if (this.isInRange(weightedPoints, 310, 510)) return Rank.LEM
    if (this.isInRange(weightedPoints, 200, 310)) return Rank.EAGLE
    if (this.isInRange(weightedPoints, 100, 200)) return Rank.SHERIF
    if (this.isInRange(weightedPoints, 80, 100)) return Rank.DOUBLE_AK
    if (this.isInRange(weightedPoints, 61, 80)) return Rank.AK1
    if (this.isInRange(weightedPoints, 59, 61)) return Rank.AK
    if (this.isInRange(weightedPoints, 57, 59)) return Rank.GOLD4
    if (this.isInRange(weightedPoints, 55, 57)) return Rank.GOLD3
    if (this.isInRange(weightedPoints, 51, 55)) return Rank.GOLD2
    if (this.isInRange(weightedPoints, 46, 51)) return Rank.GOLD1
    if (this.isInRange(weightedPoints, 41, 46)) return Rank.SILVER_ELITE_MASTER
    if (this.isInRange(weightedPoints, 36, 41)) return Rank.SILVER_ELITE
    if (this.isInRange(weightedPoints, 31, 36)) return Rank.SILVER4
    if (this.isInRange(weightedPoints, 23, 61)) return Rank.SILVER3
    if (this.isInRange(weightedPoints, 11, 23)) return Rank.SILVER2
    if (this.isInRange(weightedPoints, 0, 11)) return Rank.SILVER1

    return Rank.EXPIRED
  }
}
</script>

<style scoped lang="scss">
.__medals {
  display: flex;
  flex-direction: row;
  justify-content: center;
  .__item {
    padding: 1rem;
    text-align: center;
  }
}

.__first:hover > span, .__second:hover > span, .__third:hover > span {
  cursor: pointer;
  color: var(--hover);
}

.__totalRacesTable, .__medalsTable {
  text-align: center;
  margin-bottom: 2rem;
}

.__totalRacesTable td{
  height: 2.47rem;
}

.__medalsTable .__rank {
  padding: 0;
  padding-right: 0.5rem;

  img {
    width: 5rem;
    margin-top: 0.2rem;
    border-radius: 0.3rem;
    box-shadow: 0.2rem 0.2rem 0.3rem 0.2rem #333333;
  }
}

@media only screen and (max-width: 1024px) {
  .__medals {
    flex-direction: column;
    align-items: center;
  }

  .__totalRacesTable, .__medalsTable {
    font-size: 1rem !important;
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
    font-size: 0.8rem !important;
  }
}
</style>
