import { describe, it, expect } from 'vitest'
import { parsePagination } from '@/lib/api-helpers'
import { NextRequest } from 'next/server'

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/test')
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val)
  }
  return new NextRequest(url)
}

describe('parsePagination', () => {
  it('returns defaults when no params', () => {
    const req = makeRequest()
    const result = parsePagination(req)
    expect(result).toEqual({ skip: 0, take: 25, page: 1, pageSize: 25 })
  })

  it('parses page and pageSize', () => {
    const req = makeRequest({ page: '3', pageSize: '10' })
    const result = parsePagination(req)
    expect(result).toEqual({ skip: 20, take: 10, page: 3, pageSize: 10 })
  })

  it('clamps page to minimum 1', () => {
    const req = makeRequest({ page: '0' })
    const result = parsePagination(req)
    expect(result.page).toBe(1)
    expect(result.skip).toBe(0)
  })

  it('clamps pageSize to max 100', () => {
    const req = makeRequest({ pageSize: '200' })
    const result = parsePagination(req)
    expect(result.pageSize).toBe(100)
  })

  it('clamps pageSize to min 1', () => {
    const req = makeRequest({ pageSize: '-5' })
    const result = parsePagination(req)
    expect(result.pageSize).toBe(1)
  })

  it('handles non-numeric input gracefully', () => {
    const req = makeRequest({ page: 'abc', pageSize: 'xyz' })
    const result = parsePagination(req)
    expect(result).toEqual({ skip: 0, take: 25, page: 1, pageSize: 25 })
  })
})
