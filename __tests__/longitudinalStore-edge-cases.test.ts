import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchSuccess(data: unknown) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  })
}

function mockFetchFailure(status = 500, error = 'Server error') {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error }),
  })
}

function mockFetchNetworkError() {
  globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network failure'))
}

// ---------------------------------------------------------------------------
// Store edge cases
// ---------------------------------------------------------------------------

describe('longitudinalStore edge cases', () => {
  beforeEach(() => {
    useLongitudinalStore.setState({
      mode: 'single',
      currentStudent: null,
      currentEnrollment: null,
      currentRotation: null,
      currentClerkship: null,
      students: [],
      clerkships: [],
      rotations: [],
      evaluations: [],
      summaries: [],
      isLoading: false,
      error: null,
      isInEvaluationFlow: false,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ---------------------------------------------------------------------------
  // Mode toggle
  // ---------------------------------------------------------------------------

  describe('mode toggle', () => {
    it('toggles from single to longitudinal', () => {
      useLongitudinalStore.getState().setMode('longitudinal')
      expect(useLongitudinalStore.getState().mode).toBe('longitudinal')
    })

    it('toggles from longitudinal back to single', () => {
      useLongitudinalStore.setState({ mode: 'longitudinal' })
      useLongitudinalStore.getState().setMode('single')
      expect(useLongitudinalStore.getState().mode).toBe('single')
    })

    it('preserves other state when toggling mode', () => {
      useLongitudinalStore.setState({
        mode: 'longitudinal',
        students: [{ id: 's1', name: 'Alice', createdAt: new Date(), updatedAt: new Date() }],
      })
      useLongitudinalStore.getState().setMode('single')
      expect(useLongitudinalStore.getState().students).toHaveLength(1)
    })
  })

  // ---------------------------------------------------------------------------
  // Empty API responses
  // ---------------------------------------------------------------------------

  describe('empty API responses', () => {
    it('loadStudents handles empty array response', async () => {
      mockFetchSuccess([])
      await useLongitudinalStore.getState().loadStudents()
      expect(useLongitudinalStore.getState().students).toEqual([])
      expect(useLongitudinalStore.getState().isLoading).toBe(false)
    })

    it('loadClerkships handles empty array response', async () => {
      mockFetchSuccess([])
      await useLongitudinalStore.getState().loadClerkships()
      expect(useLongitudinalStore.getState().clerkships).toEqual([])
      expect(useLongitudinalStore.getState().isLoading).toBe(false)
    })

    it('loadRotations handles empty array response', async () => {
      mockFetchSuccess([])
      await useLongitudinalStore.getState().loadRotations()
      expect(useLongitudinalStore.getState().rotations).toEqual([])
      expect(useLongitudinalStore.getState().isLoading).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // Network errors
  // ---------------------------------------------------------------------------

  describe('network errors', () => {
    it('loadStudents sets error on network failure', async () => {
      mockFetchNetworkError()
      await useLongitudinalStore.getState().loadStudents()
      expect(useLongitudinalStore.getState().error).toBe('Network failure')
      expect(useLongitudinalStore.getState().isLoading).toBe(false)
    })

    it('loadClerkships sets error on network failure', async () => {
      mockFetchNetworkError()
      await useLongitudinalStore.getState().loadClerkships()
      expect(useLongitudinalStore.getState().error).toBe('Network failure')
      expect(useLongitudinalStore.getState().isLoading).toBe(false)
    })

    it('loadStudentProgress sets error on API failure', async () => {
      mockFetchFailure(404, 'Enrollment not found')
      await useLongitudinalStore.getState().loadStudentProgress('nonexistent')
      expect(useLongitudinalStore.getState().error).toBeTruthy()
      expect(useLongitudinalStore.getState().isLoading).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // Context clearing
  // ---------------------------------------------------------------------------

  describe('context operations', () => {
    it('setCurrentStudent to null clears student', () => {
      useLongitudinalStore.setState({
        currentStudent: { id: 's1', name: 'Alice', createdAt: new Date(), updatedAt: new Date() },
      })
      useLongitudinalStore.getState().setCurrentStudent(null)
      expect(useLongitudinalStore.getState().currentStudent).toBeNull()
    })

    it('setCurrentEnrollment to null clears enrollment', () => {
      useLongitudinalStore.setState({
        currentEnrollment: {
          id: 'en1',
          studentId: 's1',
          rotationId: 'r1',
          startDate: new Date(),
          status: 'ACTIVE',
          createdAt: new Date(),
        },
      })
      useLongitudinalStore.getState().setCurrentEnrollment(null)
      expect(useLongitudinalStore.getState().currentEnrollment).toBeNull()
    })

    it('evaluation flow flag toggles correctly', () => {
      expect(useLongitudinalStore.getState().isInEvaluationFlow).toBe(false)
      useLongitudinalStore.getState().setIsInEvaluationFlow(true)
      expect(useLongitudinalStore.getState().isInEvaluationFlow).toBe(true)
      useLongitudinalStore.getState().setIsInEvaluationFlow(false)
      expect(useLongitudinalStore.getState().isInEvaluationFlow).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // Computed getters with no data
  // ---------------------------------------------------------------------------

  describe('computed getters with no data', () => {
    it('getProgressView returns null when no student set', () => {
      const view = useLongitudinalStore.getState().getProgressView()
      expect(view).toBeNull()
    })

    it('getProgressView returns null when no enrollment set', () => {
      useLongitudinalStore.setState({
        currentStudent: { id: 's1', name: 'Alice', createdAt: new Date(), updatedAt: new Date() },
      })
      const view = useLongitudinalStore.getState().getProgressView()
      expect(view).toBeNull()
    })

    it('getPeriodStatuses returns empty when no enrollment', () => {
      const statuses = useLongitudinalStore.getState().getPeriodStatuses()
      expect(statuses).toEqual([])
    })

    it('getPerformanceTrend returns insufficient_data with no evaluations', () => {
      const trend = useLongitudinalStore.getState().getPerformanceTrend()
      expect(trend).toBe('insufficient_data')
    })
  })
})
