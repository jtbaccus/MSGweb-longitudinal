import { describe, it, expect } from 'vitest'
import { parseCSV } from '@/lib/utils/csv'

describe('parseCSV', () => {
  // ---------------------------------------------------------------------------
  // Happy path
  // ---------------------------------------------------------------------------

  it('parses valid CSV with required columns', () => {
    const csv = 'name,email\nAlice,alice@example.com\nBob,bob@example.com'
    const result = parseCSV(csv, ['name', 'email'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual({ name: 'Alice', email: 'alice@example.com' })
    expect(result.rows[1]).toEqual({ name: 'Bob', email: 'bob@example.com' })
  })

  // ---------------------------------------------------------------------------
  // Error cases
  // ---------------------------------------------------------------------------

  it('returns error for header-only CSV (no data rows)', () => {
    const csv = 'name,email'
    const result = parseCSV(csv, ['name'])
    expect(result.rows).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatch(/header row/)
  })

  it('returns error for empty string', () => {
    const result = parseCSV('', ['name'])
    expect(result.rows).toHaveLength(0)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('returns error naming the missing required column', () => {
    const csv = 'name,age\nAlice,25'
    const result = parseCSV(csv, ['name', 'email'])
    expect(result.rows).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('email')
  })

  it('reports all missing required columns', () => {
    const csv = 'age\n25'
    const result = parseCSV(csv, ['name', 'email'])
    expect(result.errors).toHaveLength(2)
    expect(result.errors[0]).toContain('name')
    expect(result.errors[1]).toContain('email')
  })

  // ---------------------------------------------------------------------------
  // Column handling
  // ---------------------------------------------------------------------------

  it('ignores extra columns (rows still valid)', () => {
    const csv = 'name,email,phone\nAlice,alice@example.com,555-1234'
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]).toEqual({ name: 'Alice', email: 'alice@example.com', phone: '555-1234' })
  })

  it('matches headers case-insensitively', () => {
    const csv = 'Name,EMAIL\nAlice,alice@example.com'
    const result = parseCSV(csv, ['name', 'email'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]).toEqual({ name: 'Alice', email: 'alice@example.com' })
  })

  // ---------------------------------------------------------------------------
  // Whitespace handling
  // ---------------------------------------------------------------------------

  it('trims whitespace from headers', () => {
    const csv = ' name , email \nAlice,alice@example.com'
    const result = parseCSV(csv, ['name', 'email'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Alice')
  })

  it('trims whitespace from values', () => {
    const csv = 'name,email\n  Alice , alice@example.com '
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows[0].name).toBe('Alice')
    expect(result.rows[0].email).toBe('alice@example.com')
  })

  it('skips empty lines between data', () => {
    const csv = 'name,email\nAlice,alice@example.com\n\nBob,bob@example.com\n'
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(2)
  })

  // ---------------------------------------------------------------------------
  // Row validation
  // ---------------------------------------------------------------------------

  it('errors with row number for missing required value', () => {
    const csv = 'name,email\nAlice,alice@example.com\n,bob@example.com'
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('Row 3')
    expect(result.errors[0]).toContain('name')
    // Valid row is still included
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Alice')
  })

  it('handles partial rows (fewer values than headers)', () => {
    const csv = 'name,email,phone\nAlice'
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Alice')
    expect(result.rows[0].email).toBe('')
    expect(result.rows[0].phone).toBe('')
  })

  it('validates all required columns in each row', () => {
    const csv = 'name,email\n,\nAlice,alice@example.com'
    const result = parseCSV(csv, ['name', 'email'])
    // Row 2 (index 1) missing both name and email
    expect(result.errors.length).toBeGreaterThanOrEqual(1)
    // Valid row still included
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Alice')
  })

  it('returns both rows and errors when some rows are invalid', () => {
    const csv = 'name,email\nAlice,alice@test.com\n,missing-name\nBob,bob@test.com'
    const result = parseCSV(csv, ['name'])
    expect(result.rows).toHaveLength(2)
    expect(result.errors).toHaveLength(1)
  })

  // ---------------------------------------------------------------------------
  // Single required column
  // ---------------------------------------------------------------------------

  it('works with single required column', () => {
    const csv = 'name\nAlice\nBob'
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(2)
  })

  // ---------------------------------------------------------------------------
  // Empty required columns array
  // ---------------------------------------------------------------------------

  it('works with no required columns', () => {
    const csv = 'name,email\nAlice,alice@example.com'
    const result = parseCSV(csv, [])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(1)
  })
})
