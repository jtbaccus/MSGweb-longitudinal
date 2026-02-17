# MSGweb Upgrade Path: Longitudinal Progress Tracking

*Created: 2026-02-02*
*Status: All phases complete (2026-02-16)*

## Overview

Add longitudinal student progress tracking to MSGweb while **preserving the existing single-evaluation workflow**.

**Core Principle**: Current functionality remains available. Longitudinal mode is accessed via mode toggle.

---

## Use Cases

| Clerkship Type | Duration | Evaluation Cadence | Summary Points |
|----------------|----------|-------------------|----------------|
| **Standard** (current) | 1-2 weeks | Single evaluation | None (export only) |
| **Multi-Week** | 8 weeks | Weekly evaluations | Mid-course (week 4), End-of-course |
| **Longitudinal** | 6 months | **Configurable** (weekly/biweekly/monthly) | Mid-course, End-of-course |

---

## Implementation Phases

### Phase 1: Authentication (Prerequisite)

**Goal**: Add authentication to the entire app using NextAuth.js + Supabase.

#### New Dependencies
```json
"next-auth": "^5.0.0",
"@auth/prisma-adapter": "^2.0.0"
```

#### Database Tables
- `User` (id, email, name, createdAt)
- `Account`, `Session`, `VerificationToken` (NextAuth standard)

#### Files to Create
- `lib/auth.ts` - NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - Auth API routes
- `components/auth/LoginPage.tsx` - Login UI
- `middleware.ts` - Protect routes

#### Verification
- [ ] Can sign up / sign in
- [ ] Protected routes redirect to login
- [ ] User info available in session

---

### Phase 2: Database Schema

**Goal**: Add Supabase/PostgreSQL tables for longitudinal tracking.

#### New Dependencies
```json
"@prisma/client": "^6.0.0",
"prisma": "^6.0.0"
```

#### Database Schema

```
User (from Phase 1)
    └── owns evaluations and summaries

Clerkship
    ├── name, templateId, type (STANDARD|MULTI_WEEK|LONGITUDINAL)
    ├── durationWeeks, midpointWeek
    └── evaluationFrequency (for longitudinal: 'WEEKLY'|'BIWEEKLY'|'MONTHLY')
        └── Rotation (startDate, endDate, academicYear)
                └── StudentEnrollment (studentId, status)
                        ├── Evaluation (periodNumber, performanceLevel, criteria, narrative)
                        └── ProgressSummary (type, narrative, recommendations)

Student (name, email, medicalSchoolId)
```

#### Prisma Schema (Full)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// NextAuth Models
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  evaluations   Evaluation[]
  summaries     ProgressSummary[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// Clerkship Structure
// ============================================

enum ClerkshipType {
  STANDARD        // 1-2 weeks, single evaluation
  MULTI_WEEK      // 8 weeks, weekly evaluations
  LONGITUDINAL    // 6 months, periodic evaluations
}

enum EvaluationFrequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
}

model Clerkship {
  id                  String              @id @default(cuid())
  name                String              // "Internal Medicine", "Neurology", etc.
  templateId          String              // Links to existing templates.ts
  type                ClerkshipType       @default(STANDARD)
  durationWeeks       Int                 // 1, 2, 8, or 26 (6 months)
  midpointWeek        Int?                // Week number for mid-course feedback
  evaluationFrequency EvaluationFrequency? // For LONGITUDINAL type
  createdAt           DateTime            @default(now())
  rotations           Rotation[]
}

model Rotation {
  id           String              @id @default(cuid())
  clerkshipId  String
  clerkship    Clerkship           @relation(fields: [clerkshipId], references: [id])
  startDate    DateTime
  endDate      DateTime
  academicYear String              // "2025-2026"
  createdAt    DateTime            @default(now())
  enrollments  StudentEnrollment[]
}

// ============================================
// Student Models
// ============================================

model Student {
  id              String              @id @default(cuid())
  name            String
  email           String?             @unique
  medicalSchoolId String?             // External ID from school system
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  enrollments     StudentEnrollment[]
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  WITHDRAWN
}

model StudentEnrollment {
  id          String           @id @default(cuid())
  studentId   String
  student     Student          @relation(fields: [studentId], references: [id])
  rotationId  String
  rotation    Rotation         @relation(fields: [rotationId], references: [id])
  startDate   DateTime         // Student's actual start (may differ from rotation)
  endDate     DateTime?
  status      EnrollmentStatus @default(ACTIVE)
  createdAt   DateTime         @default(now())
  evaluations Evaluation[]
  summaries   ProgressSummary[]

  @@unique([studentId, rotationId])
}

