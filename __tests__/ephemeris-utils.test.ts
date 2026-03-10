import { describe, it, expect } from 'vitest'
import {
  formatDisplayDate,
  isValidDayMonth,
  buildEphemerisPrompt,
  buildGenerationPayload,
} from '@/lib/ephemeris-utils'

describe('formatDisplayDate', () => {
  it('zero-pads month and day', () => {
    expect(formatDisplayDate(2024, 3, 7)).toBe('2024-03-07')
  })

  it('handles double-digit month and day', () => {
    expect(formatDisplayDate(2024, 12, 31)).toBe('2024-12-31')
  })

  it('handles single-digit month with double-digit day', () => {
    expect(formatDisplayDate(2000, 1, 15)).toBe('2000-01-15')
  })
})

describe('isValidDayMonth', () => {
  it('accepts valid day and month', () => {
    expect(isValidDayMonth(15, 6)).toBe(true)
  })

  it('accepts boundary values (1, 1)', () => {
    expect(isValidDayMonth(1, 1)).toBe(true)
  })

  it('accepts boundary values (31, 12)', () => {
    expect(isValidDayMonth(31, 12)).toBe(true)
  })

  it('rejects day 0', () => {
    expect(isValidDayMonth(0, 6)).toBe(false)
  })

  it('rejects day 32', () => {
    expect(isValidDayMonth(32, 6)).toBe(false)
  })

  it('rejects month 0', () => {
    expect(isValidDayMonth(15, 0)).toBe(false)
  })

  it('rejects month 13', () => {
    expect(isValidDayMonth(15, 13)).toBe(false)
  })

  it('rejects non-integer day', () => {
    expect(isValidDayMonth(1.5, 6)).toBe(false)
  })

  it('rejects non-integer month', () => {
    expect(isValidDayMonth(15, 6.5)).toBe(false)
  })
})

describe('buildEphemerisPrompt', () => {
  it('includes the day and month in the prompt', () => {
    const prompt = buildEphemerisPrompt(10, 3)
    expect(prompt).toContain('3/10')
  })

  it('requests Spanish-language output', () => {
    const prompt = buildEphemerisPrompt(1, 1)
    expect(prompt.toLowerCase()).toContain('spanish')
  })

  it('specifies the expected output format', () => {
    const prompt = buildEphemerisPrompt(5, 7)
    expect(prompt).toContain('DD/MM/YYYY')
  })
})

describe('buildGenerationPayload', () => {
  it('returns an object with day, month, and year', () => {
    const payload = buildGenerationPayload(10, 3, 2026)
    expect(payload).toEqual({ day: 10, month: 3, year: 2026 })
  })

  it('preserves the exact values provided', () => {
    const payload = buildGenerationPayload(1, 1, 2000)
    expect(payload.day).toBe(1)
    expect(payload.month).toBe(1)
    expect(payload.year).toBe(2000)
  })
})
