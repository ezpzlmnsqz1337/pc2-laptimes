import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { Distinct } from '@/constants/Distinct'
import { Game } from '@/constants/Game'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'

export interface LaptimeFilter {
  carId?: string | null
  trackId?: string | null
  trackVariant?: string | null
  driverId?: string | null
  transmission?: TransmissionType
  weather?: WeatherType
  brakingLine?: BrakingLine
  controls?: ControlType
  startType?: StartType
  game?: Game
  date?: Date | null
  distinct?: Distinct
}

export interface LaptimeFilterStore {
  filter: LaptimeFilter
  showFilter: boolean
  getFilter(): LaptimeFilter
  setFilter(filter: LaptimeFilter): void
  clearFilter(): void
  toggleFilter(): void
  isFilterSet(): boolean
}

export const laptimeFilterStore: LaptimeFilterStore = {
  filter: {
    carId: null,
    trackId: null,
    trackVariant: null,
    driverId: null,
    transmission: TransmissionType.ANY,
    weather: WeatherType.ANY,
    brakingLine: BrakingLine.ANY,
    controls: ControlType.ANY,
    startType: StartType.ANY,
    game: Game.ANY,
    date: null,
    distinct: Distinct.YES
  },
  showFilter: false,
  getFilter () {
    return this.filter
  },
  setFilter ({ carId, trackId, trackVariant, driverId, transmission, weather, brakingLine, controls, startType, game, date, distinct }) {
    if (carId !== undefined) this.filter.carId = carId
    if (trackId !== undefined) this.filter.trackId = trackId
    if (trackVariant !== undefined) this.filter.trackVariant = trackVariant
    if (driverId !== undefined) this.filter.driverId = driverId
    if (transmission !== undefined) this.filter.transmission = transmission
    if (weather !== undefined) this.filter.weather = weather
    if (brakingLine !== undefined) this.filter.brakingLine = brakingLine
    if (controls !== undefined) this.filter.controls = controls
    if (startType !== undefined) this.filter.startType = startType
    if (game !== undefined) this.filter.game = game
    if (date !== undefined) this.filter.date = date
    if (distinct !== undefined) this.filter.distinct = distinct
  },
  clearFilter () {
    this.filter.carId = null
    this.filter.trackId = null
    this.filter.trackVariant = null
    this.filter.driverId = null
    this.filter.transmission = TransmissionType.ANY
    this.filter.weather = WeatherType.ANY
    this.filter.brakingLine = BrakingLine.ANY
    this.filter.controls = ControlType.ANY
    this.filter.startType = StartType.ANY
    this.filter.game = Game.ANY
    this.filter.date = null
    this.filter.distinct = Distinct.YES
  },
  toggleFilter () {
    this.showFilter = !this.showFilter
  },
  isFilterSet (): boolean {
    return Boolean(this.filter.carId || this.filter.trackId || this.filter.trackVariant || this.filter.transmission ||
            this.filter.weather || this.filter.brakingLine || this.filter.controls || this.filter.startType || this.filter.game || this.filter.date || this.filter.distinct === Distinct.NO)
  }
}
