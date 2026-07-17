import { laptimeBuilder } from '@/builders/LaptimeBuilder'
import { describe, expect, it } from 'vitest'

describe('laptimeToDate', () => {
  it('parses a valid laptime string into a Date', () => {
    const result = laptimeBuilder.laptimeToDate('1:23.456')
    expect(result).toBeInstanceOf(Date)
    expect(result!.getTime()).toBe(83456)
  })

  it('handles single-digit minutes', () => {
    const result = laptimeBuilder.laptimeToDate('0:05.100')
    expect(result!.getTime()).toBe(5100)
  })

  it('handles two-digit minutes', () => {
    const result = laptimeBuilder.laptimeToDate('12:59.999')
    expect(result!.getTime()).toBe(779999)
  })

  it('returns undefined for empty string', () => {
    expect(laptimeBuilder.laptimeToDate('')).toBeUndefined()
  })

  it('returns undefined for invalid format', () => {
    expect(laptimeBuilder.laptimeToDate('invalid')).toBeUndefined()
    expect(laptimeBuilder.laptimeToDate('1:2.3')).toBeUndefined()
    expect(laptimeBuilder.laptimeToDate('1:23.45')).toBeUndefined()
  })
})

describe('dateToLaptime', () => {
  it('formats a Date to laptime string with zero-padding', () => {
    const date = new Date(83456)
    expect(laptimeBuilder.dateToLaptime(date)).toBe('1:23.456')
  })

  it('zero-pads seconds and milliseconds', () => {
    const date = new Date(6105)
    expect(laptimeBuilder.dateToLaptime(date)).toBe('0:06.105')
  })

  it('handles zero time', () => {
    const date = new Date(0)
    expect(laptimeBuilder.dateToLaptime(date)).toBe('0:00.000')
  })
})

describe('compareLaptimes', () => {
  it('returns negative when first is faster', () => {
    const result = laptimeBuilder.compareLaptimes('1:30.000', '1:31.000')
    expect(result).toBeLessThan(0)
  })

  it('returns positive when first is slower', () => {
    const result = laptimeBuilder.compareLaptimes('1:31.000', '1:30.000')
    expect(result).toBeGreaterThan(0)
  })

  it('returns zero when equal', () => {
    const result = laptimeBuilder.compareLaptimes('1:30.000', '1:30.000')
    expect(result).toBe(0)
  })
})

describe('getLaptimeDiff', () => {
  it('computes positive diff when first is faster', () => {
    const diff = laptimeBuilder.getLaptimeDiff('1:30.000', '1:32.500')
    expect(diff).toBe('+ 0:02.500')
  })

  it('returns zero diff for equal times', () => {
    const diff = laptimeBuilder.getLaptimeDiff('1:30.000', '1:30.000')
    expect(diff).toBe('+ 0:00.000')
  })

  it('handles cross-minute diff', () => {
    const diff = laptimeBuilder.getLaptimeDiff('0:58.000', '1:02.000')
    expect(diff).toBe('+ 0:04.000')
  })
})

describe('isLaptimeValid', () => {
  it('returns true for a valid time', () => {
    expect(laptimeBuilder.isLaptimeValid('1', '23', '456')).toBe(true)
  })

  it('returns true for zero minutes', () => {
    expect(laptimeBuilder.isLaptimeValid('0', '05', '100')).toBe(true)
  })

  it('returns false for empty minutes', () => {
    expect(laptimeBuilder.isLaptimeValid('', '23', '456')).toBe(false)
  })

  it('returns false when seconds not 2 digits', () => {
    expect(laptimeBuilder.isLaptimeValid('1', '2', '456')).toBe(false)
  })

  it('returns false when milliseconds not 3 digits', () => {
    expect(laptimeBuilder.isLaptimeValid('1', '23', '45')).toBe(false)
  })

  it('returns false when seconds >= 60', () => {
    expect(laptimeBuilder.isLaptimeValid('1', '60', '000')).toBe(false)
    expect(laptimeBuilder.isLaptimeValid('1', '99', '000')).toBe(false)
  })

  it('returns false when milliseconds >= 1000', () => {
    expect(laptimeBuilder.isLaptimeValid('1', '23', '1000')).toBe(false)
  })

  it('returns false for negative values', () => {
    expect(laptimeBuilder.isLaptimeValid('-1', '23', '456')).toBe(false)
  })

  it('accepts edge case: 59 seconds, 999 ms', () => {
    expect(laptimeBuilder.isLaptimeValid('1', '59', '999')).toBe(true)
  })
})

describe('laptimeFromComponents', () => {
  it('builds a valid laptime string from components', () => {
    const result = laptimeBuilder.laptimeFromComponents('1', '23', '456')
    expect(result).toBe('1:23.456')
  })

  it('zero-pads seconds and milliseconds', () => {
    const result = laptimeBuilder.laptimeFromComponents('0', '05', '100')
    expect(result).toBe('0:05.100')
  })
})

describe('lap time round-trip', () => {
  it('laptimeToDate → dateToLaptime preserves the original string', () => {
    const original = '1:30.500'
    const dateResult = laptimeBuilder.laptimeToDate(original)
    const backToLaptime = laptimeBuilder.dateToLaptime(dateResult!)

    expect(backToLaptime).toBe(original)
  })
})
