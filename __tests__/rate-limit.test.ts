import { describe, it, expect } from 'vitest'
import { checkRateLimit } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  const config = { maxTokens: 3, refillRate: 1, windowMs: 60_000 }

  it('allows requests within limit', () => {
    const key = `test-allow-${Date.now()}`
    const result = checkRateLimit(key, config)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('tracks token consumption', () => {
    const key = `test-consume-${Date.now()}`
    checkRateLimit(key, config)
    checkRateLimit(key, config)
    const result = checkRateLimit(key, config)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(0)
  })

  it('rejects when tokens exhausted', () => {
    const key = `test-reject-${Date.now()}`
    checkRateLimit(key, config)
    checkRateLimit(key, config)
    checkRateLimit(key, config)
    const result = checkRateLimit(key, config)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfter).toBeDefined()
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('uses separate buckets for different keys', () => {
    const key1 = `test-key1-${Date.now()}`
    const key2 = `test-key2-${Date.now()}`
    checkRateLimit(key1, config)
    checkRateLimit(key1, config)
    checkRateLimit(key1, config)

    const result = checkRateLimit(key2, config)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
  })
})
