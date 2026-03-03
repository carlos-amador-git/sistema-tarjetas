/**
 * Tests para auditLog.ts
 *
 * Tests para el sistema de auditoría:
 * - Store de Zustand (addLog, getLogs, clearLogs, exportLogs)
 * - Filtrado de logs
 * - Funciones helper (getDefaultSeverity, createAuditLog, extractRequestInfo)
 * - logAuditEvent para server-side
 */

import { act, renderHook } from '@testing-library/react';
import {
  useAuditLogStore,
  getDefaultSeverity,
  createAuditLog,
  logAuditEvent,
  extractRequestInfo,
  AuditAction,
  AuditLogEntry,
} from '../auditLog';

// =============================================================================
// MOCKS
// =============================================================================

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// =============================================================================
// SETUP
// =============================================================================

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();

  // Reset store state
  useAuditLogStore.setState({ logs: [], maxLogs: 1000 });
});

// =============================================================================
// STORE TESTS
// =============================================================================

describe('useAuditLogStore', () => {
  describe('addLog', () => {
    it('debe agregar un log con id y timestamp', () => {
      const { result } = renderHook(() => useAuditLogStore());

      act(() => {
        result.current.addLog({
          action: 'LOGIN_SUCCESS',
          severity: 'INFO',
          userId: '1',
          username: 'testuser',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
          resource: null,
          resourceId: null,
          details: {},
          success: true,
          errorMessage: null,
        });
      });

      const logs = result.current.logs;
      expect(logs).toHaveLength(1);
      expect(logs[0].id).toMatch(/^audit-\d+-[a-z0-9]+$/);
      expect(logs[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(logs[0].action).toBe('LOGIN_SUCCESS');
    });

    it('debe agregar nuevos logs al principio', () => {
      const { result } = renderHook(() => useAuditLogStore());

      act(() => {
        result.current.addLog({
          action: 'LOGIN_SUCCESS',
          severity: 'INFO',
          userId: '1',
          username: 'first',
          ipAddress: null,
          userAgent: null,
          resource: null,
          resourceId: null,
          details: {},
          success: true,
          errorMessage: null,
        });
      });

      act(() => {
        result.current.addLog({
          action: 'LOGOUT',
          severity: 'INFO',
          userId: '1',
          username: 'second',
          ipAddress: null,
          userAgent: null,
          resource: null,
          resourceId: null,
          details: {},
          success: true,
          errorMessage: null,
        });
      });

      expect(result.current.logs[0].action).toBe('LOGOUT');
      expect(result.current.logs[1].action).toBe('LOGIN_SUCCESS');
    });

    it('debe respetar el límite de maxLogs', () => {
      const { result } = renderHook(() => useAuditLogStore());

      // Set maxLogs to 3 for testing
      act(() => {
        useAuditLogStore.setState({ maxLogs: 3 });
      });

      // Add 5 logs
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.addLog({
            action: 'LOGIN_SUCCESS',
            severity: 'INFO',
            userId: String(i),
            username: `user${i}`,
            ipAddress: null,
            userAgent: null,
            resource: null,
            resourceId: null,
            details: {},
            success: true,
            errorMessage: null,
          });
        });
      }

      // Should only keep 3 logs
      expect(result.current.logs).toHaveLength(3);
      // Most recent logs should be kept
      expect(result.current.logs[0].username).toBe('user4');
      expect(result.current.logs[2].username).toBe('user2');
    });
  });

  describe('getLogs', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useAuditLogStore());

      // Add test logs
      const testLogs = [
        { action: 'LOGIN_SUCCESS' as AuditAction, severity: 'INFO' as const, userId: '1', success: true },
        { action: 'LOGIN_FAILED' as AuditAction, severity: 'WARNING' as const, userId: '2', success: false },
        { action: 'USER_CREATE' as AuditAction, severity: 'INFO' as const, userId: '1', success: true },
        { action: 'SECURITY_VIOLATION' as AuditAction, severity: 'CRITICAL' as const, userId: '3', success: false },
      ];

      testLogs.forEach((log) => {
        act(() => {
          result.current.addLog({
            ...log,
            username: `user${log.userId}`,
            ipAddress: null,
            userAgent: null,
            resource: null,
            resourceId: null,
            details: {},
            errorMessage: null,
          });
        });
      });
    });

    it('debe retornar todos los logs sin filtros', () => {
      const { result } = renderHook(() => useAuditLogStore());

      const logs = result.current.getLogs();
      expect(logs).toHaveLength(4);
    });

    it('debe filtrar por action', () => {
      const { result } = renderHook(() => useAuditLogStore());

      const logs = result.current.getLogs({ action: 'LOGIN_SUCCESS' });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('LOGIN_SUCCESS');
    });

    it('debe filtrar por severity', () => {
      const { result } = renderHook(() => useAuditLogStore());

      const logs = result.current.getLogs({ severity: 'CRITICAL' });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('SECURITY_VIOLATION');
    });

    it('debe filtrar por userId', () => {
      const { result } = renderHook(() => useAuditLogStore());

      const logs = result.current.getLogs({ userId: '1' });
      expect(logs).toHaveLength(2);
    });

    it('debe filtrar por success', () => {
      const { result } = renderHook(() => useAuditLogStore());

      const logs = result.current.getLogs({ success: false });
      expect(logs).toHaveLength(2);
    });

    it('debe filtrar por múltiples criterios', () => {
      const { result } = renderHook(() => useAuditLogStore());

      const logs = result.current.getLogs({ userId: '1', success: true });
      expect(logs).toHaveLength(2);
    });

    it('debe filtrar por rango de fechas', () => {
      const { result } = renderHook(() => useAuditLogStore());

      // Clear and add logs with specific timestamps
      act(() => {
        useAuditLogStore.setState({ logs: [] });
      });

      // Manually set logs with controlled timestamps
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      act(() => {
        useAuditLogStore.setState({
          logs: [
            {
              id: 'test-1',
              timestamp: now.toISOString(),
              action: 'LOGIN_SUCCESS',
              severity: 'INFO',
              userId: '1',
              username: 'test',
              ipAddress: null,
              userAgent: null,
              resource: null,
              resourceId: null,
              details: {},
              success: true,
              errorMessage: null,
            },
          ],
        });
      });

      const logsInRange = result.current.getLogs({
        startDate: yesterday.toISOString(),
        endDate: tomorrow.toISOString(),
      });
      expect(logsInRange).toHaveLength(1);

      const logsOutOfRange = result.current.getLogs({
        startDate: tomorrow.toISOString(),
      });
      expect(logsOutOfRange).toHaveLength(0);
    });
  });

  describe('clearLogs', () => {
    it('debe eliminar todos los logs', () => {
      const { result } = renderHook(() => useAuditLogStore());

      act(() => {
        result.current.addLog({
          action: 'LOGIN_SUCCESS',
          severity: 'INFO',
          userId: '1',
          username: 'test',
          ipAddress: null,
          userAgent: null,
          resource: null,
          resourceId: null,
          details: {},
          success: true,
          errorMessage: null,
        });
      });

      expect(result.current.logs).toHaveLength(1);

      act(() => {
        result.current.clearLogs();
      });

      expect(result.current.logs).toHaveLength(0);
    });
  });

  describe('exportLogs', () => {
    it('debe exportar logs como JSON formateado', () => {
      const { result } = renderHook(() => useAuditLogStore());

      act(() => {
        result.current.addLog({
          action: 'LOGIN_SUCCESS',
          severity: 'INFO',
          userId: '1',
          username: 'test',
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
          resource: null,
          resourceId: null,
          details: { key: 'value' },
          success: true,
          errorMessage: null,
        });
      });

      const exported = result.current.exportLogs();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].action).toBe('LOGIN_SUCCESS');
      expect(parsed[0].details).toEqual({ key: 'value' });
    });

    it('debe exportar array vacío si no hay logs', () => {
      const { result } = renderHook(() => useAuditLogStore());

      const exported = result.current.exportLogs();
      expect(exported).toBe('[]');
    });
  });
});

