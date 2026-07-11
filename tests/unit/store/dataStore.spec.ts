import { Laptime } from '@/builders/LaptimeBuilder'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { Game } from '@/constants/Game'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import { dataStore, TIMES_ENDPOINT } from '@/store/dataStore'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/constants/Rank', () => ({
  Rank: {
    UNRANKED: 'unranked'
  }
}))

vi.mock('uuid', () => ({
  v4: () => 'generated-uid'
}))

function createLaptime (overrides: Partial<Laptime> = {}): Laptime {
  return {
    uid: 'time-id',
    carId: 'car-id',
    trackId: 'track-id',
    trackVariant: 'Grand Prix Circuit',
    driverId: 'driver-id',
    transmission: TransmissionType.SEQUENTIAL,
    weather: WeatherType.SUN,
    brakingLine: BrakingLine.OFF,
    controls: ControlType.STEERING_WHEEL,
    startType: StartType.RUNNING,
    laptime: '1:31.234',
    game: Game.PC2,
    date: Date.UTC(2025, 0, 15, 12),
    notes: '',
    ...overrides
  }
}

describe('dataStore', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    dataStore.times = []
    dataStore.races = []
    dataStore.lastAddedLaptime = null
    dataStore.drivers = []
    dataStore.cars = []
    dataStore.tracks = []
    dataStore.raceTotals = { includeSolo: [], excludeSolo: [] }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it('persists a normalized laptime and notifies other clients after a successful write', async () => {
    fetchMock.mockResolvedValue({ ok: true, statusText: 'Created' })
    const broadcastDataChange = vi.spyOn(dataStore, 'broadcastDataChange')

    await dataStore.addLaptime(createLaptime())

    expect(dataStore.lastAddedLaptime).toMatchObject({
      uid: 'generated-uid',
      date: Date.UTC(2025, 0, 15, 12)
    })
    expect(fetchMock).toHaveBeenCalledWith(TIMES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: 'generated-uid',
        car_id: 'car-id',
        track_id: 'track-id',
        track_variant: 'Grand Prix Circuit',
        driver_id: 'driver-id',
        transmission: TransmissionType.SEQUENTIAL,
        weather: WeatherType.SUN,
        braking_line: false,
        controls: ControlType.STEERING_WHEEL,
        start_type: StartType.RUNNING,
        laptime: '1:31.234',
        game: Game.PC2,
        date: Date.UTC(2025, 0, 15, 12),
        notes: '',
        date_string: '15/01/2025'
      })
    })
    expect(broadcastDataChange).toHaveBeenCalledWith('times')
  })

  it('does not broadcast when the laptime write fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, statusText: 'Bad Request' })
    const broadcastDataChange = vi.spyOn(dataStore, 'broadcastDataChange')

    await dataStore.addLaptime(createLaptime())

    expect(broadcastDataChange).not.toHaveBeenCalled()
  })

  it('normalizes fetched times and groups matching participants into a race', async () => {
    fetchMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue([
        {
          uid: 'time-1',
          car_id: 'car-id',
          track_id: 'track-id',
          track_variant: 'Grand Prix Circuit',
          driver_id: 'driver-1',
          laptime: '1:31.234',
          date: '1000000',
          braking_line: true
        },
        {
          uid: 'time-2',
          car_id: 'car-id',
          track_id: 'track-id',
          track_variant: 'Grand Prix Circuit',
          driver_id: 'driver-2',
          laptime: '1:30.000',
          date: '1060000',
          braking_line: false
        }
      ])
    })

    await dataStore.fetchTimes()

    expect(dataStore.times).toMatchObject([
      { uid: 'time-1', date: 1000000, brakingLine: BrakingLine.ON },
      { uid: 'time-2', date: 1060000, brakingLine: BrakingLine.OFF }
    ])
    expect(dataStore.races).toHaveLength(1)
    expect(dataStore.races[0]).toMatchObject({
      times: [{ uid: 'time-1' }, { uid: 'time-2' }],
      winnerDriverId: 'driver-2'
    })
  })
})
