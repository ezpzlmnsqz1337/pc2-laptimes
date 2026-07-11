<template>
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
              @click.prevent="emitShowDriverRaces(row.driverId)"
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

              <div class="__detailsBlock __detailsBlockFullWidth">
                <h4>Head to head</h4>
                <table
                  v-if="row.headToHead.length"
                  class="__h2hTable"
                >
                  <thead>
                    <tr>
                      <th>Opponent</th>
                      <th>Total</th>
                      <th
                        v-for="year in getHeadToHeadYears(row)"
                        :key="`h2h-header-${row.driverId}-${year}`"
                      >
                        {{ year }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="record in row.headToHead"
                      :key="`h2h-${row.driverId}-${record.opponentId}`"
                    >
                      <td class="__h2hOpponentCell">
                        {{ record.opponentName }}
                      </td>
                      <td :class="['__h2hScoreCell', getHeadToHeadClass(record)]">
                        {{ record.wins }}:{{ record.losses }}
                      </td>
                      <td
                        v-for="year in getHeadToHeadYears(row)"
                        :key="`h2h-cell-${row.driverId}-${record.opponentId}-${year}`"
                        :class="['__h2hScoreCell', getHeadToHeadClass(getYearRecord(record, year))]"
                      >
                        {{ formatHeadToHeadScore(getYearRecord(record, year)) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else>
                  -
                </div>
              </div>
            </div>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script lang="ts">
import { ButtonType } from '@/constants/ButtonType'
import { DriverRaceTotalRow, HeadToHeadItem, YearlyHeadToHeadItem } from '@/store/raceStats'
import { Options, Vue } from 'vue-class-component'

@Options({
  props: {
    includeSolo: {
      type: Boolean,
      default: false
    }
  },
  emits: ['show-driver-races']
})
class RaceTotalsTable extends Vue {
  readonly includeSolo!: boolean
  readonly ButtonType = ButtonType
  expandedDriverId: string | null = null

  get driverTotals (): DriverRaceTotalRow[] {
    return this.$dataStore.getRaceTotals(this.includeSolo)
  }

  emitShowDriverRaces (driverId: string) {
    this.$emit('show-driver-races', driverId)
  }

  isExpanded (driverId: string) {
    return this.expandedDriverId === driverId
  }

  toggleExpanded (driverId: string) {
    this.expandedDriverId = this.expandedDriverId === driverId ? null : driverId
  }

  getHeadToHeadYears (row: DriverRaceTotalRow) {
    return Array.from(new Set(
      row.headToHead.flatMap(record => record.yearlyRecords.map(yearRecord => yearRecord.year))
    )).sort((a, b) => b - a)
  }

  getYearRecord (record: HeadToHeadItem, year: number) {
    return record.yearlyRecords.find(yearRecord => yearRecord.year === year)
  }

  formatHeadToHeadScore (record?: YearlyHeadToHeadItem) {
    if (!record) return '-'
    return `${record.wins}:${record.losses}`
  }

  getHeadToHeadClass (record?: { wins: number, losses: number }) {
    if (!record) return '__h2hEmpty'
    if (record.wins > record.losses) return '__h2hWin'
    if (record.wins < record.losses) return '__h2hLoss'
    return '__h2hEven'
  }
}

export default RaceTotalsTable
</script>

<style scoped lang="scss">
@import '../../assets/css/table.scss';

table {
  width: 100%;

  td,
  th {
    text-align: center;
  }

  tbody {
    td > div:hover {
      cursor: default;
      color: inherit;
    }

    tr:nth-child(odd):hover {
      color: var(--text-light1);
      background-color: var(--bg-dark1);
      cursor: default;
    }

    tr:nth-child(even):hover {
      color: var(--text-dark1);
      background-color: var(--bg-light1);
      cursor: default;
    }
  }

  td.__driver {
    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        color: var(--hover);
      }
    }
  }

  th:nth-child(2),
  td.__driver {
    width: var(--races-driver-column-width, 14rem);
  }
}

.__rank {
  img {
    width: 4rem;
  }
}

.__carCell {
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 6rem;
    margin-bottom: var(--space-lg);
  }
}

.__detailsRow {
  td {
    text-align: left;
  }
}

.__detailsGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-8xl);
  padding: var(--space-5xl);
  background-color: var(--surface-overlay-soft);
}

.__detailsBlock {
  &:hover {
    cursor: default;
    color: inherit;
  }

  h4 {
    margin-top: 0;
    margin-bottom: var(--space-2xl);
  }

  ul {
    margin: 0;
    padding-left: var(--space-8xl);
  }

  li {
    margin-bottom: var(--space-sm);
  }
}

.__detailsBlockFullWidth {
  grid-column: 1 / -1;
}

.__h2hTable {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    padding: var(--space-5xl) var(--space-9xl);
    text-align: center;
    vertical-align: middle;
    line-height: 1.4;
  }

  tbody td {
    padding: var(--space-5xl) var(--space-9xl);
    text-align: center;
    vertical-align: middle;
    line-height: 1.4;
  }

  th:first-child,
  td:first-child {
    text-align: left;
  }

  thead th:first-child {
    text-align: center;
  }

  thead th {
    border-bottom: 1px solid var(--table-border, var(--bg-light2));
  }

  tbody tr:hover {
    background-color: transparent;
  }

  tbody tr:nth-child(odd) {
    color: var(--text-light1);
    background-color: var(--bg-dark1);
  }

  tbody tr:nth-child(even) {
    color: var(--text-dark1);
    background-color: var(--bg-light1);
  }
}

.__h2hOpponentCell {
  min-width: 11rem;
  text-align: center !important;
  font-weight: bold;
}

.__h2hScoreCell {
  min-width: 5.5rem;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  border-radius: var(--space-md);
  color: inherit;
}

.__h2hWin {
  background-color: rgba(5, 151, 17, 0.18);
}

.__h2hLoss {
  background-color: rgba(255, 0, 0, 0.16);
}

.__h2hEven {
  background-color: rgba(255, 255, 255, 0.08);
}

.__carDetailItem {
  list-style-type: disc;

  img {
    width: 2.2rem;
    margin-right: var(--space-lg);
    vertical-align: middle;
  }
}

@media only screen and (max-width: 700px) {
  .__rank img {
    width: 3rem;
  }

  .__carCell img {
    width: 4rem;
  }

  .__detailsGrid {
    grid-template-columns: 1fr;
  }
}
</style>
