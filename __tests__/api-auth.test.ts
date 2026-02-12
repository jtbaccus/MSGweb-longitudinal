import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

import { getServerSession } from 'next-auth'
import { requireAuth, requireAdmin } from '@/lib/api-auth'

const mockGetServerSession = vi.mocked(getServerSession)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('requireAuth', () => {
  it('returns session when authenticated', async () => {
    const session = { user: { id: '1', role: 'USER', email: 'test@test.com' } }
    mockGetServerSession.mockResolvedValue(session)

    const result = await requireAuth()
    expect(result.session).toEqual(session)
    expect(result.error).toBeUndefined()
  })

  it('returns 401 error when not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const result = await requireAuth()
    expect(result.session).toBeUndefined()
    expect(result.error).toBeDefined()
    expect(result.error!.status).toBe(401)
    const body = await result.error!.json()
    expect(body.error).toBe('Unauthorized')
  })
})

describe('requireAdmin', () => {
  it('returns session when user is admin', async () => {
    const session = { user: { id: '1', role: 'ADMIN', email: 'admin@test.com' } }
    mockGetServerSession.mockResolvedValue(session)

    const result = await requireAdmin()
    expect(result.session).toEqual(session)
    expect(result.error).toBeUndefined()
  })

  it('returns 403 error when user is not admin', async () => {
    const session = { user: { id: '1', role: 'USER', email: 'user@test.com' } }
    mockGetServerSession.mockResolvedValue(session)

    const result = await requireAdmin()
    expect(result.session).toBeUndefined()
    expect(result.error).toBeDefined()
    expect(result.error!.status).toBe(403)
    const body = await result.error!.json()
    expect(body.error).toBe('Forbidden')
  })

  it('returns 401 error when not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const result = await requireAdmin()
    expect(result.session).toBeUndefined()
    expect(result.error).toBeDefined()
    expect(result.error!.status).toBe(401)
  })
})