// ============================================
// Evaluation Models
// ============================================

enum PerformanceLevel {
  FAIL
  PASS
  HONORS
}

model Evaluation {
  id                   String            @id @default(cuid())
  enrollmentId         String
  enrollment           StudentEnrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  evaluatorId          String?
  evaluator            User?             @relation(fields: [evaluatorId], references: [id])
  evaluatorName        String            // Display name (may differ from User.name)
  periodNumber         Int               // Week or month number depending on frequency
  evaluationDate       DateTime

  // Core evaluation data
  performanceLevel     PerformanceLevel
  selectedCriteriaIds  String[]          // Array of item IDs from template
  selectedAttributeIds String[]          // Array of attribute IDs
  narrativeContext     String?           @db.Text
  generatedNarrative   String?           @db.Text
  editedNarrative      String?           @db.Text

  // Metadata
  templateId           String            // Which template version was used
  isComplete           Boolean           @default(false)
  isDraft              Boolean           @default(true)
  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt
  submittedAt          DateTime?

  @@index([enrollmentId])
  @@index([periodNumber])
}

// ============================================
// Progress Summary Models
// ============================================

enum SummaryType {
  MID_COURSE    // Halfway point summary
  END_OF_COURSE // Final summary
  PROGRESS      // Ad-hoc progress note
}

model ProgressSummary {
  id                   String            @id @default(cuid())
  enrollmentId         String
  enrollment           StudentEnrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  authorId             String?
  author               User?             @relation(fields: [authorId], references: [id])
  authorName           String            // For display
  type                 SummaryType

  // Aggregated data
  evaluationsIncluded  String[]          // IDs of evaluations analyzed
  overallPerformance   PerformanceLevel

  // AI-generated content
  strengthsSummary     String?           @db.Text
  growthAreasSummary   String?           @db.Text
  progressNarrative    String?           @db.Text

  // Director edits
  editedNarrative      String?           @db.Text
  recommendations      String?           @db.Text

  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt

  @@index([enrollmentId])
  @@index([type])
}
```

#### Key Design: Configurable Frequency
- `evaluationFrequency` field on Clerkship
- `periodNumber` on Evaluation (week 1, 2, 3... OR month 1, 2, 3...)
- Duration + frequency determines expected number of evaluations

#### Files to Create
- `prisma/schema.prisma`
- `lib/prisma.ts` (client singleton)

#### Verification
- [ ] `npx prisma generate` succeeds
- [ ] `npx prisma db push` creates tables
- [ ] `npm run build` still passes

---

### Phase 3: TypeScript Types

#### New File: `lib/types/longitudinal.ts`

```typescript
// lib/types/longitudinal.ts

export type ClerkshipType = 'STANDARD' | 'MULTI_WEEK' | 'LONGITUDINAL'
export type EvaluationFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
export type SummaryType = 'MID_COURSE' | 'END_OF_COURSE' | 'PROGRESS'
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN'

export interface Clerkship {
  id: string
  name: string
  templateId: string
  type: ClerkshipType
  durationWeeks: number
  midpointWeek?: number
  evaluationFrequency?: EvaluationFrequency
}

export interface Student {
  id: string
  name: string
  email?: string
  medicalSchoolId?: string
}

export interface Rotation {
  id: string
  clerkshipId: string
  clerkship?: Clerkship
  startDate: Date
  endDate: Date
  academicYear: string
}

export interface StudentEnrollment {
  id: string
  studentId: string
  student?: Student
  rotationId: string
  rotation?: Rotation
  startDate: Date
  endDate?: Date
  status: EnrollmentStatus
  evaluations?: SavedEvaluation[]
  summaries?: ProgressSummary[]
}

export interface SavedEvaluation {
  id: string
  enrollmentId: string
  evaluatorId?: string
  evaluatorName: string
  periodNumber: number
  evaluationDate: Date
  performanceLevel: PerformanceLevel
  selectedCriteriaIds: string[]
  selectedAttributeIds: string[]
  narrativeContext?: string
  generatedNarrative?: string
  editedNarrative?: string
  templateId: string
  isComplete: boolean
  isDraft: boolean
  createdAt: Date
  updatedAt: Date
  submittedAt?: Date
}

