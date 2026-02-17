import { describe, it, expect } from 'vitest'
import { parseCSV } from '@/lib/utils/csv'

describe('parseCSV edge cases', () => {
  // ---------------------------------------------------------------------------
  // Empty / minimal input
  // ---------------------------------------------------------------------------

  it('returns error for completely empty string', () => {
    const result = parseCSV('', ['name'])
    expect(result.rows).toHaveLength(0)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('returns error for whitespace-only input', () => {
    const result = parseCSV('   \n  \n  ', ['name'])
    expect(result.rows).toHaveLength(0)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('returns error for header-only CSV (no data rows)', () => {
    const result = parseCSV('name,email', ['name'])
    expect(result.rows).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatch(/header row/)
  })

  // ---------------------------------------------------------------------------
  // Duplicate entries
  // ---------------------------------------------------------------------------

  it('includes duplicate student names as separate rows', () => {
    const csv = 'name,email\nAlice,alice1@test.com\nAlice,alice2@test.com'
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0].name).toBe('Alice')
    expect(result.rows[1].name).toBe('Alice')
  })

  it('includes rows with duplicate emails as separate entries', () => {
    const csv = 'name,email\nAlice,same@test.com\nBob,same@test.com'
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(2)
  })

  // ---------------------------------------------------------------------------
  // Malformed rows
  // ---------------------------------------------------------------------------

  it('handles rows with extra columns (more values than headers)', () => {
    const csv = 'name,email\nAlice,alice@test.com,extra-value,another-extra'
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Alice')
  })

  it('handles rows with fewer values than headers', () => {
    const csv = 'name,email,phone\nAlice'
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].email).toBe('')
    expect(result.rows[0].phone).toBe('')
  })

  it('handles single empty data row', () => {
    const csv = 'name,email\n,'
    const result = parseCSV(csv, ['name'])
    expect(result.rows).toHaveLength(0)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  // ---------------------------------------------------------------------------
  // Unicode and special characters
  // ---------------------------------------------------------------------------

  it('handles unicode characters in names', () => {
    const csv = 'name,email\nJosé García,jose@test.com\nSøren Müller,soren@test.com'
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0].name).toBe('José García')
    expect(result.rows[1].name).toBe('Søren Müller')
  })

  it('handles names with apostrophes', () => {
    const csv = "name,email\nO'Brien,obrien@test.com"
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe("O'Brien")
  })

  // ---------------------------------------------------------------------------
  // Large input
  // ---------------------------------------------------------------------------

  it('handles large CSV input (100+ rows)', () => {
    const header = 'name,email'
    const rows = Array.from({ length: 150 }, (_, i) => `Student${i},student${i}@test.com`)
    const csv = [header, ...rows].join('\n')
    const result = parseCSV(csv, ['name', 'email'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(150)
  })

  // ---------------------------------------------------------------------------
  // Mixed valid and invalid rows
  // ---------------------------------------------------------------------------

  it('collects errors for multiple invalid rows while keeping valid ones', () => {
    const csv = 'name,email\n,\nAlice,alice@test.com\n,\nBob,bob@test.com\n,'
    const result = parseCSV(csv, ['name'])
    expect(result.rows).toHaveLength(2)
    expect(result.errors).toHaveLength(3) // 3 rows missing name
  })

  it('handles trailing newlines', () => {
    const csv = 'name,email\nAlice,alice@test.com\n\n\n'
    const result = parseCSV(csv, ['name'])
    expect(result.errors).toHaveLength(0)
    expect(result.rows).toHaveLength(1)
  })
})
