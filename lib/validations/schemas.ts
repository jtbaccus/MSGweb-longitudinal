import { z } from 'zod';

// ============================================
// Student Schemas
// ============================================

export const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().nullable(),
  medicalSchoolId: z.string().optional().nullable(),
});

export const updateStudentSchema = createStudentSchema.partial();

// ============================================
// Clerkship Schemas
// ============================================

export const createClerkshipSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    templateId: z.string().min(1, 'Template ID is required'),
    type: z.enum(['STANDARD', 'MULTI_WEEK', 'LONGITUDINAL']),
    durationWeeks: z.number().int().positive(),
    midpointWeek: z.number().int().positive().optional().nullable(),
    evaluationIntervalDays: z.number().int().positive().optional().nullable(),
  })
  .refine(
    (data) => data.type !== 'LONGITUDINAL' || data.evaluationIntervalDays != null,
    { message: 'LONGITUDINAL clerkships require evaluationIntervalDays', path: ['evaluationIntervalDays'] }
  )
  .refine(
    (data) => data.midpointWeek == null || data.midpointWeek < data.durationWeeks,
    { message: 'midpointWeek must be less than durationWeeks', path: ['midpointWeek'] }
  );

export const updateClerkshipSchema = z
  .object({
    name: z.string().min(1).optional(),
    templateId: z.string().min(1).optional(),
    type: z.enum(['STANDARD', 'MULTI_WEEK', 'LONGITUDINAL']).optional(),
    durationWeeks: z.number().int().positive().optional(),
    midpointWeek: z.number().int().positive().optional().nullable(),
    evaluationIntervalDays: z.number().int().positive().optional().nullable(),
  });

// ============================================
// Rotation Schemas
// ============================================

export const createRotationSchema = z
  .object({
    clerkshipId: z.string().min(1, 'Clerkship ID is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    academicYear: z.string().min(1, 'Academic year is required'),
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    { message: 'End date must be after start date', path: ['endDate'] }
  );

export const updateRotationSchema = z.object({
  clerkshipId: z.string().min(1).optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
  academicYear: z.string().min(1).optional(),
});

// ============================================
// Enrollment Schemas
// ============================================

export const createEnrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  rotationId: z.string().min(1, 'Rotation ID is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'WITHDRAWN']).optional(),
});

export const updateEnrollmentSchema = z.object({
  startDate: z.string().min(1).optional(),
  endDate: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'WITHDRAWN']).optional(),
});

// ============================================
// Evaluation Schemas
// ============================================

export const createEvaluationSchema = z.object({
  evaluatorName: z.string().min(1, 'Evaluator name is required'),
  periodNumber: z.number().int().positive(),
  evaluationDate: z.string().min(1, 'Evaluation date is required'),
  performanceLevel: z.enum(['FAIL', 'PASS', 'HONORS']),
  selectedCriteriaIds: z.array(z.string()).default([]),
  selectedAttributeIds: z.array(z.string()).default([]),
  narrativeContext: z.string().optional().nullable(),
  generatedNarrative: z.string().optional().nullable(),
  editedNarrative: z.string().optional().nullable(),
  templateId: z.string().min(1, 'Template ID is required'),
  isDraft: z.boolean().optional(),
});

export const updateEvaluationSchema = z.object({
  evaluatorName: z.string().min(1).optional(),
  periodNumber: z.number().int().positive().optional(),
  evaluationDate: z.string().min(1).optional(),
  performanceLevel: z.enum(['FAIL', 'PASS', 'HONORS']).optional(),
  selectedCriteriaIds: z.array(z.string()).optional(),
  selectedAttributeIds: z.array(z.string()).optional(),
  narrativeContext: z.string().optional().nullable(),
  generatedNarrative: z.string().optional().nullable(),
  editedNarrative: z.string().optional().nullable(),
  templateId: z.string().min(1).optional(),
  isDraft: z.boolean().optional(),
});

// ============================================
// CSV Import Schema
// ============================================

export const csvImportSchema = z.object({
  csv: z.string().min(1, 'CSV data is required'),
});

// ============================================
// User Schemas
// ============================================

export const createUserSchema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().min(1, 'Name is required').optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'USER']).optional(),
  mustChangePassword: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  mustChangePassword: z.boolean().optional(),
});

// ============================================
// Generate Summary Schema
// ============================================

export const generateSummarySchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  type: z.enum(['MID_COURSE', 'END_OF_COURSE', 'PROGRESS']),
  authorName: z.string().optional(),
});

// ============================================
// Update Summary Schema
// ============================================

export const updateSummarySchema = z.object({
  strengthsSummary: z.string().optional().nullable(),
  growthAreasSummary: z.string().optional().nullable(),
  progressNarrative: z.string().optional().nullable(),
  editedNarrative: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
});