export interface ProgressSummary {
  id: string
  enrollmentId: string
  authorId?: string
  authorName: string
  type: SummaryType
  evaluationsIncluded: string[]
  overallPerformance: PerformanceLevel
  strengthsSummary?: string
  growthAreasSummary?: string
  progressNarrative?: string
  editedNarrative?: string
  recommendations?: string
  createdAt: Date
  updatedAt: Date
}

// View-specific types
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
  performanceTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data'
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

// Import from existing types
import { PerformanceLevel, NavigationTab } from './index'

export type LongitudinalNavigationTab =
  | NavigationTab
  | 'dashboard'
  | 'students'
  | 'progress'
  | 'mid-course'
  | 'end-course'
```

---

### Phase 4: API Routes

| Route | Purpose |
|-------|---------|
| `/api/students` | GET (list), POST (create) |
| `/api/students/[id]` | GET, PUT, DELETE |
| `/api/students/import` | POST CSV file → bulk create |
| `/api/clerkships` | GET, POST |
| `/api/clerkships/[id]` | GET, PUT, DELETE |
| `/api/rotations` | GET, POST |
| `/api/rotations/[id]` | GET, PUT, DELETE |
| `/api/enrollments` | GET, POST |
| `/api/enrollments/[id]` | GET, PUT, DELETE |
| `/api/enrollments/[id]/evaluations` | GET, POST |
| `/api/evaluations/[id]` | GET, PUT, DELETE |
| `/api/evaluations/[id]/submit` | POST (mark complete) |
| `/api/progress/[enrollmentId]` | GET full progress view |
| `/api/generate-summary` | POST AI-generate summary |

#### Example: Students API

```typescript
// app/api/students/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  const students = await prisma.student.findMany({
    where: search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { medicalSchoolId: { contains: search } },
      ]
    } : undefined,
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(students)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const student = await prisma.student.create({
    data: {
      name: body.name,
      email: body.email || null,
      medicalSchoolId: body.medicalSchoolId || null,
    },
  })

  return NextResponse.json(student, { status: 201 })
}
```

#### Example: CSV Import

```typescript
// app/api/students/import/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { parseCSV } from '@/lib/utils/csv'

export async function POST(request: NextRequest) {
  const { csv } = await request.json()

  const { rows, errors: parseErrors } = parseCSV(csv, ['name'])

  const results = {
    imported: 0,
    skipped: 0,
    errors: [...parseErrors],
  }

  for (const row of rows) {
    try {
      // Skip if email exists
      if (row.email) {
        const existing = await prisma.student.findUnique({
          where: { email: row.email }
        })
        if (existing) {
          results.skipped++
          continue
        }
      }

      await prisma.student.create({
        data: {
          name: row.name,
          email: row.email || null,
          medicalSchoolId: row.medicalSchoolId || null,
        },
      })
      results.imported++
    } catch (error) {
      results.errors.push(`Failed to import ${row.name}: ${error}`)
    }
  }

  return NextResponse.json(results)
}
```

#### Example: Progress View

```typescript
// app/api/progress/[enrollmentId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateTrend, calculatePeriodStatus } from '@/lib/utils/progress'

