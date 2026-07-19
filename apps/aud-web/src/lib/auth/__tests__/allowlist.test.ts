import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { isAllowlistActive, isEmailAllowed } from '../allowlist'

const ORIGINAL = process.env.BETA_ALLOWLIST

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.BETA_ALLOWLIST
  else process.env.BETA_ALLOWLIST = ORIGINAL
})

describe('allowlist — dormant (BETA_ALLOWLIST unset/empty)', () => {
  beforeEach(() => {
    delete process.env.BETA_ALLOWLIST
  })

  it('is inactive', () => {
    expect(isAllowlistActive()).toBe(false)
  })

  it('allows any email, including none', () => {
    expect(isEmailAllowed('anyone@example.com')).toBe(true)
    expect(isEmailAllowed(null)).toBe(true)
    expect(isEmailAllowed(undefined)).toBe(true)
  })

  it('treats an empty string as unset', () => {
    process.env.BETA_ALLOWLIST = '   '
    expect(isAllowlistActive()).toBe(false)
    expect(isEmailAllowed('stranger@example.com')).toBe(true)
  })
})

describe('allowlist — active (BETA_ALLOWLIST set)', () => {
  beforeEach(() => {
    process.env.BETA_ALLOWLIST = 'sadactmusic@gmail.com, Chris@Example.com'
  })

  it('is active', () => {
    expect(isAllowlistActive()).toBe(true)
  })

  it('allows listed emails case-insensitively and trims whitespace', () => {
    expect(isEmailAllowed('sadactmusic@gmail.com')).toBe(true)
    expect(isEmailAllowed('SADACTMUSIC@gmail.com')).toBe(true)
    expect(isEmailAllowed('  chris@example.com  ')).toBe(true)
  })

  it('denies unlisted emails and missing emails', () => {
    expect(isEmailAllowed('stranger@example.com')).toBe(false)
    expect(isEmailAllowed(null)).toBe(false)
    expect(isEmailAllowed(undefined)).toBe(false)
  })
})
