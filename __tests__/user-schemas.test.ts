import { describe, it, expect } from 'vitest'
import { createUserSchema, updateUserSchema } from '@/lib/validations/schemas'

describe('createUserSchema', () => {
  it('validates correct user data', () => {
    const result = createUserSchema.safeParse({
      email: 'admin@example.com',
      password: 'securepass123',
      name: 'Admin User',
      role: 'ADMIN',
    })
    expect(result.success).toBe(true)
  })

  it('requires valid email', () => {
    const result = createUserSchema.safeParse({
      email: 'not-an-email',
      password: 'securepass123',
    })
    expect(result.success).toBe(false)
  })

  it('requires password of at least 8 characters', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('allows optional fields', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      password: 'securepass123',
    })
    expect(result.success).toBe(true)
  })

  it('validates role enum', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      password: 'securepass123',
      role: 'SUPERADMIN',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateUserSchema', () => {
  it('allows partial updates', () => {
    const result = updateUserSchema.safeParse({
      name: 'New Name',
    })
    expect(result.success).toBe(true)
  })

  it('validates password when provided', () => {
    const result = updateUserSchema.safeParse({
      password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('allows empty object', () => {
    const result = updateUserSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
