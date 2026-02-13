import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useLongitudinalStore } from '@/lib/stores/longitudinalStore'
import type {
  Student,
  Clerkship,
  Rotation,
  StudentEnrollment,
  SavedEvaluation,
  ProgressSummary,
} from '@/lib/types/longitudinal'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockStudent: Student = {
  id: 's1',
  name: 'Alice',
  email: 'alice@test.com',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockClerkship: Clerkship = {
  id: 'c1',
  name: 'Internal Medicine',
  templateId: 't1',
  type: 'LONGITUDINAL',
  durationWeeks: 8,
  evaluationIntervalDays: 7,
  createdAt: new Date(),
}

const mockRotation: Rotation = {
  id: 'r1',
  clerkshipId: 'c1',
  startDate: new Date('2025-01-06'),
  endDate: new Date('2025-03-03'),
  academicYear: '2024-2025',
  createdAt: new Date(),
}

const mockEnrollment: StudentEnrollment = {
  id: 'en1',
  studentId: 's1',
  rotationId: 'r1',
  startDate: new Date('2025-01-06'),
  status: 'ACTIVE',
  createdAt: new Date(),
}

const mockEvaluation: SavedEvaluation = {
  id: 'ev1',
  enrollmentId: 'en1',
  evaluatorName: 'Dr. Test',
  periodNumber: 1,
  evaluationDate: new Date(),
  performanceLevel: 'pass',
  selectedCriteriaIds: [],
  selectedAttributeIds: [],
  templateId: 't1',
  isComplete: true,
  isDraft: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockSummary: ProgressSummary = {
  id: 'sum1',
  enrollmentId: 'en1',
  authorName: 'Dr. Test',
  type: 'MID_COURSE',
  evaluationsIncluded: ['ev1'],
  overallPerformance: 'pass',
  createdAt: new Date(),
  updatedAt: new Date(),
}

function mockFetchSuccess(data: unknown) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  })
}

function mockFetchError(status: number, errorMsg: string) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: errorMsg }),
  })
}

