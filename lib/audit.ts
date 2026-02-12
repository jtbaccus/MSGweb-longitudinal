import prisma from './prisma';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'IMPORT';

export function logAudit(
  userId: string,
  action: AuditAction,
  entity: string,
  entityId: string,
  details?: Record<string, unknown>
): void {
  // Fire-and-forget — don't block the request
  prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      details: details ? JSON.stringify(details) : null,
    },
  }).catch((err) => {
    console.error('Audit log failed:', err);
  });
}
