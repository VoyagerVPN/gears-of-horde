import { describe, it, expect } from 'vitest'
import { normalizeGameVersion, compareGameVersions, isValidUrl } from './utils'

describe('normalizeGameVersion', () => {
  it('should normalize standard versions', () => {
    expect(normalizeGameVersion('2.2')).toBe('V2.2')
    expect(normalizeGameVersion('v2.2')).toBe('V2.2')
    expect(normalizeGameVersion('V2.2')).toBe('V2.2')
  })

  it('should normalize alpha versions', () => {
    expect(normalizeGameVersion('a20')).toBe('A20')
    expect(normalizeGameVersion('A21')).toBe('A21')
  })

  it('should handle N/A', () => {
    expect(normalizeGameVersion('N/A')).toBe('N/A')
  })

  it('should handle build numbers', () => {
    expect(normalizeGameVersion('v1.1b14')).toBe('V1.1b14')
  })
})

describe('compareGameVersions', () => {
  it('should compare correctly', () => {
    expect(compareGameVersions('A20', 'A21')).toBeLessThan(0)
    expect(compareGameVersions('A21', 'V1.0')).toBeLessThan(0)
    expect(compareGameVersions('V1.0', 'V1.1')).toBeLessThan(0)
    expect(compareGameVersions('V1.1', 'V1.1b14')).toBeLessThan(0)
  })

  it('should handle N/A as oldest', () => {
    expect(compareGameVersions('N/A', 'A20')).toBeLessThan(0)
    expect(compareGameVersions('N/A', 'N/A')).toBe(0)
  })
})

describe('isValidUrl', () => {
  it('should return true for valid URLs', () => {
    expect(isValidUrl('https://google.com')).toBe(true)
    expect(isValidUrl('http://localhost:3000')).toBe(true)
  })

  it('should return false for invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false)
    expect(isValidUrl('')).toBe(false)
  })
})