function resetStore() {
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
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('longitudinalStore', () => {
  beforeEach(() => {
    resetStore()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  describe('initial state', () => {
    it('starts with mode=single', () => {
      resetStore()
      expect(useLongitudinalStore.getState().mode).toBe('single')
    })

    it('starts with all nulls for context', () => {
      resetStore()
      const state = useLongitudinalStore.getState()
      expect(state.currentStudent).toBeNull()
      expect(state.currentEnrollment).toBeNull()
      expect(state.currentRotation).toBeNull()
      expect(state.currentClerkship).toBeNull()
    })

    it('starts with empty arrays', () => {
      resetStore()
      const state = useLongitudinalStore.getState()
      expect(state.students).toEqual([])
      expect(state.clerkships).toEqual([])
      expect(state.rotations).toEqual([])
      expect(state.evaluations).toEqual([])
      expect(state.summaries).toEqual([])
    })

    it('starts with no loading or error', () => {
      resetStore()
      const state = useLongitudinalStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  // -------------------------------------------------------------------------
  // Simple setters
  // -------------------------------------------------------------------------

  describe('setMode', () => {
    it('toggles to longitudinal', () => {
      useLongitudinalStore.getState().setMode('longitudinal')
      expect(useLongitudinalStore.getState().mode).toBe('longitudinal')
    })

    it('toggles back to single', () => {
      useLongitudinalStore.getState().setMode('longitudinal')
      useLongitudinalStore.getState().setMode('single')
      expect(useLongitudinalStore.getState().mode).toBe('single')
    })
  })

  describe('setCurrentStudent', () => {
    it('sets a student', () => {
      useLongitudinalStore.getState().setCurrentStudent(mockStudent)
      expect(useLongitudinalStore.getState().currentStudent).toBe(mockStudent)
    })

    it('clears with null', () => {
      useLongitudinalStore.getState().setCurrentStudent(mockStudent)
      useLongitudinalStore.getState().setCurrentStudent(null)
      expect(useLongitudinalStore.getState().currentStudent).toBeNull()
    })
  })

  describe('setCurrentEnrollment', () => {
    it('sets an enrollment', () => {
      useLongitudinalStore.getState().setCurrentEnrollment(mockEnrollment)
      expect(useLongitudinalStore.getState().currentEnrollment).toBe(mockEnrollment)
    })

    it('clears with null', () => {
      useLongitudinalStore.getState().setCurrentEnrollment(mockEnrollment)
      useLongitudinalStore.getState().setCurrentEnrollment(null)
      expect(useLongitudinalStore.getState().currentEnrollment).toBeNull()
    })
  })

  describe('clearError', () => {
    it('resets error to null', () => {
      useLongitudinalStore.setState({ error: 'Something failed' })
      useLongitudinalStore.getState().clearError()
      expect(useLongitudinalStore.getState().error).toBeNull()
    })
  })

  // -------------------------------------------------------------------------
  // loadStudents
  // -------------------------------------------------------------------------

  describe('loadStudents', () => {
    it('sets students array on success', async () => {
      const students = [mockStudent]
      mockFetchSuccess(students)

      await useLongitudinalStore.getState().loadStudents()

      expect(useLongitudinalStore.getState().students).toEqual(students)
      expect(useLongitudinalStore.getState().isLoading).toBe(false)
      expect(useLongitudinalStore.getState().error).toBeNull()
    })

    it('encodes search param in URL', async () => {
      mockFetchSuccess([])

      await useLongitudinalStore.getState().loadStudents('test query')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/students?search=test%20query'
      )
    })

    it('calls /api/students without search param', async () => {
      mockFetchSuccess([])

      await useLongitudinalStore.getState().loadStudents()

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/students')
    })

    it('sets error message on API failure', async () => {
      mockFetchError(500, 'Database error')

      await useLongitudinalStore.getState().loadStudents()

      expect(useLongitudinalStore.getState().error).toBe('Database error')
      expect(useLongitudinalStore.getState().isLoading).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // loadClerkships
  // -------------------------------------------------------------------------

  describe('loadClerkships', () => {
    it('sets clerkships array on success', async () => {
      const clerkships = [mockClerkship]
      mockFetchSuccess(clerkships)

      await useLongitudinalStore.getState().loadClerkships()

      expect(useLongitudinalStore.getState().clerkships).toEqual(clerkships)
      expect(useLongitudinalStore.getState().isLoading).toBe(false)
    })

    it('encodes type param in URL', async () => {
      mockFetchSuccess([])

      await useLongitudinalStore.getState().loadClerkships('LONGITUDINAL')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/clerkships?type=LONGITUDINAL'
      )
    })

    it('sets error on failure', async () => {
      mockFetchError(500, 'Failed to load clerkships')

      await useLongitudinalStore.getState().loadClerkships()

      expect(useLongitudinalStore.getState().error).toBe('Failed to load clerkships')
    })
  })

  // -------------------------------------------------------------------------
  // loadRotations
  // -------------------------------------------------------------------------

  describe('loadRotations', () => {
    it('sets rotations array on success', async () => {
      const rotations = [mockRotation]
      mockFetchSuccess(rotations)

      await useLongitudinalStore.getState().loadRotations()

      expect(useLongitudinalStore.getState().rotations).toEqual(rotations)
      expect(useLongitudinalStore.getState().isLoading).toBe(false)
    })

    it('builds URL with both params', async () => {
      mockFetchSuccess([])

      await useLongitudinalStore.getState().loadRotations('c1', '2024-2025')

      const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
      expect(calledUrl).toContain('clerkshipId=c1')
      expect(calledUrl).toContain('academicYear=2024-2025')
    })

    it('sets error on failure', async () => {
      mockFetchError(500, 'Server error')

      await useLongitudinalStore.getState().loadRotations()

      expect(useLongitudinalStore.getState().error).toBe('Server error')
    })
  })

  // -------------------------------------------------------------------------
  // loadStudentProgress
  // -------------------------------------------------------------------------

  describe('loadStudentProgress', () => {
    it('sets all context fields from API response', async () => {
      const progressData = {
        student: mockStudent,
        enrollment: mockEnrollment,
        rotation: mockRotation,
        clerkship: mockClerkship,
        evaluations: [mockEvaluation],
        summaries: [mockSummary],
      }
      mockFetchSuccess(progressData)

      await useLongitudinalStore.getState().loadStudentProgress('en1')

      const state = useLongitudinalStore.getState()
      expect(state.currentStudent).toEqual(mockStudent)
      expect(state.currentEnrollment).toEqual(mockEnrollment)
      expect(state.currentRotation).toEqual(mockRotation)
      expect(state.currentClerkship).toEqual(mockClerkship)
      expect(state.evaluations).toEqual([mockEvaluation])
      expect(state.summaries).toEqual([mockSummary])
      expect(state.isLoading).toBe(false)
    })

    it('calls correct API endpoint', async () => {
      mockFetchSuccess({ student: null, enrollment: null, rotation: null, clerkship: null, evaluations: [], summaries: [] })

      await useLongitudinalStore.getState().loadStudentProgress('en123')

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/progress/en123')
    })
  })

  // -------------------------------------------------------------------------
  // saveEvaluation
  // -------------------------------------------------------------------------

  describe('saveEvaluation', () => {
    it('POSTs new evaluation (no id) to enrollments endpoint', async () => {
      const newEval = { ...mockEvaluation, id: undefined as unknown as string }
      const saved = { ...mockEvaluation, id: 'ev-new' }
      mockFetchSuccess(saved)

      const result = await useLongitudinalStore.getState().saveEvaluation(newEval)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        `/api/enrollments/${newEval.enrollmentId}/evaluations`,
        expect.objectContaining({ method: 'POST' })
      )
      expect(result).toEqual(saved)
      expect(useLongitudinalStore.getState().evaluations).toContainEqual(saved)
    })

    it('PUTs existing evaluation (has id) to evaluations endpoint', async () => {
      useLongitudinalStore.setState({ evaluations: [mockEvaluation] })
      const updated = { ...mockEvaluation, performanceLevel: 'honors' as const }
      mockFetchSuccess(updated)

      const result = await useLongitudinalStore.getState().saveEvaluation(mockEvaluation)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        `/api/evaluations/${mockEvaluation.id}`,
        expect.objectContaining({ method: 'PUT' })
      )
      expect(result).toEqual(updated)
      expect(useLongitudinalStore.getState().evaluations[0]).toEqual(updated)
    })

    it('throws on API error', async () => {
      mockFetchError(400, 'Bad request')

      await expect(
        useLongitudinalStore.getState().saveEvaluation(mockEvaluation)
      ).rejects.toThrow('Bad request')
    })
  })

  // -------------------------------------------------------------------------
  // submitEvaluation
  // -------------------------------------------------------------------------

  describe('submitEvaluation', () => {
    it('POSTs to submit endpoint and replaces in array', async () => {
      useLongitudinalStore.setState({ evaluations: [mockEvaluation] })
      const submitted = { ...mockEvaluation, isComplete: true, isDraft: false }
      mockFetchSuccess(submitted)

      await useLongitudinalStore.getState().submitEvaluation('ev1')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/evaluations/ev1/submit',
        expect.objectContaining({ method: 'POST' })
      )
      expect(useLongitudinalStore.getState().evaluations[0]).toEqual(submitted)
    })

    it('throws on API error', async () => {
      mockFetchError(500, 'Submit failed')

      await expect(
        useLongitudinalStore.getState().submitEvaluation('ev1')
      ).rejects.toThrow('Submit failed')
    })
  })

  // -------------------------------------------------------------------------
  // generateSummary
  // -------------------------------------------------------------------------

  describe('generateSummary', () => {
    it('POSTs to generate-summary and appends to summaries', async () => {
      mockFetchSuccess(mockSummary)

      const result = await useLongitudinalStore.getState().generateSummary('en1', 'MID_COURSE')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/generate-summary',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ enrollmentId: 'en1', type: 'MID_COURSE' }),
        })
      )
      expect(result).toEqual(mockSummary)
      expect(useLongitudinalStore.getState().summaries).toContainEqual(mockSummary)
    })

    it('throws on API error', async () => {
      mockFetchError(500, 'Generation failed')

      await expect(
        useLongitudinalStore.getState().generateSummary('en1', 'MID_COURSE')
      ).rejects.toThrow('Generation failed')
    })
  })

  // -------------------------------------------------------------------------
  // updateSummary
  // -------------------------------------------------------------------------

  describe('updateSummary', () => {
    it('PUTs to summaries endpoint and replaces in array', async () => {
      useLongitudinalStore.setState({ summaries: [mockSummary] })
      const updated = { ...mockSummary, editedNarrative: 'Updated text' }
      mockFetchSuccess(updated)

      const result = await useLongitudinalStore.getState().updateSummary('sum1', {
        editedNarrative: 'Updated text',
      })

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/summaries/sum1',
        expect.objectContaining({ method: 'PUT' })
      )
      expect(result).toEqual(updated)
      expect(useLongitudinalStore.getState().summaries[0]).toEqual(updated)
    })

    it('throws on API error', async () => {
      mockFetchError(500, 'Update failed')

      await expect(
        useLongitudinalStore.getState().updateSummary('sum1', {})
      ).rejects.toThrow('Update failed')
    })
  })

  // -------------------------------------------------------------------------
  // getProgressView
  // -------------------------------------------------------------------------

  describe('getProgressView', () => {
    it('returns null when currentStudent is missing', () => {
      expect(useLongitudinalStore.getState().getProgressView()).toBeNull()
    })

    it('returns null when currentEnrollment is missing', () => {
      useLongitudinalStore.setState({ currentStudent: mockStudent })
      expect(useLongitudinalStore.getState().getProgressView()).toBeNull()
    })

    it('returns null when currentClerkship is missing', () => {
      useLongitudinalStore.setState({
        currentStudent: mockStudent,
        currentEnrollment: mockEnrollment,
      })
      expect(useLongitudinalStore.getState().getProgressView()).toBeNull()
    })

    it('returns computed view when all context is present', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-20'))

      useLongitudinalStore.setState({
        currentStudent: mockStudent,
        currentEnrollment: mockEnrollment,
        currentRotation: mockRotation,
        currentClerkship: mockClerkship,
        evaluations: [mockEvaluation],
        summaries: [mockSummary],
      })

      const view = useLongitudinalStore.getState().getProgressView()
      expect(view).not.toBeNull()
      expect(view!.student).toEqual(mockStudent)
      expect(view!.totalPeriods).toBe(8)
      expect(view!.currentPeriod).toBeGreaterThanOrEqual(1)
      expect(view!.progressPercentage).toBeGreaterThanOrEqual(0)
      expect(view!.performanceTrend).toBe('insufficient_data')

      vi.useRealTimers()
    })
  })

  // -------------------------------------------------------------------------
  // getPerformanceTrend
  // -------------------------------------------------------------------------

  describe('getPerformanceTrend', () => {
    it('delegates to calculateTrend with current evaluations', () => {
      expect(useLongitudinalStore.getState().getPerformanceTrend()).toBe('insufficient_data')
    })

    it('returns correct trend when evaluations are present', () => {
      useLongitudinalStore.setState({
        evaluations: [
          { ...mockEvaluation, id: 'ev1', periodNumber: 1, performanceLevel: 'FAIL' as any },
          { ...mockEvaluation, id: 'ev2', periodNumber: 2, performanceLevel: 'FAIL' as any },
          { ...mockEvaluation, id: 'ev3', periodNumber: 3, performanceLevel: 'PASS' as any },
          { ...mockEvaluation, id: 'ev4', periodNumber: 4, performanceLevel: 'HONORS' as any },
        ],
      })
      expect(useLongitudinalStore.getState().getPerformanceTrend()).toBe('improving')
    })
  })
})
