import LaptimeFilterComponent from '@/components/browse-times/LaptimeFilterComponent.vue'
import Button from '@/components/ui/Button.vue'
import EditableSelect from '@/components/ui/EditableSelect.vue'
import RadioButtons from '@/components/ui/RadioButtons.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import { ButtonType } from '@/constants/ButtonType'
import { TransmissionType } from '@/constants/TransmissionType'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { WeatherType } from '@/constants/WeatherType'
import { StartType } from '@/constants/StartType'
import { Game } from '@/constants/Game'
import { Distinct } from '@/constants/Distinct'
import { dataStore, LaptimeFilter } from '@/store/dataStore'
import { config, mount, shallowMount } from '@vue/test-utils'
import vSelect from 'vue-select'
import Datepicker from 'vue3-datepicker'

const dummyFilter : any = {
  carId: 'carId1',
  trackId: 'trackId1',
  trackVariant: 'trackVariant1',
  driverId: 'driver1',
  transmission: TransmissionType.AUTOMATIC,
  weather: WeatherType.RAIN,
  brakingLine: BrakingLine.OFF,
  controls: ControlType.GAMEPAD,
  startType: StartType.RUNNING,
  game: Game.PC2,
  date: new Date('2021-12-17T12:00:00')
}

const clearedFilter = {
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
}

describe('LaptimeFilterComponent.vue', () => {
  config.global.mocks = {
    ButtonType,
    TransmissionType,
    WeatherType,
    BrakingLine,
    ControlType,
    Game,
    Distinct,
    StartType,
    $dataStore: dataStore
  }

  config.global.stubs = {
    EditableSelect,
    SelectInput,
    Button,
    RadioButtons,
    DatePicker: Datepicker,
    'v-select': vSelect
  }

  it('should emit filter:changed event when any filter option changes', () => {
    const wrapper = shallowMount(LaptimeFilterComponent)

    let i = 0
    for (const filterName in dummyFilter) {
      const filterValue = dummyFilter[filterName]
      wrapper.vm.setFilter({ [filterName]: dummyFilter[filterName] })
      expect(wrapper.emitted()).toHaveProperty('filter:changed')
      const events = wrapper.emitted()['filter:changed'] as any
      expect(events).toHaveLength(i + 1)
      expect(events[i][0][filterName]).toBe(filterValue)
      i++
    }
  })

  it('should clear its internal filter state when clearFilter is called', () => {
    const wrapper = shallowMount(LaptimeFilterComponent)

    wrapper.vm.setFilter(dummyFilter)
    wrapper.vm.clearFilter()

    expect(wrapper.vm.filter).toEqual(clearedFilter)
  })

  it('should return true if filter is set and false when filter is not set', () => {
    const wrapper = shallowMount(LaptimeFilterComponent)

    wrapper.vm.setFilter(dummyFilter)
    expect(wrapper.vm.isFilterSet()).toBe(true)

    wrapper.vm.clearFilter()

    expect(wrapper.vm.isFilterSet()).toBe(false)
  })
})
