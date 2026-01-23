/**
 * Audit Logging para acciones críticas
 *
 * Registra acciones importantes del sistema para auditoría y seguridad.
 * En producción, esto debería ir a un servicio de logging centralizado.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// =============================================================================
// TIPOS
// =============================================================================

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGIN_2FA_REQUIRED'
  | 'LOGOUT'
  | 'SESSION_EXPIRED'
  | 'PASSWORD_CHANGE'
  | '2FA_SETUP_INITIATED'
  | '2FA_SETUP_FAILED'
  | '2FA_ENABLED'
  | '2FA_ENABLE_FAILED'
  | '2FA_DISABLED'
  | '2FA_DISABLE_FAILED'
  | '2FA_VERIFY_SUCCESS'
  | '2FA_VERIFY_FAILED'
  | '2FA_BACKUP_CODES_REGENERATED'
  | '2FA_REGENERATE_CODES_FAILED'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'USER_ACTIVATE'
  | 'USER_DEACTIVATE'
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  | 'ORDER_CREATE'
  | 'ORDER_APPROVE'
  | 'ORDER_REJECT'
  | 'ORDER_COMPLETE'
  | 'INVENTORY_CAPTURE'
  | 'DATA_EXPORT'
  | 'SECURITY_VIOLATION'
  | 'RATE_LIMIT_EXCEEDED';

export type AuditSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  severity: AuditSeverity;
  userId: string | null;
  username: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  resource: string | null;
  resourceId: string | null;
  details: Record<string, unknown>;
  success: boolean;
  errorMessage: string | null;
}

interface AuditLogState {
  logs: AuditLogEntry[];
  maxLogs: number;
}

interface AuditLogActions {
  addLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  getLogs: (filters?: {
    action?: AuditAction;
    severity?: AuditSeverity;
    userId?: string;
    startDate?: string;
    endDate?: string;
    success?: boolean;
  }) => AuditLogEntry[];
  clearLogs: () => void;
  exportLogs: () => string;
}

type AuditLogStore = AuditLogState & AuditLogActions;

// =============================================================================
// STORE
// =============================================================================

export const useAuditLogStore = create<AuditLogStore>()(
  persist(
    (set, get) => ({
      logs: [],
      maxLogs: 1000, // Mantener últimos 1000 logs

      addLog: (entry) => {
        const newEntry: AuditLogEntry = {
          ...entry,
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toISOString(),
        };

        set((state) => {
          const logs = [newEntry, ...state.logs];
          // Mantener solo los últimos maxLogs
          return {
            logs: logs.slice(0, state.maxLogs),
          };
        });

        // En desarrollo, también loguear a consola
        if (process.env.NODE_ENV === 'development') {
          const icon = entry.severity === 'CRITICAL' ? '🚨' :
                       entry.severity === 'ERROR' ? '❌' :
                       entry.severity === 'WARNING' ? '⚠️' : 'ℹ️';
          console.log(
            `${icon} [AUDIT] ${entry.action} - ${entry.username || 'anonymous'} - ${entry.success ? 'SUCCESS' : 'FAILED'}`
          );
        }
      },

      getLogs: (filters) => {
        const { logs } = get();

        if (!filters) return logs;

        return logs.filter((log) => {
          if (filters.action && log.action !== filters.action) return false;
          if (filters.severity && log.severity !== filters.severity) return false;
          if (filters.userId && log.userId !== filters.userId) return false;
          if (filters.success !== undefined && log.success !== filters.success) return false;

          if (filters.startDate) {
            const logDate = new Date(log.timestamp);
            const startDate = new Date(filters.startDate);
            if (logDate < startDate) return false;
          }

          if (filters.endDate) {
            const logDate = new Date(log.timestamp);
            const endDate = new Date(filters.endDate);
            if (logDate > endDate) return false;
          }

          return true;
        });
      },

      clearLogs: () => {
        set({ logs: [] });
      },

      exportLogs: () => {
        const { logs } = get();
        return JSON.stringify(logs, null, 2);
      },
    }),
    {
      name: 'cardsystem-audit-log',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ logs: state.logs }),
    }
  )
);

// =============================================================================
// FUNCIONES DE AYUDA
// =============================================================================

/**
 * Obtiene la severidad por defecto para una acción
 */
