/**
 * Servicio de Autenticación
 *
 * Utiliza API routes de Next.js para manejar tokens en httpOnly cookies.
 * Los tokens NUNCA se exponen al JavaScript del cliente.
 */

import { User } from '@/types';

interface LoginResponse {
  success: boolean;
  user: User;
  error?: string;
  requires_2fa?: boolean;
  user_id?: number;
}

interface TwoFactorSetupResponse {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

interface TwoFactorStatusResponse {
  enabled: boolean;
  backup_codes_remaining: number;
}

interface SessionResponse {
  authenticated: boolean;
  user: User | null;
  offline?: boolean;
}

export const authService = {
  /**
   * Login con usuario y contraseña
   * Los tokens se almacenan en httpOnly cookies via la API route
   * Puede requerir 2FA si el usuario lo tiene activado
   */
  async login(username: string, password: string): Promise<{
    success: boolean;
    user?: User;
    requires_2fa?: boolean;
    user_id?: number;
  }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include', // Importante para cookies
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error de autenticación' }));
      throw new Error(error.error || 'Credenciales inválidas');
    }

    const data: LoginResponse = await response.json();

    // Verificar si requiere 2FA
    if (data.requires_2fa) {
      return { success: false, requires_2fa: true, user_id: data.user_id };
    }

    return { success: true, user: data.user };
  },

  /**
   * Login con reconocimiento facial
   */
  async loginWithFace(faceDescriptor: Float32Array): Promise<{ success: boolean; user: User }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        face_descriptor: Array.from(faceDescriptor),
        auth_type: 'facial',
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error en reconocimiento facial' }));
      throw new Error(error.error || 'Error en reconocimiento facial');
    }

    const data: LoginResponse = await response.json();
    return { success: true, user: data.user };
  },

  /**
   * Cerrar sesión
   * Limpia las cookies httpOnly via la API route
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignorar errores de red, el usuario ya se deslogueó del cliente
    }
  },

  /**
   * Obtener usuario actual desde la sesión
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('No authenticated');
    }

    const data: SessionResponse = await response.json();

    if (!data.authenticated || !data.user) {
      throw new Error('No authenticated');
    }

    return data.user;
  },

  /**
   * Verificar si hay sesión activa
   */
  async verifySession(): Promise<{ valid: boolean; user?: User }> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return { valid: false };
      }

      const data: SessionResponse = await response.json();

      if (data.authenticated && data.user) {
        return { valid: true, user: data.user };
      }

      return { valid: false };
    } catch {
      return { valid: false };
    }
  },

  /**
   * Obtener usuario de la cookie user_info (información no sensible)
   * Útil para mostrar UI sin hacer request al servidor
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;

    try {
      // Leer la cookie user_info (no httpOnly)
      const cookies = document.cookie.split(';');
      const userCookie = cookies.find(c => c.trim().startsWith('user_info='));

      if (!userCookie) return null;

      const userJson = decodeURIComponent(userCookie.split('=')[1]);
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  /**
   * Verificar si hay token almacenado
   * Basado en la existencia de la cookie user_info (proxy de sesión)
   */
  hasToken(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const cookies = document.cookie.split(';');
      return cookies.some(c => c.trim().startsWith('user_info='));
    } catch {
      return false;
    }
  },

  /**
   * Refrescar el token de acceso
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Registrar rostro de usuario
   */
  async registerFace(userId: number, faceDescriptor: Float32Array): Promise<{ success: boolean }> {
    const response = await fetch(`/api/usuarios/${userId}/face`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        face_descriptor: Array.from(faceDescriptor),
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error registrando rostro');
    }

    return response.json();
  },

  /**
   * Eliminar registro facial
   */
  async deleteFace(userId: number): Promise<{ success: boolean }> {
    const response = await fetch(`/api/usuarios/${userId}/face`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error eliminando registro facial');
    }

    return response.json();
  },

  // ==========================================================================
  // FUNCIONES DE 2FA (Two-Factor Authentication)
  // ==========================================================================

  /**
   * Verificar código 2FA y completar login
   */
  async verify2FA(userId: number, code: string): Promise<{ success: boolean; user: User }> {
    const response = await fetch('/api/auth/2fa/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, code }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Código inválido' }));
      throw new Error(error.error || 'Código de verificación inválido');
    }

    const data: LoginResponse = await response.json();
    return { success: true, user: data.user };
  },

  /**
   * Iniciar configuración de 2FA (obtener QR y códigos de respaldo)
   */
  async setup2FA(): Promise<TwoFactorSetupResponse> {
    const response = await fetch('/api/auth/2fa/setup', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error configurando 2FA' }));
      throw new Error(error.error || 'Error al iniciar configuración de 2FA');
    }

    return response.json();
  },

  /**
   * Activar 2FA verificando un código TOTP
   */
  async enable2FA(code: string): Promise<{ success: boolean }> {
    const response = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Código inválido' }));
      throw new Error(error.error || 'Código de verificación inválido');
    }

    return { success: true };
  },

  /**
   * Desactivar 2FA
   */
  async disable2FA(code: string): Promise<{ success: boolean }> {
    const response = await fetch('/api/auth/2fa/disable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desactivando 2FA' }));
      throw new Error(error.error || 'Error al desactivar 2FA');
    }

    return { success: true };
  },

  /**
   * Obtener estado de 2FA del usuario actual
   */
  async get2FAStatus(): Promise<TwoFactorStatusResponse> {
    const response = await fetch('/api/auth/2fa/status', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error obteniendo estado de 2FA');
    }

    return response.json();
  },

  /**
   * Regenerar códigos de respaldo
   */
  async regenerateBackupCodes(code: string): Promise<{ backup_codes: string[] }> {
    const response = await fetch('/api/auth/2fa/regenerate-backup-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error regenerando códigos' }));
      throw new Error(error.error || 'Error al regenerar códigos de respaldo');
    }

    return response.json();
  },
};

export default authService;
