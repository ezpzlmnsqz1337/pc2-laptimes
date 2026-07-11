import LaptimeBuilder from '@/builders/LaptimeBuilder'
import { RealtimeDataListener } from '@/builders/RealtimeDataBuilder'
import { BrakingLine } from '@/constants/BrakingLine'
import { ButtonType } from '@/constants/ButtonType'
import { ControlType } from '@/constants/ControlType'
import { Game } from '@/constants/Game'
import AddLaptime from '@/pages/AddLaptime.vue'
import { RaceState } from '@/constants/RaceState'
import { ScreenType } from '@/constants/ScreenType'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import { WebsocketState } from '@/constants/WebsocketState'
import { dataStore } from '@/store/dataStore'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/constants/Rank', () => ({
  Rank: {
    UNRANKED: 'unranked'
  }
}))

describe('AddLaptime auto-submit flow', () => {
  let realtimeListener: RealtimeDataListener | undefined

  beforeEach(() => {
    vi.useFakeTimers()
    realtimeListener = undefined
    dataStore.autoSubmit = true
    dataStore.websocketState = WebsocketState.ESTABLISHED
    dataStore.cars = [{ uid: 'car-id', name: 'Formula A', gameId: 'Formula A' }]
    dataStore.tracks = [{ uid: 'track-id', track: 'Brands Hatch', variants: ['Grand Prix Circuit'], gameId: 'Brands Hatch' }]
    dataStore.drivers = [{ uid: 'driver-id', name: 'Test Driver' }]
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('adds a laptime when a realtime race finishes after being in progress', async () => {
    const addLaptime = vi.spyOn(dataStore, 'addLaptime').mockResolvedValue()
    const showScreen = vi.spyOn(dataStore, 'showScreen')
    const toastSuccess = vi.fn()
    const wrapper = mount(AddLaptime, {
      global: {
        mocks: {
          $dataStore: dataStore,
          $realtimeDataStore: {
            carName: 'Formula A',
            trackLocation: 'Brands Hatch',
            trackVariation: 'Grand Prix',
            participants: [{ name: 'ezpzlmnsqz1337', fastestLapTime: 91.234 }]
          },
          $rdb: {
            addListener (listener: RealtimeDataListener): RealtimeDataListener {
              realtimeListener = listener
              return listener
            },
            getHostname: () => 'wallpc'
          },
          $ltb: LaptimeBuilder.getInstance(),
          $toast: { success: toastSuccess },
          queryParams: new URLSearchParams(),
          ButtonType,
          BrakingLine,
          ControlType,
          Game,
          StartType,
          TransmissionType,
          WeatherType
        },
        stubs: {
          NewCarModal: true,
          NewTrackModal: true,
          NewTrackVariantModal: true,
          NewDriverModal: true,
          SelectInput: true,
          Button: true,
          RadioButtons: true
        }
      }
    })
    wrapper.vm.driverId = 'driver-id'

    realtimeListener?.({ data: { raceState: RaceState.RACE_IS_ON } } as MessageEvent)
    realtimeListener?.({ data: { raceState: RaceState.RACE_FINISHED } } as MessageEvent)
    await vi.advanceTimersByTimeAsync(1000)
    await nextTick()

    expect(showScreen).toHaveBeenCalledWith(ScreenType.ADD_LAPTIME)
    expect(addLaptime).toHaveBeenCalledWith(expect.objectContaining({
      carId: 'car-id',
      trackId: 'track-id',
      trackVariant: 'Grand Prix Circuit',
      driverId: 'driver-id',
      laptime: '1:31.234'
    }))
    expect(toastSuccess).toHaveBeenCalledWith('Laptime added successfully!', expect.any(Object))

    wrapper.unmount()
  })
})
