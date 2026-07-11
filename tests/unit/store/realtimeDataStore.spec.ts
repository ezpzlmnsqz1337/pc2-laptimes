import { realtimeDataStore } from '@/store/realtimeDataStore'
import { beforeEach, describe, expect, it } from 'vitest'

describe('realtimeDataStore', () => {
  beforeEach(() => {
    realtimeDataStore.speed = null
    realtimeDataStore.carName = null
    realtimeDataStore.participants = []
  })

  it('merges participant packets at their packet offset while updating known telemetry values', () => {
    realtimeDataStore.setValues({
      speed: 250,
      carName: 'Formula A',
      participants: [{ name: 'Driver One', fastestLapTime: 91.234, lapsCompleted: 3 }]
    })
    realtimeDataStore.setValues({
      offset: 1,
      participants: [{ name: 'Driver Two', fastestLapTime: 90.5, lapsCompleted: 4 }]
    })
    realtimeDataStore.setValues({
      offset: 0,
      participants: [{ name: 'Driver One', fastestLapTime: 90.8 }]
    })

    expect(realtimeDataStore.speed).toBe(250)
    expect(realtimeDataStore.carName).toBe('Formula A')
    expect(realtimeDataStore.participants).toEqual([
      { name: 'Driver One', fastestLapTime: 90.8, lapsCompleted: 3 },
      { name: 'Driver Two', fastestLapTime: 90.5, lapsCompleted: 4 }
    ])
  })

  it('ignores unknown telemetry keys', () => {
    realtimeDataStore.setValueByKey('speed', 180)
    realtimeDataStore.setValueByKey('unknownValue', 'ignored')
    realtimeDataStore.setValues({ unknownValue: 'ignored' })

    expect(realtimeDataStore.speed).toBe(180)
    expect(realtimeDataStore).not.toHaveProperty('unknownValue')
  })
})
