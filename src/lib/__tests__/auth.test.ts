/**
 * Tests para el servicio de autenticación
 *
 * Verifica que el authService funcione correctamente con httpOnly cookies
 */

import { authService } from '../auth';

// Mock de fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('authService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Limpiar cookies del documento
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  describe('login', () => {
    it('should call /api/auth/login with correct credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        nombre: 'Admin User',
        email: 'admin@test.com',
        rol: 'admin',
        area: 'sistemas',
        activo: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, user: mockUser }),
      });

      const result = await authService.login('admin', 'password123');

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: 'password123' }),
        credentials: 'include',
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should throw error on invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Credenciales inválidas' }),
      });

      await expect(authService.login('wrong', 'credentials'))
        .rejects.toThrow('Credenciales inválidas');
    });

    it('should handle network errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.reject(new Error('Network error')),
      });

      await expect(authService.login('user', 'pass'))
        .rejects.toThrow('Error de autenticación');
    });
  });

  describe('logout', () => {
    it('should call /api/auth/logout endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await authService.logout();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    });

    it('should not throw on logout errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // logout no debe lanzar error
      await expect(authService.logout()).resolves.toBeUndefined();
    });
  });

  describe('verifySession', () => {
    it('should return valid session when authenticated', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        nombre: 'Admin',
        rol: 'admin',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ authenticated: true, user: mockUser }),
      });

      const result = await authService.verifySession();

      expect(result.valid).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should return invalid when not authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ authenticated: false, user: null }),
      });

      const result = await authService.verifySession();

      expect(result.valid).toBe(false);
    });

    it('should return invalid on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.verifySession();

      expect(result.valid).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        nombre: 'Admin',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ authenticated: true, user: mockUser }),
      });

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('should throw when not authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ authenticated: false, user: null }),
      });

      await expect(authService.getCurrentUser())
        .rejects.toThrow('No authenticated');
    });
  });

  describe('hasToken', () => {
    it('should return true when user_info cookie exists', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'user_info=%7B%22id%22%3A1%7D; other_cookie=value',
      });

      expect(authService.hasToken()).toBe(true);
    });

    it('should return false when no user_info cookie', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'other_cookie=value',
      });

      expect(authService.hasToken()).toBe(false);
    });

    it('should return false when cookies are empty', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });

      expect(authService.hasToken()).toBe(false);
    });
  });

  describe('getStoredUser', () => {
    it('should parse user from user_info cookie', () => {
      const user = { id: 1, username: 'admin', nombre: 'Admin' };
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: `user_info=${encodeURIComponent(JSON.stringify(user))}`,
      });

      expect(authService.getStoredUser()).toEqual(user);
    });

    it('should return null when cookie not found', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });

      expect(authService.getStoredUser()).toBeNull();
    });

    it('should return null on parse error', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'user_info=invalid-json',
      });

      expect(authService.getStoredUser()).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should return true on successful refresh', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await authService.refreshToken();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
    });

    it('should return false on refresh failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await authService.refreshToken();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.refreshToken();

      expect(result).toBe(false);
    });
  });
});
