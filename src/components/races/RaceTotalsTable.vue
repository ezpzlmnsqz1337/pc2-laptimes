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

              <div class="__detailsBlock">
                <h4>Head to head</h4>
                <ul>
                  <li
                    v-for="record in row.headToHead"
                    :key="`h2h-${row.driverId}-${record.opponentId}`"
                    :class="getHeadToHeadClass(record)"
                  >
                    <span class="__h2hIconWrapper">
                      <span
                        class="fa __h2hIcon"
                        :class="getHeadToHeadIconClass(record)"
                        aria-hidden="true"
                      />
                    </span>
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
</template>

<script lang="ts">
import { ButtonType } from '@/constants/ButtonType'
import { DriverRaceTotalRow } from '@/store/raceStats'
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

  getHeadToHeadClass (record: { wins: number, losses: number }) {
    if (record.wins > record.losses) return '__h2hWin'
    if (record.wins < record.losses) return '__h2hLoss'
    return '__h2hEven'
  }

  getHeadToHeadIconClass (record: { wins: number, losses: number }) {
    if (record.wins > record.losses) return 'fa-check'
    if (record.wins < record.losses) return 'fa-times'
    return 'fa-minus'
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.__carDetailItem {
  list-style-type: disc;

  img {
    width: 2.2rem;
    margin-right: var(--space-lg);
    vertical-align: middle;
  }
}

.__h2hIcon {
  font-size: var(--font-size-xs);
  line-height: 1;
  color: var(--text-light1);
}

.__h2hIconWrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
  background-color: var(--bg-light2);
}

.__h2hWin {
  color: inherit;

  .__h2hIconWrapper {
    background-color: var(--status-success);
  }
}

.__h2hLoss {
  color: inherit;

  .__h2hIconWrapper {
    background-color: var(--status-error);
  }
}

.__h2hEven {
  color: inherit;

  .__h2hIconWrapper {
    background-color: var(--text-disabled);
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

  .__h2hIcon {
    font-size: var(--font-size-2xs);
  }

  .__h2hIconWrapper {
    width: 0.8rem;
    height: 0.8rem;
  }
}
</style>
