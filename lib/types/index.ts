export type PerformanceLevel = 'fail' | 'pass' | 'honors'

export interface EvaluationItem {
  id: string
  name: string
  description: string
  category: PerformanceLevel
  section: string
  isSelected: boolean
}

export interface PersonalAttribute {
  id: string
  name: string
  isSelected: boolean
}

export interface ClerkshipTemplate {
  id: string
  name: string
  description: string
  icon: string
  items: Omit<EvaluationItem, 'isSelected'>[]
}

export interface ComprehensiveReportData {
  studentName: string
  evaluatorName: string
  evaluationDate: string
  clerkshipName: string
  performanceLevel: PerformanceLevel
  strengths: EvaluationItem[]
  areasForImprovement: EvaluationItem[]
  attributes: PersonalAttribute[]
  narrativeText: string
  generatedNarrative: string
  includeStrengths: boolean
  includeAreasForImprovement: boolean
  includeAttributes: boolean
  includeNarrative: boolean
  includeGeneratedNarrative: boolean
}

export type NavigationTab =
  | 'templates'
  | 'evaluation'
  | 'attributes'
  | 'narrative'
  | 'summary'
  | 'generate'
  | 'export'
  | 'settings'

export interface NavigationItem {
  id: NavigationTab
  label: string
  icon: string
}

export type ThemeMode = 'light' | 'dark' | 'system'

export type WordCountPreset = 1 | 2 | 3 | 4

export interface WordCountRange {
  minWords: number
  maxWords: number
}

export interface WordCountPresetConfig {
  preset: WordCountPreset
  label: string
  description: string
  range: WordCountRange
}

// Longitudinal tracking types (Phase 3)
export type {
  ClerkshipType,
  EvaluationFrequency,
  SummaryType,
  EnrollmentStatus,
  Clerkship,
  Student,
  Rotation,
  StudentEnrollment,
  SavedEvaluation,
  ProgressSummary,
  PerformanceTrend,
  StudentProgressView,
  PeriodStatus,
  LongitudinalNavigationTab,
} from './longitudinal'
