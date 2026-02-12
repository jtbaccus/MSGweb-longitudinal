import { describe, it, expect, vi } from 'vitest'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    student: { findMany: vi.fn() },
    evaluation: { findMany: vi.fn() },
    studentEnrollment: { findMany: vi.fn() },
    progressSummary: { findMany: vi.fn() },
  },
}))

// Mock api-auth
vi.mock('@/lib/api-auth', () => ({
  requireAdmin: vi.fn(),
}))

import { requireAdmin } from '@/lib/api-auth'
import prisma from '@/lib/prisma'
import { GET } from '@/app/api/export-data/route'
import { NextRequest } from 'next/server'

const mockRequireAdmin = vi.mocked(requireAdmin)
const mockPrisma = vi.mocked(prisma)

describe('GET /api/export-data', () => {
  it('returns 401 when not admin', async () => {
    const { NextResponse } = await import('next/server')
    mockRequireAdmin.mockResolvedValue({
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const req = new NextRequest('http://localhost/api/export-data?type=students')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid type', async () => {
    mockRequireAdmin.mockResolvedValue({
      session: { user: { id: '1', role: 'ADMIN' as const, email: 'a@b.com', mustChangePassword: false }, expires: '' },
    })

    const req = new NextRequest('http://localhost/api/export-data?type=invalid')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('exports students as CSV', async () => {
    mockRequireAdmin.mockResolvedValue({
      session: { user: { id: '1', role: 'ADMIN' as const, email: 'a@b.com', mustChangePassword: false }, expires: '' },
    })

    mockPrisma.student.findMany.mockResolvedValue([
      { id: '1', name: 'Test Student', email: 'test@test.com', medicalSchoolId: 'MS001', createdAt: new Date('2025-01-01'), updatedAt: new Date('2025-01-01') },
    ] as never)

    const req = new NextRequest('http://localhost/api/export-data?type=students')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')

    const text = await res.text()
    expect(text).toContain('id,name,email,medicalSchoolId,createdAt')
    expect(text).toContain('Test Student')
  })
})
