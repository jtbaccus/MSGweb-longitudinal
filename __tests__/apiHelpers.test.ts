import { describe, it, expect, vi } from 'vitest'
import { apiError, validationError, handlePrismaError } from '@/lib/api-helpers'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// apiError
// ---------------------------------------------------------------------------

describe('apiError', () => {
  it('returns response with correct status and error message', async () => {
    const res = apiError('Not found', 404)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body).toEqual({ error: 'Not found' })
  })

  it('includes details when provided', async () => {
    const details = { name: ['Name is required'] }
    const res = apiError('Validation failed', 400, details)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({ error: 'Validation failed', details })
  })

  it('omits details when not provided', async () => {
    const res = apiError('Server error', 500)
    const body = await res.json()
    expect(body).not.toHaveProperty('details')
  })

  it('returns 200 status when specified', async () => {
    const res = apiError('OK', 200)
    expect(res.status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// validationError
// ---------------------------------------------------------------------------

describe('validationError', () => {
  it('transforms ZodError into 400 response with field-level details', async () => {
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
    })
    const result = schema.safeParse({ name: '', email: 'bad' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const res = validationError(result.error)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('Validation failed')
      expect(body.details.name).toBeDefined()
      expect(body.details.email).toBeDefined()
    }
  })

  it('returns empty details for schema with no field errors', async () => {
    // Refinement-only error has no fieldErrors
    const schema = z.object({ a: z.string() }).refine(() => false, 'Custom error')
    const result = schema.safeParse({ a: 'hello' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const res = validationError(result.error)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('Validation failed')
    }
  })
})

// ---------------------------------------------------------------------------
// handlePrismaError
// ---------------------------------------------------------------------------

describe('handlePrismaError', () => {
  it('returns 409 for P2002 (unique constraint)', async () => {
    const err = { code: 'P2002', meta: { target: ['email'] } }
    const res = handlePrismaError(err, 'Student')
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toBe('Student already exists')
  })

  it('returns 404 for P2025 (not found)', async () => {
    const err = { code: 'P2025' }
    const res = handlePrismaError(err, 'Evaluation')
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Evaluation not found')
  })

  it('returns 400 for P2003 (foreign key constraint)', async () => {
    const err = { code: 'P2003' }
    const res = handlePrismaError(err, 'Enrollment')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Related record not found')
  })

  it('returns 500 for unknown Prisma error code', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = { code: 'P9999' }
    const res = handlePrismaError(err, 'Student')
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Failed to process Student')
    vi.restoreAllMocks()
  })

  it('returns 500 for non-Prisma error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('Something went wrong')
    const res = handlePrismaError(err, 'Rotation')
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Failed to process Rotation')
    vi.restoreAllMocks()
  })

  it('returns 500 for null error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = handlePrismaError(null, 'Clerkship')
    expect(res.status).toBe(500)
    vi.restoreAllMocks()
  })

  it('uses entityName in the error message', async () => {
    const err = { code: 'P2002' }
    const res = handlePrismaError(err, 'CustomEntity')
    const body = await res.json()
    expect(body.error).toBe('CustomEntity already exists')
  })
})
