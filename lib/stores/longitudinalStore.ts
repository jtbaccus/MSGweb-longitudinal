import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Student,
  Clerkship,
  Rotation,
  StudentEnrollment,
  SavedEvaluation,
  ProgressSummary,
  StudentProgressView,
  PeriodStatus,
  PerformanceTrend,
  SummaryType,
} from '@/lib/types/longitudinal'
import {
  calculateTotalPeriods,
  calculateCurrentPeriod,
  calculateTrend,
  calculatePeriodStatuses,
} from '@/lib/utils/progress'

interface LongitudinalState {
  // Mode
  mode: 'single' | 'longitudinal'

  // Current context
  currentStudent: Student | null
  currentEnrollment: StudentEnrollment | null
  currentRotation: Rotation | null
  currentClerkship: Clerkship | null

  // Lists
  students: Student[]
  clerkships: Clerkship[]
  rotations: Rotation[]

  // Current enrollment data
  evaluations: SavedEvaluation[]
  summaries: ProgressSummary[]

  // UI state
  isLoading: boolean
  error: string | null

  // Actions
  setMode: (mode: 'single' | 'longitudinal') => void
  setCurrentStudent: (student: Student | null) => void
  setCurrentEnrollment: (enrollment: StudentEnrollment | null) => void
  loadStudents: (search?: string) => Promise<void>
  loadClerkships: (type?: string) => Promise<void>
  loadRotations: (clerkshipId?: string, academicYear?: string) => Promise<void>
  loadStudentProgress: (enrollmentId: string) => Promise<void>
  saveEvaluation: (evaluation: Partial<SavedEvaluation>) => Promise<SavedEvaluation>
  submitEvaluation: (evaluationId: string) => Promise<void>
  generateSummary: (enrollmentId: string, type: SummaryType) => Promise<ProgressSummary>
  updateSummary: (summaryId: string, data: Partial<Pick<ProgressSummary, 'strengthsSummary' | 'growthAreasSummary' | 'progressNarrative' | 'editedNarrative' | 'recommendations'>>) => Promise<ProgressSummary>
  clearError: () => void

  // Computed
  getProgressView: () => StudentProgressView | null
  getPeriodStatuses: () => PeriodStatus[]
  getPerformanceTrend: () => PerformanceTrend
}

export const useLongitudinalStore = create<LongitudinalState>()(
  persist(
    (set, get) => ({
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

      setMode: (mode) => set({ mode }),

      setCurrentStudent: (student) => set({ currentStudent: student }),

      setCurrentEnrollment: (enrollment) => set({ currentEnrollment: enrollment }),

      clearError: () => set({ error: null }),

      loadStudents: async (search) => {
        set({ isLoading: true, error: null })
        try {
          const url = search
            ? `/api/students?search=${encodeURIComponent(search)}`
            : '/api/students'
          const response = await fetch(url)
          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to load students')
          }
          const students = await response.json()
          set({ students, isLoading: false })
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false })
        }
      },

      loadClerkships: async (type) => {
        set({ isLoading: true, error: null })
        try {
          const url = type
            ? `/api/clerkships?type=${encodeURIComponent(type)}`
            : '/api/clerkships'
          const response = await fetch(url)
          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to load clerkships')
          }
          const clerkships = await response.json()
          set({ clerkships, isLoading: false })
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false })
        }
      },

      loadRotations: async (clerkshipId, academicYear) => {
        set({ isLoading: true, error: null })
        try {
          const params = new URLSearchParams()
          if (clerkshipId) params.set('clerkshipId', clerkshipId)
          if (academicYear) params.set('academicYear', academicYear)
          const qs = params.toString()
          const url = qs ? `/api/rotations?${qs}` : '/api/rotations'
          const response = await fetch(url)
          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to load rotations')
          }
          const rotations = await response.json()
          set({ rotations, isLoading: false })
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false })
        }
      },

      loadStudentProgress: async (enrollmentId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/progress/${enrollmentId}`)
          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to load progress')
          }
          const data = await response.json()
          set({
            currentStudent: data.student,
            currentEnrollment: data.enrollment,
            currentRotation: data.rotation,
            currentClerkship: data.clerkship,
            evaluations: data.evaluations,
            summaries: data.summaries,
            isLoading: false,
          })
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false })
        }
      },

      saveEvaluation: async (evaluation) => {
        const isUpdate = !!evaluation.id
        const url = isUpdate
          ? `/api/evaluations/${evaluation.id}`
          : `/api/enrollments/${evaluation.enrollmentId}/evaluations`
        const response = await fetch(url, {
          method: isUpdate ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(evaluation),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to save evaluation')
        }
        const saved: SavedEvaluation = await response.json()
        set((state) => ({
          evaluations: isUpdate
            ? state.evaluations.map((e) => (e.id === saved.id ? saved : e))
            : [...state.evaluations, saved],
        }))
        return saved
      },

      submitEvaluation: async (evaluationId) => {
        const response = await fetch(`/api/evaluations/${evaluationId}/submit`, {
          method: 'POST',
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to submit evaluation')
        }
        const submitted: SavedEvaluation = await response.json()
        set((state) => ({
          evaluations: state.evaluations.map((e) =>
            e.id === evaluationId ? submitted : e
          ),
        }))
      },

      generateSummary: async (enrollmentId, type) => {
        const response = await fetch('/api/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollmentId, type }),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to generate summary')
        }
        const summary: ProgressSummary = await response.json()
        set((state) => ({ summaries: [...state.summaries, summary] }))
        return summary
      },

      updateSummary: async (summaryId, data) => {
        const response = await fetch(`/api/summaries/${summaryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update summary')
        }
        const updated: ProgressSummary = await response.json()
        set((state) => ({
          summaries: state.summaries.map((s) =>
            s.id === summaryId ? updated : s
          ),
        }))
        return updated
      },

      getProgressView: () => {
        const state = get()
        if (!state.currentStudent || !state.currentEnrollment || !state.currentClerkship) {
          return null
        }

        const totalPeriods = calculateTotalPeriods(state.currentClerkship)
        const currentPeriod = calculateCurrentPeriod(
          new Date(state.currentEnrollment.startDate),
          state.currentClerkship
        )

        const completedCount = state.evaluations.filter((e) => e.isComplete).length

        return {
          student: state.currentStudent,
          enrollment: state.currentEnrollment,
          rotation: state.currentRotation!,
          clerkship: state.currentClerkship,
          evaluations: state.evaluations,
          summaries: state.summaries,
          currentPeriod,
          totalPeriods,
          progressPercentage: totalPeriods > 0 ? (completedCount / totalPeriods) * 100 : 0,
          performanceTrend: get().getPerformanceTrend(),
        }
      },

      getPeriodStatuses: () => {
        const state = get()
        if (!state.currentEnrollment || !state.currentClerkship) return []
        return calculatePeriodStatuses(
          state.currentEnrollment,
          state.currentClerkship,
          state.evaluations
        )
      },

      getPerformanceTrend: () => {
        const state = get()
        return calculateTrend(state.evaluations)
      },
    }),
    {
      name: 'longitudinal-storage',
      partialize: (state) => ({
        mode: state.mode,
      }),
    }
  )
)