// =============================================================================
// HELPER FUNCTIONS TESTS
// =============================================================================

describe('getDefaultSeverity', () => {
  it.each([
    ['LOGIN_SUCCESS', 'INFO'],
    ['LOGIN_FAILED', 'WARNING'],
    ['LOGOUT', 'INFO'],
    ['PASSWORD_CHANGE', 'WARNING'],
    ['USER_CREATE', 'INFO'],
    ['USER_DELETE', 'WARNING'],
    ['SECURITY_VIOLATION', 'CRITICAL'],
    ['RATE_LIMIT_EXCEEDED', 'ERROR'],
    ['2FA_ENABLED', 'INFO'],
    ['2FA_DISABLED', 'WARNING'],
    ['ORDER_CREATE', 'INFO'],
    ['DATA_EXPORT', 'INFO'],
  ] as const)('debe retornar %s para acción %s', (action, expectedSeverity) => {
    expect(getDefaultSeverity(action)).toBe(expectedSeverity);
  });

  it('debe cubrir todas las acciones de autenticación', () => {
    const authActions: AuditAction[] = [
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGIN_2FA_REQUIRED',
      'LOGOUT',
      'SESSION_EXPIRED',
      'PASSWORD_CHANGE',
    ];

    authActions.forEach((action) => {
      const severity = getDefaultSeverity(action);
      expect(['INFO', 'WARNING', 'ERROR', 'CRITICAL']).toContain(severity);
    });
  });

  it('debe cubrir todas las acciones de 2FA', () => {
    const twoFaActions: AuditAction[] = [
      '2FA_SETUP_INITIATED',
      '2FA_SETUP_FAILED',
      '2FA_ENABLED',
      '2FA_ENABLE_FAILED',
      '2FA_DISABLED',
      '2FA_DISABLE_FAILED',
      '2FA_VERIFY_SUCCESS',
      '2FA_VERIFY_FAILED',
      '2FA_BACKUP_CODES_REGENERATED',
      '2FA_REGENERATE_CODES_FAILED',
    ];

    twoFaActions.forEach((action) => {
      const severity = getDefaultSeverity(action);
      expect(['INFO', 'WARNING']).toContain(severity);
    });
  });

  it('debe cubrir todas las acciones CRUD', () => {
    const crudActions: AuditAction[] = [
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_ACTIVATE',
      'USER_DEACTIVATE',
      'PRODUCT_CREATE',
      'PRODUCT_UPDATE',
      'PRODUCT_DELETE',
      'ORDER_CREATE',
      'ORDER_APPROVE',
      'ORDER_REJECT',
      'ORDER_COMPLETE',
      'INVENTORY_CAPTURE',
    ];

    crudActions.forEach((action) => {
      const severity = getDefaultSeverity(action);
      expect(['INFO', 'WARNING']).toContain(severity);
    });
  });
});

