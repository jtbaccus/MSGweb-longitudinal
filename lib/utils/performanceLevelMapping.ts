// lib/utils/performanceLevelMapping.ts
// Maps between UI-layer lowercase PerformanceLevel ('fail'|'pass'|'honors')
// and Prisma DB-layer uppercase PerformanceLevel ('FAIL'|'PASS'|'HONORS').

import type { PerformanceLevel } from '@/lib/types'
import { PerformanceLevel as PrismaPerformanceLevel } from '@/src/generated/prisma/enums'

const toDbMap: Record<PerformanceLevel, PrismaPerformanceLevel> = {
  fail: 'FAIL',
  pass: 'PASS',
  honors: 'HONORS',
}

const fromDbMap: Record<PrismaPerformanceLevel, PerformanceLevel> = {
  FAIL: 'fail',
  PASS: 'pass',
  HONORS: 'honors',
}

/** Convert UI lowercase PerformanceLevel → Prisma uppercase PerformanceLevel */
export function toDbPerformanceLevel(level: PerformanceLevel): PrismaPerformanceLevel {
  return toDbMap[level]
}

/** Convert Prisma uppercase PerformanceLevel → UI lowercase PerformanceLevel */
export function fromDbPerformanceLevel(level: PrismaPerformanceLevel): PerformanceLevel {
  return fromDbMap[level]
}
