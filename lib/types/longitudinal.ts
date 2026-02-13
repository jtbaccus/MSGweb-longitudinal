// lib/types/longitudinal.ts
// TypeScript interfaces for Phase 2 longitudinal tracking models.
// Enum type aliases are string unions decoupled from Prisma imports
// so they work in client components.

import type { PerformanceLevel, NavigationTab } from './index'

// ============================================
// Enum Type Aliases (mirror Prisma enums)
// ============================================

export type ClerkshipType = 'STANDARD' | 'MULTI_WEEK' | 'LONGITUDINAL'
export type SummaryType = 'MID_COURSE' | 'END_OF_COURSE' | 'PROGRESS'
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN'

// ============================================
// Model Interfaces
// ============================================

export interface Clerkship {
  id: string
  name: string
  templateId: string
  type: ClerkshipType
  durationWeeks: number
  midpointWeek?: number | null
  evaluationIntervalDays?: number | null
  createdAt: Date
  rotations?: Rotation[]
}

export interface Student {
  id: string
  name: string
  email?: string | null
  medicalSchoolId?: string | null
  createdAt: Date
  updatedAt: Date
  enrollments?: StudentEnrollment[]
}

export interface Rotation {
  id: string
  clerkshipId: string
  clerkship?: Clerkship
  startDate: Date
  endDate: Date
  academicYear: string
  createdAt: Date
  enrollments?: StudentEnrollment[]
}

export interface StudentEnrollment {
  id: string
  studentId: string
  student?: Student
  rotationId: string
  rotation?: Rotation
  startDate: Date
  endDate?: Date | null
  status: EnrollmentStatus
  createdAt: Date
  evaluations?: SavedEvaluation[]
  summaries?: ProgressSummary[]
}

export interface SavedEvaluation {
  id: string
  enrollmentId: string
  evaluatorId?: string | null
  evaluatorName: string
  periodNumber: number
  evaluationDate: Date
  performanceLevel: PerformanceLevel
  selectedCriteriaIds: string[]
  selectedAttributeIds: string[]
  narrativeContext?: string | null
  generatedNarrative?: string | null
  editedNarrative?: string | null
  templateId: string
  isComplete: boolean
  isDraft: boolean
  createdAt: Date
  updatedAt: Date
  submittedAt?: Date | null
}

export interface ProgressSummary {
  id: string
  enrollmentId: string
  authorId?: string | null
  authorName: string
  type: SummaryType
  evaluationsIncluded: string[]
  overallPerformance: PerformanceLevel
  strengthsSummary?: string | null
  growthAreasSummary?: string | null
  progressNarrative?: string | null
  editedNarrative?: string | null
  recommendations?: string | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// View Types
// ============================================

export type PerformanceTrend = 'improving' | 'stable' | 'declining' | 'insufficient_data'

export interface StudentProgressView {
  student: Student
  enrollment: StudentEnrollment
  rotation: Rotation
  clerkship: Clerkship
  evaluations: SavedEvaluation[]
  summaries: ProgressSummary[]
  currentPeriod: number
  totalPeriods: number
  progressPercentage: number
  performanceTrend: PerformanceTrend
}

export interface PeriodStatus {
  periodNumber: number
  periodStart: Date
  periodEnd: Date
  hasEvaluation: boolean
  evaluation?: SavedEvaluation
  isCurrent: boolean
  isFuture: boolean
}

// ============================================
// Navigation Extension
// ============================================

export type LongitudinalNavigationTab =
  | NavigationTab
  | 'dashboard'
  | 'students'
  | 'progress'
  | 'mid-course'
  | 'end-course'
  | 'admin-clerkships'
  | 'admin-rotations'
  | 'admin-enrollments'
  | 'admin-users'