describe('createAuditLog', () => {
  it('debe crear log con valores por defecto', () => {
    const log = createAuditLog('LOGIN_SUCCESS');

    expect(log.action).toBe('LOGIN_SUCCESS');
    expect(log.severity).toBe('INFO');
    expect(log.userId).toBeNull();
    expect(log.username).toBeNull();
    expect(log.ipAddress).toBeNull();
    expect(log.userAgent).toBeNull();
    expect(log.resource).toBeNull();
    expect(log.resourceId).toBeNull();
    expect(log.details).toEqual({});
    expect(log.success).toBe(true);
    expect(log.errorMessage).toBeNull();
  });

  it('debe crear log con todas las opciones', () => {
    const log = createAuditLog('USER_CREATE', {
      userId: '123',
      username: 'admin',
      resource: 'users',
      resourceId: '456',
      details: { newRole: 'admin' },
      success: true,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    });

    expect(log.action).toBe('USER_CREATE');
    expect(log.userId).toBe('123');
    expect(log.username).toBe('admin');
    expect(log.resource).toBe('users');
    expect(log.resourceId).toBe('456');
    expect(log.details).toEqual({ newRole: 'admin' });
    expect(log.ipAddress).toBe('192.168.1.1');
    expect(log.userAgent).toBe('Mozilla/5.0');
  });

  it('debe crear log de error con mensaje', () => {
    const log = createAuditLog('LOGIN_FAILED', {
      username: 'hacker',
      success: false,
      errorMessage: 'Invalid credentials',
    });

    expect(log.success).toBe(false);
    expect(log.errorMessage).toBe('Invalid credentials');
    expect(log.severity).toBe('WARNING');
  });

  it('debe asignar severidad correcta automáticamente', () => {
    const criticalLog = createAuditLog('SECURITY_VIOLATION');
    expect(criticalLog.severity).toBe('CRITICAL');

    const errorLog = createAuditLog('RATE_LIMIT_EXCEEDED');
    expect(errorLog.severity).toBe('ERROR');
  });
});

