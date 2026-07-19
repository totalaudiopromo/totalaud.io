import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { isAllowlistActive, isEmailAllowed } from '../allowlist'

const ORIGINAL = process.env.BETA_ALLOWLIST

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.BETA_ALLOWLIST
  else process.env.BETA_ALLOWLIST = ORIGINAL
})

describe('allowlist — default (BETA_ALLOWLIST unset)', () => {
  beforeEach(() => {
    delete process.env.BETA_ALLOWLIST
  })

  it('is active by default (gate ships on)', () => {
    expect(isAllowlistActive()).toBe(true)
  })

  it('allows the built-in beta testers, case-insensitively', () => {
    expect(isEmailAllowed('sadactmusic@gmail.com')).toBe(true)
    expect(isEmailAllowed('SchoField.Christopher@gmail.com')).toBe(true)
  })

  it('denies strangers and missing emails', () => {
    expect(isEmailAllowed('stranger@example.com')).toBe(false)
    expect(isEmailAllowed(null)).toBe(false)
    expect(isEmailAllowed(undefined)).toBe(false)
  })
})

describe('allowlist — reopened (explicit off token)', () => {
  it.each(['off', '*', '', '   '])('treats %o as "gate off, allow all"', (val) => {
    process.env.BETA_ALLOWLIST = val
    expect(isAllowlistActive()).toBe(false)
    expect(isEmailAllowed('anyone@example.com')).toBe(true)
    expect(isEmailAllowed(null)).toBe(true)
  })
})

describe('allowlist — explicit list overrides the default', () => {
  beforeEach(() => {
    process.env.BETA_ALLOWLIST = 'tester@example.com, Second@Example.com'
  })

  it('is active', () => {
    expect(isAllowlistActive()).toBe(true)
  })

  it('allows only the configured emails, trimmed and case-insensitive', () => {
    expect(isEmailAllowed('tester@example.com')).toBe(true)
    expect(isEmailAllowed('  second@example.com  ')).toBe(true)
  })

  it('no longer allows the built-in defaults once overridden', () => {
    expect(isEmailAllowed('sadactmusic@gmail.com')).toBe(false)
    expect(isEmailAllowed('stranger@example.com')).toBe(false)
  })
})
