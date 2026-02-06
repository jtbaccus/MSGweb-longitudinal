import type {
  Clerkship,
  SavedEvaluation,
  StudentEnrollment,
  PeriodStatus,
  PerformanceTrend,
  EvaluationFrequency,
} from '@/lib/types/longitudinal';

/** Map frequency enum to number of days per period. */
export function getPeriodDays(frequency: EvaluationFrequency): number {
  switch (frequency) {
    case 'WEEKLY':
      return 7;
    case 'BIWEEKLY':
      return 14;
    case 'MONTHLY':
      return 28;
  }
}

/** Calculate total evaluation periods for a clerkship. */
export function calculateTotalPeriods(clerkship: Clerkship): number {
  if (!clerkship.evaluationFrequency) return 1;
  const totalDays = clerkship.durationWeeks * 7;
  const periodDays = getPeriodDays(clerkship.evaluationFrequency);
  return Math.ceil(totalDays / periodDays);
}

/** Calculate which period number the enrollment is currently in. */
export function calculateCurrentPeriod(
  startDate: Date,
  clerkship: Clerkship
): number {
  if (!clerkship.evaluationFrequency) return 1;
  const now = new Date();
  const elapsed = now.getTime() - new Date(startDate).getTime();
  const daysElapsed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
  const periodDays = getPeriodDays(clerkship.evaluationFrequency);
  const period = Math.floor(daysElapsed / periodDays) + 1;
  const total = calculateTotalPeriods(clerkship);
  return Math.min(Math.max(period, 1), total);
}

/** Determine the performance trend from a set of evaluations. */
export function calculateTrend(
  evaluations: SavedEvaluation[]
): PerformanceTrend {
  const completed = evaluations
    .filter((e) => e.isComplete)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  if (completed.length < 2) return 'insufficient_data';

  const levelToScore: Record<string, number> = {
    FAIL: 0,
    PASS: 1,
    HONORS: 2,
  };

  const scores = completed.map((e) => levelToScore[e.performanceLevel] ?? 1);

  // Compare first half average to second half average
  const mid = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(0, mid);
  const secondHalf = scores.slice(mid);

  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const firstAvg = avg(firstHalf);
  const secondAvg = avg(secondHalf);

  const diff = secondAvg - firstAvg;
  if (diff > 0.25) return 'improving';
  if (diff < -0.25) return 'declining';
  return 'stable';
}

/** Build period statuses for a given enrollment. */
export function calculatePeriodStatuses(
  enrollment: StudentEnrollment,
  clerkship: Clerkship,
  evaluations: SavedEvaluation[]
): PeriodStatus[] {
  const total = calculateTotalPeriods(clerkship);
  const current = calculateCurrentPeriod(enrollment.startDate, clerkship);
  const periodDays = clerkship.evaluationFrequency
    ? getPeriodDays(clerkship.evaluationFrequency)
    : clerkship.durationWeeks * 7;

  const start = new Date(enrollment.startDate);
  const statuses: PeriodStatus[] = [];

  for (let i = 1; i <= total; i++) {
    const periodStart = new Date(start.getTime() + (i - 1) * periodDays * 86400000);
    const periodEnd = new Date(start.getTime() + i * periodDays * 86400000);
    const evaluation = evaluations.find((e) => e.periodNumber === i && e.isComplete);

    statuses.push({
      periodNumber: i,
      periodStart,
      periodEnd,
      hasEvaluation: !!evaluation,
      evaluation,
      isCurrent: i === current,
      isFuture: i > current,
    });
  }

  return statuses;
}