describe('extractRequestInfo', () => {
  it('debe extraer IP de x-forwarded-for header', () => {
    const mockRequest = {
      headers: {
        get: jest.fn((name: string) => {
          if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
          if (name === 'user-agent') return 'TestAgent';
          return null;
        }),
      },
    } as unknown as Request;

    const info = extractRequestInfo(mockRequest);

    expect(info.ipAddress).toBe('192.168.1.1');
    expect(info.userAgent).toBe('TestAgent');
  });

  it('debe extraer IP de x-real-ip header si x-forwarded-for no existe', () => {
    const mockRequest = {
      headers: {
        get: jest.fn((name: string) => {
          if (name === 'x-real-ip') return '10.0.0.1';
          if (name === 'user-agent') return 'TestAgent';
          return null;
        }),
      },
    } as unknown as Request;

    const info = extractRequestInfo(mockRequest);

    expect(info.ipAddress).toBe('10.0.0.1');
  });

  it('debe retornar "unknown" si no hay headers de IP', () => {
    const mockRequest = {
      headers: {
        get: jest.fn(() => null),
      },
    } as unknown as Request;

    const info = extractRequestInfo(mockRequest);

    expect(info.ipAddress).toBe('unknown');
    expect(info.userAgent).toBe('unknown');
  });

  it('debe manejar user-agent vacío', () => {
    const mockRequest = {
      headers: {
        get: jest.fn((name: string) => {
          if (name === 'x-forwarded-for') return '127.0.0.1';
          return null;
        }),
      },
    } as unknown as Request;

    const info = extractRequestInfo(mockRequest);

    expect(info.userAgent).toBe('unknown');
  });
});