export function getDefaultSeverity(action: AuditAction): AuditSeverity {
  const severityMap: Record<AuditAction, AuditSeverity> = {
    LOGIN_SUCCESS: 'INFO',
    LOGIN_FAILED: 'WARNING',
    LOGIN_2FA_REQUIRED: 'INFO',
    LOGOUT: 'INFO',
    SESSION_EXPIRED: 'INFO',
    PASSWORD_CHANGE: 'WARNING',
    '2FA_SETUP_INITIATED': 'INFO',
    '2FA_SETUP_FAILED': 'WARNING',
    '2FA_ENABLED': 'INFO',
    '2FA_ENABLE_FAILED': 'WARNING',
    '2FA_DISABLED': 'WARNING',
    '2FA_DISABLE_FAILED': 'WARNING',
    '2FA_VERIFY_SUCCESS': 'INFO',
    '2FA_VERIFY_FAILED': 'WARNING',
    '2FA_BACKUP_CODES_REGENERATED': 'INFO',
    '2FA_REGENERATE_CODES_FAILED': 'WARNING',
    USER_CREATE: 'INFO',
    USER_UPDATE: 'INFO',
    USER_DELETE: 'WARNING',
    USER_ACTIVATE: 'INFO',
    USER_DEACTIVATE: 'WARNING',
    PRODUCT_CREATE: 'INFO',
    PRODUCT_UPDATE: 'INFO',
    PRODUCT_DELETE: 'WARNING',
    ORDER_CREATE: 'INFO',
    ORDER_APPROVE: 'INFO',
    ORDER_REJECT: 'INFO',
    ORDER_COMPLETE: 'INFO',
    INVENTORY_CAPTURE: 'INFO',
    DATA_EXPORT: 'INFO',
    SECURITY_VIOLATION: 'CRITICAL',
    RATE_LIMIT_EXCEEDED: 'ERROR',
  };

  return severityMap[action] || 'INFO';
}

/**
 * Crea un log de auditoría simplificado
 */
export function createAuditLog(
  action: AuditAction,
  options: {
    userId?: string | null;
    username?: string | null;
    resource?: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    success?: boolean;
    errorMessage?: string;
    ipAddress?: string;
    userAgent?: string;
  } = {}
): Omit<AuditLogEntry, 'id' | 'timestamp'> {
  return {
    action,
    severity: getDefaultSeverity(action),
    userId: options.userId || null,
    username: options.username || null,
    ipAddress: options.ipAddress || null,
    userAgent: options.userAgent || null,
    resource: options.resource || null,
    resourceId: options.resourceId || null,
    details: options.details || {},
    success: options.success ?? true,
    errorMessage: options.errorMessage || null,
  };
}

// =============================================================================
// API PARA SERVER-SIDE
// =============================================================================

/**
 * Registra un evento de auditoría (para uso en API routes)
 * En producción, esto enviaría a un servicio de logging centralizado
 */
export async function logAuditEvent(
  event: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<void> {
  const entry: AuditLogEntry = {
    ...event,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  // En desarrollo, loguear a consola
  if (process.env.NODE_ENV === 'development') {
    const icon = entry.severity === 'CRITICAL' ? '🚨' :
                 entry.severity === 'ERROR' ? '❌' :
                 entry.severity === 'WARNING' ? '⚠️' : 'ℹ️';
    console.log(
      `${icon} [AUDIT] ${entry.action} - ${entry.username || 'anonymous'} - ${entry.success ? 'SUCCESS' : 'FAILED'}`,
      entry.details
    );
  }

  // En producción, aquí enviarías a un servicio como:
  // - AWS CloudWatch Logs
  // - Datadog
  // - Splunk
  // - ELK Stack
  // - Sumo Logic

  // Por ahora, solo logueamos en servidor
  // En una implementación real:
  // await fetch('https://logging-service.example.com/api/logs', {
  //   method: 'POST',
  //   body: JSON.stringify(entry),
  // });
}

/**
 * Extrae información del request para auditoría
 */
export function extractRequestInfo(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent') || 'unknown';

  let ipAddress = 'unknown';
  if (forwarded) {
    ipAddress = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ipAddress = realIp;
  }

  return { ipAddress, userAgent };
}