export async function GET(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  const enrollment = await prisma.studentEnrollment.findUnique({
    where: { id: params.enrollmentId },
    include: {
      student: true,
      rotation: {
        include: { clerkship: true }
      },
      evaluations: {
        where: { isComplete: true },
        orderBy: { periodNumber: 'asc' },
      },
      summaries: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!enrollment) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  }

  const clerkship = enrollment.rotation.clerkship
  const totalPeriods = calculateTotalPeriods(clerkship)
  const currentPeriod = calculateCurrentPeriod(enrollment.startDate, clerkship)

  const progressView = {
    student: enrollment.student,
    enrollment,
    rotation: enrollment.rotation,
    clerkship,
    evaluations: enrollment.evaluations,
    summaries: enrollment.summaries,
    currentPeriod,
    totalPeriods,
    progressPercentage: (enrollment.evaluations.length / totalPeriods) * 100,
    performanceTrend: calculateTrend(enrollment.evaluations),
    periodStatuses: calculatePeriodStatus(enrollment, clerkship),
  }

  return NextResponse.json(progressView)
}
```

---

### Phase 5: State Management

#### New Store: `lib/stores/longitudinalStore.ts`

```typescript
// lib/stores/longitudinalStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Student,
  Clerkship,
  Rotation,
  StudentEnrollment,
  SavedEvaluation,
  ProgressSummary,
  StudentProgressView,
  PeriodStatus,
} from '@/lib/types/longitudinal'

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
  loadStudents: () => Promise<void>
  loadClerkships: () => Promise<void>
  loadStudentProgress: (enrollmentId: string) => Promise<void>
  saveEvaluation: (evaluation: Partial<SavedEvaluation>) => Promise<SavedEvaluation>
  submitEvaluation: (evaluationId: string) => Promise<void>
  generateSummary: (enrollmentId: string, type: 'MID_COURSE' | 'END_OF_COURSE') => Promise<ProgressSummary>

  // Computed
  getProgressView: () => StudentProgressView | null
  getPeriodStatuses: () => PeriodStatus[]
  getPerformanceTrend: () => 'improving' | 'stable' | 'declining' | 'insufficient_data'
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

      loadStudents: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/students')
          const students = await response.json()
          set({ students, isLoading: false })
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false })
        }
      },

      loadClerkships: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/clerkships')
          const clerkships = await response.json()
          set({ clerkships, isLoading: false })
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false })
        }
      },

      loadStudentProgress: async (enrollmentId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/progress/${enrollmentId}`)
          if (!response.ok) throw new Error('Failed to load progress')
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
        const response = await fetch(
          evaluation.id
            ? `/api/evaluations/${evaluation.id}`
            : `/api/enrollments/${evaluation.enrollmentId}/evaluations`,
          {
            method: evaluation.id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evaluation),
          }
        )
        const saved = await response.json()
        set((state) => ({
          evaluations: evaluation.id
            ? state.evaluations.map(e => e.id === saved.id ? saved : e)
            : [...state.evaluations, saved]
        }))
        return saved
      },

      submitEvaluation: async (evaluationId) => {
        await fetch(`/api/evaluations/${evaluationId}/submit`, { method: 'POST' })
        set((state) => ({
          evaluations: state.evaluations.map(e =>
            e.id === evaluationId
              ? { ...e, isDraft: false, isComplete: true, submittedAt: new Date() }
              : e
          )
        }))
      },

      generateSummary: async (enrollmentId, type) => {
        const response = await fetch('/api/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollmentId, type }),
        })
        const summary = await response.json()
        set((state) => ({ summaries: [...state.summaries, summary] }))
        return summary
      },

      getProgressView: () => {
        const state = get()
        if (!state.currentStudent || !state.currentEnrollment) return null

        const completedEvaluations = state.evaluations.filter(e => e.isComplete)
        const totalPeriods = calculateTotalPeriods(state.currentClerkship)
        const currentPeriod = calculateCurrentPeriod(
          new Date(state.currentEnrollment.startDate),
          state.currentClerkship
        )

        return {
          student: state.currentStudent,
          enrollment: state.currentEnrollment,
          rotation: state.currentRotation!,
          clerkship: state.currentClerkship!,
          evaluations: state.evaluations,
          summaries: state.summaries,
          currentPeriod: Math.min(currentPeriod, totalPeriods),
          totalPeriods,
          progressPercentage: (completedEvaluations.length / totalPeriods) * 100,
          performanceTrend: get().getPerformanceTrend(),
        }
      },

      getPeriodStatuses: () => {
        const state = get()
        if (!state.currentEnrollment || !state.currentClerkship) return []

        const totalPeriods = calculateTotalPeriods(state.currentClerkship)
        const startDate = new Date(state.currentEnrollment.startDate)
        const periodDays = getPeriodDays(state.currentClerkship)

        return Array.from({ length: totalPeriods }, (_, i) => {
          const periodNumber = i + 1
          const periodStart = new Date(startDate)
          periodStart.setDate(startDate.getDate() + (i * periodDays))
          const periodEnd = new Date(periodStart)
          periodEnd.setDate(periodStart.getDate() + periodDays - 1)

          const evaluation = state.evaluations.find(e => e.periodNumber === periodNumber)

          return {
            periodNumber,
            periodStart,
            periodEnd,
            hasEvaluation: !!evaluation?.isComplete,
            evaluation,
            isCurrent: Date.now() >= periodStart.getTime() && Date.now() <= periodEnd.getTime(),
            isFuture: Date.now() < periodStart.getTime(),
          }
        })
      },

      getPerformanceTrend: () => {
        const state = get()
        const completed = state.evaluations
          .filter(e => e.isComplete)
          .sort((a, b) => a.periodNumber - b.periodNumber)

        if (completed.length < 2) return 'insufficient_data'

        const levels = { FAIL: 0, PASS: 1, HONORS: 2 }
        const scores = completed.map(e => levels[e.performanceLevel])

        const firstHalf = scores.slice(0, Math.floor(scores.length / 2))
        const secondHalf = scores.slice(Math.floor(scores.length / 2))

        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

        if (avgSecond > avgFirst + 0.3) return 'improving'
        if (avgSecond < avgFirst - 0.3) return 'declining'
        return 'stable'
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

// Helper functions
function calculateTotalPeriods(clerkship: Clerkship | null): number {
  if (!clerkship) return 1
  if (clerkship.type === 'STANDARD') return 1

  const weeksPerPeriod = {
    WEEKLY: 1,
    BIWEEKLY: 2,
    MONTHLY: 4,
  }

  const frequency = clerkship.evaluationFrequency || 'WEEKLY'
  return Math.ceil(clerkship.durationWeeks / weeksPerPeriod[frequency])
}

function calculateCurrentPeriod(startDate: Date, clerkship: Clerkship | null): number {
  if (!clerkship) return 1
  const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  const periodDays = getPeriodDays(clerkship)
  return Math.floor(daysSinceStart / periodDays) + 1
}

function getPeriodDays(clerkship: Clerkship): number {
  const frequency = clerkship.evaluationFrequency || 'WEEKLY'
  return { WEEKLY: 7, BIWEEKLY: 14, MONTHLY: 28 }[frequency]
}
```

#### Modified: `lib/stores/evaluationStore.ts`

Add optional fields for longitudinal context (at the end of the state interface):

```typescript
// Add to existing state interface
enrollmentId?: string
periodNumber?: number

// Add to existing actions
setLongitudinalContext: (enrollmentId: string, periodNumber: number) => void
clearLongitudinalContext: () => void
saveToDatabase: () => Promise<void>
loadFromDatabase: (evaluationId: string) => Promise<void>
```

---

### Phase 6: UI Components

#### Navigation (Sidebar.tsx)

**Single Mode** (unchanged workflow):
```
Templates → Evaluation → Attributes → Narrative → Summary → Generate → Export → Settings
```

**Longitudinal Mode** (new tabs):
```
Dashboard → Students → [Select Student] → Progress → [Create Evaluation] → Mid-Course → End-Course → Settings
```

#### New Components

| Component | Purpose |
|-----------|---------|
| `components/longitudinal/DashboardView.tsx` | Overview of all active rotations |
| `components/longitudinal/StudentListView.tsx` | Browse/search students, CSV import button |
| `components/longitudinal/StudentProgressView.tsx` | Timeline + performance chart for one student |
| `components/longitudinal/PeriodTimelineView.tsx` | Visual period-by-period status |
| `components/longitudinal/PerformanceChart.tsx` | Line chart of performance over time |
| `components/longitudinal/ClerkshipSetupView.tsx` | Create/edit clerkships with frequency |
| `components/longitudinal/MidCourseSummaryView.tsx` | Generate/edit mid-course feedback |
| `components/longitudinal/EndCourseSummaryView.tsx` | Generate/edit end-of-course feedback |
| `components/longitudinal/CSVImportModal.tsx` | Upload and preview CSV student roster |
| `components/auth/LoginPage.tsx` | Sign in / sign up UI |

#### Modified Components

| Component | Changes |
|-----------|---------|
| `Sidebar.tsx` | Mode-conditional navigation, user info display |
| `MainContent.tsx` | Routing for new views |
| `SettingsView.tsx` | Mode toggle |

#### Example: PerformanceChart.tsx

```typescript
// components/longitudinal/PerformanceChart.tsx

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { SavedEvaluation } from '@/lib/types/longitudinal'

interface Props {
  evaluations: SavedEvaluation[]
  midpointPeriod?: number
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
}

export function PerformanceChart({ evaluations, midpointPeriod, frequency }: Props) {
  const periodLabel = frequency === 'MONTHLY' ? 'Month' : 'Week'

  const data = evaluations
    .filter(e => e.isComplete)
    .sort((a, b) => a.periodNumber - b.periodNumber)
    .map(e => ({
      period: `${periodLabel} ${e.periodNumber}`,
      periodNumber: e.periodNumber,
      performance: e.performanceLevel === 'HONORS' ? 3 : e.performanceLevel === 'PASS' ? 2 : 1,
      label: e.performanceLevel,
    }))

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <XAxis dataKey="period" fontSize={12} />
          <YAxis
            domain={[0, 4]}
            ticks={[1, 2, 3]}
            tickFormatter={(v) => ['', 'Fail', 'Pass', 'Honors'][v]}
            fontSize={12}
          />
          <Tooltip
            formatter={(value, name) => [['', 'Fail', 'Pass', 'Honors'][value as number], 'Performance']}
          />
          <Line
            type="monotone"
            dataKey="performance"
            stroke="var(--medical-primary)"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          {midpointPeriod && (
            <ReferenceLine
              x={`${periodLabel} ${midpointPeriod}`}
              stroke="gray"
              strokeDasharray="3 3"
              label={{ value: 'Mid-course', position: 'top', fontSize: 10 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

### Phase 7: AI Summary Generation

#### API: `/api/generate-summary`

```typescript
// app/api/generate-summary/route.ts

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import prisma from '@/lib/prisma'
import { defaultTemplates } from '@/lib/data/templates'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  const { enrollmentId, type } = await request.json()

  // Fetch enrollment with evaluations
  const enrollment = await prisma.studentEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      student: true,
      rotation: { include: { clerkship: true } },
      evaluations: {
        where: { isComplete: true },
        orderBy: { periodNumber: 'asc' },
      },
    },
  })

  if (!enrollment) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  }

  // Get template to resolve criteria IDs to names
  const template = defaultTemplates.find(t => t.id === enrollment.rotation.clerkship.templateId)

  // Build evaluation summary
  const evaluationSummaries = enrollment.evaluations.map(e => {
    const strengths = e.selectedCriteriaIds
      .map(id => template?.items.find(item => item.id === id)?.name)
      .filter(Boolean)

    return {
      period: e.periodNumber,
      performance: e.performanceLevel,
      strengths: strengths.slice(0, 5), // Top 5 for brevity
      narrative: e.editedNarrative || e.generatedNarrative || '',
    }
  })

  const systemPrompt = `You are a medical education director writing a ${type === 'MID_COURSE' ? 'mid-course' : 'end-of-course'} progress summary for a medical student.

**Task**: Synthesize the evaluations into a cohesive summary.

**Format**:
1. **Overall Performance** (1 sentence): Current standing
2. **Strengths** (2-3 bullets): Consistent patterns across evaluations
3. **Growth Areas** (1-2 bullets): Areas needing improvement or showing growth
4. **Progress Narrative** (2 paragraphs): The student's journey
${type === 'END_OF_COURSE' ? '5. **Recommendations** (2-3 bullets): Forward-looking guidance' : ''}

**Guidelines**:
- Reference specific periods only when showing progression
- Balance positive observations with constructive feedback
- Use professional, supportive language
- 300-400 words total`

  const userPrompt = JSON.stringify({
    studentName: enrollment.student.name,
    clerkship: enrollment.rotation.clerkship.name,
    summaryType: type,
    totalPeriods: enrollment.evaluations.length,
    evaluations: evaluationSummaries,
  }, null, 2)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 800,
  })

  const narrativeText = response.choices[0]?.message?.content || ''

  // Calculate overall performance (mode of evaluations)
  const performanceCounts = { FAIL: 0, PASS: 0, HONORS: 0 }
  enrollment.evaluations.forEach(e => performanceCounts[e.performanceLevel]++)
  const overallPerformance = Object.entries(performanceCounts)
    .sort((a, b) => b[1] - a[1])[0][0] as 'FAIL' | 'PASS' | 'HONORS'

  // Save summary
  const summary = await prisma.progressSummary.create({
    data: {
      enrollmentId,
      type,
      authorName: 'AI Generated',
      evaluationsIncluded: enrollment.evaluations.map(e => e.id),
      overallPerformance,
      progressNarrative: narrativeText,
    },
  })

  return NextResponse.json(summary)
}
```

---

### Phase 8: Verification Checklist

#### Authentication
- [ ] Sign up creates user
- [ ] Sign in works
- [ ] Protected routes redirect to login
- [ ] Session persists across refresh

#### Database
- [ ] All tables created
- [ ] Prisma Studio accessible
- [ ] Foreign key relationships work

#### Student Management
- [ ] Create student manually
- [ ] CSV import parses correctly
- [ ] CSV import creates students
- [ ] Search/filter students

#### Clerkship Setup
- [ ] Create clerkship with type and frequency
- [ ] Create rotation for clerkship
- [ ] Enroll student in rotation

#### Evaluation Flow
- [ ] Create evaluation for period
- [ ] Save as draft
- [ ] Submit (mark complete)
- [ ] View in progress timeline

#### Progress Visualization
- [ ] Timeline shows all periods
- [ ] Completed periods marked
- [ ] Performance chart renders
- [ ] Trend calculation works

#### Summaries
- [ ] Mid-course summary generates at midpoint
- [ ] End-of-course summary generates
- [ ] Can edit generated text
- [ ] Can save edits

#### Existing Functionality
- [ ] All 156 existing tests pass
- [ ] Single mode workflow unchanged
- [ ] PDF export still works

---

## File Summary

### New Files (~45)
- Auth: `lib/auth.ts`, `middleware.ts`, `app/api/auth/[...nextauth]/route.ts`, `components/auth/LoginPage.tsx`
- Database: `prisma/schema.prisma`, `lib/prisma.ts`
- Types: `lib/types/longitudinal.ts`
- Store: `lib/stores/longitudinalStore.ts`
- APIs: ~12 route files in `app/api/`
- Components: ~10 in `components/longitudinal/`
- Utils: `lib/utils/progress.ts`, `lib/utils/csv.ts`

### Modified Files (~6)
- `package.json` (new deps)
- `lib/types/index.ts` (exports)
- `lib/stores/evaluationStore.ts` (optional DB sync)
- `components/layout/Sidebar.tsx` (mode-conditional + user)
- `components/layout/MainContent.tsx` (new routes)
- `components/settings/SettingsView.tsx` (mode toggle)

---

## Implementation Order

1. **Phase 1**: Authentication (enables user ownership of data)
2. **Phase 2**: Database schema (foundation for persistence)
3. **Phase 3**: Types (type safety for new features)
4. **Phase 4**: API routes (backend ready)
5. **Phase 5**: State management (frontend ready)
6. **Phase 6**: UI components (user-facing features)
7. **Phase 7**: AI summaries (capstone feature)
8. **Phase 8**: Testing and verification
9. **Phase 9**: Single ↔ Longitudinal integration (bridge between workflows)

Each phase builds on the previous. Can pause after any phase with a working (partial) system.

---

### Phase 9: Single ↔ Longitudinal Integration

**Goal**: Bridge the siloed single evaluation and longitudinal tracking workflows so evaluations flow naturally into longitudinal records and the longitudinal system is usable without raw API calls.

**Status**: Complete (2026-02-09)

#### Bug Fix
- `app/api/students/route.ts` — GET handler now includes enrollments with rotation and clerkship data

#### New Files (6)
| File | Purpose |
|------|---------|
| `components/longitudinal/AddStudentModal.tsx` | Manual student creation form |
| `components/longitudinal/SetupClerkshipModal.tsx` | Clerkship setup with template selection |
| `components/longitudinal/SetupRotationModal.tsx` | Rotation setup with clerkship selection |
| `components/longitudinal/EnrollStudentModal.tsx` | Student enrollment with search/select |
| `components/longitudinal/SaveToRecordModal.tsx` | 3-step wizard to save single eval to longitudinal record |
| `components/longitudinal/EvaluationDetailModal.tsx` | Read-only evaluation detail view with edit support for drafts |

#### Modified Files (9)
| File | Changes |
|------|---------|
| `app/api/students/route.ts` | Include enrollments in GET response |
| `components/longitudinal/StudentListView.tsx` | Add Student button, Enroll button, EnrollStudentModal integration |
| `components/longitudinal/DashboardView.tsx` | Quick Setup section, setup modal integration |
| `lib/stores/longitudinalStore.ts` | `createStudent/Clerkship/Rotation/Enrollment` actions, `isInEvaluationFlow` state |
| `lib/stores/evaluationStore.ts` | `saveToDatabase` accepts options, returns evaluation ID, `lastSavedEvaluationId` |
| `components/export/ExportReportView.tsx` | "Save to Student Record" button + SaveToRecordModal |
| `components/layout/Sidebar.tsx` | Hybrid nav for eval flow, "Back to Progress" button |
| `components/generate/AIGenerationView.tsx` | "Save & Return to Progress" button in longitudinal flow |
| `components/longitudinal/StudentProgressView.tsx` | "New Evaluation" button, View button wired, EvaluationDetailModal |