describe('logAuditEvent', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('debe loguear a consola en desarrollo', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    await logAuditEvent({
      action: 'LOGIN_SUCCESS',
      severity: 'INFO',
      userId: '1',
      username: 'testuser',
      ipAddress: '127.0.0.1',
      userAgent: 'Jest',
      resource: null,
      resourceId: null,
      details: {},
      success: true,
      errorMessage: null,
    });

    expect(consoleSpy).toHaveBeenCalled();
    const logMessage = consoleSpy.mock.calls[0][0];
    expect(logMessage).toContain('[AUDIT]');
    expect(logMessage).toContain('LOGIN_SUCCESS');
    expect(logMessage).toContain('testuser');
    expect(logMessage).toContain('SUCCESS');

    process.env.NODE_ENV = originalEnv;
  });

  it('debe usar icono correcto para cada severidad', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // Test CRITICAL
    await logAuditEvent({
      action: 'SECURITY_VIOLATION',
      severity: 'CRITICAL',
      userId: null,
      username: null,
      ipAddress: null,
      userAgent: null,
      resource: null,
      resourceId: null,
      details: {},
      success: false,
      errorMessage: null,
    });

    expect(consoleSpy.mock.calls[0][0]).toContain('🚨');

    consoleSpy.mockClear();

    // Test ERROR
    await logAuditEvent({
      action: 'RATE_LIMIT_EXCEEDED',
      severity: 'ERROR',
      userId: null,
      username: null,
      ipAddress: null,
      userAgent: null,
      resource: null,
      resourceId: null,
      details: {},
      success: false,
      errorMessage: null,
    });

    expect(consoleSpy.mock.calls[0][0]).toContain('❌');

    consoleSpy.mockClear();

    // Test WARNING
    await logAuditEvent({
      action: 'LOGIN_FAILED',
      severity: 'WARNING',
      userId: null,
      username: 'attacker',
      ipAddress: null,
      userAgent: null,
      resource: null,
      resourceId: null,
      details: {},
      success: false,
      errorMessage: null,
    });

    expect(consoleSpy.mock.calls[0][0]).toContain('⚠️');

    process.env.NODE_ENV = originalEnv;
  });

  it('debe manejar username null como "anonymous"', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    await logAuditEvent({
      action: 'LOGIN_FAILED',
      severity: 'WARNING',
      userId: null,
      username: null,
      ipAddress: null,
      userAgent: null,
      resource: null,
      resourceId: null,
      details: {},
      success: false,
      errorMessage: null,
    });

    expect(consoleSpy.mock.calls[0][0]).toContain('anonymous');

    process.env.NODE_ENV = originalEnv;
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Audit Log Integration', () => {
  it('debe permitir flujo completo de auditoría', () => {
    const { result } = renderHook(() => useAuditLogStore());

    // Simular login exitoso
    act(() => {
      const loginLog = createAuditLog('LOGIN_SUCCESS', {
        userId: '1',
        username: 'admin',
        ipAddress: '192.168.1.1',
        userAgent: 'Chrome',
      });
      result.current.addLog(loginLog);
    });

    // Simular creación de usuario
    act(() => {
      const createLog = createAuditLog('USER_CREATE', {
        userId: '1',
        username: 'admin',
        resource: 'users',
        resourceId: '2',
        details: { newUser: 'john' },
      });
      result.current.addLog(createLog);
    });

    // Simular logout
    act(() => {
      const logoutLog = createAuditLog('LOGOUT', {
        userId: '1',
        username: 'admin',
      });
      result.current.addLog(logoutLog);
    });

    // Verificar logs
    expect(result.current.logs).toHaveLength(3);

    // Filtrar por usuario
    const userLogs = result.current.getLogs({ userId: '1' });
    expect(userLogs).toHaveLength(3);

    // Exportar
    const exported = result.current.exportLogs();
    const parsed = JSON.parse(exported);
    expect(parsed[0].action).toBe('LOGOUT'); // Most recent first
    expect(parsed[2].action).toBe('LOGIN_SUCCESS');
  });

  it('debe registrar intentos de seguridad', () => {
    const { result } = renderHook(() => useAuditLogStore());

    // Múltiples intentos fallidos
    for (let i = 0; i < 5; i++) {
      act(() => {
        const failedLog = createAuditLog('LOGIN_FAILED', {
          username: 'hacker',
          ipAddress: '203.0.113.0',
          success: false,
          errorMessage: 'Invalid credentials',
        });
        result.current.addLog(failedLog);
      });
    }

    // Registrar violación de seguridad
    act(() => {
      const violationLog = createAuditLog('SECURITY_VIOLATION', {
        ipAddress: '203.0.113.0',
        success: false,
        details: { reason: 'Brute force detected', attempts: 5 },
      });
      result.current.addLog(violationLog);
    });

    // Verificar
    const failedLogs = result.current.getLogs({ success: false });
    expect(failedLogs).toHaveLength(6);

    const criticalLogs = result.current.getLogs({ severity: 'CRITICAL' });
    expect(criticalLogs).toHaveLength(1);
    expect(criticalLogs[0].details).toEqual({ reason: 'Brute force detected', attempts: 5 });
  });
});
