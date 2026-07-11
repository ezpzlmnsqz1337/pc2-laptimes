import { CARS_ENDPOINT, dataStore } from '@/store/dataStore'
import { utilsStore } from '@/store/utilsStore'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/constants/Rank', () => ({
  Rank: {
    UNRANKED: 'unranked'
  }
}))

describe('utilsStore', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    dataStore.cars = [{ uid: 'car-id', name: 'Formula A', imageUrl: '' }]
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it('updates a known car image and broadcasts the successful change', async () => {
    fetchMock.mockResolvedValue({ ok: true, statusText: 'OK' })
    const broadcastDataChange = vi.spyOn(dataStore, 'broadcastDataChange')

    await utilsStore.setCarImage('car-id', 'formula-a.png')

    expect(dataStore.cars[0].imageUrl).toBe('formula-a.png')
    expect(fetchMock).toHaveBeenCalledWith(`${CARS_ENDPOINT}?uid=eq.car-id`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: 'formula-a.png' })
    })
    expect(broadcastDataChange).toHaveBeenCalledWith('cars')
  })

  it('does not call the API when the car is unknown', async () => {
    dataStore.cars = []
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await utilsStore.setCarImage('missing-car', 'formula-a.png')

    expect(fetchMock).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalled()
  })
})
