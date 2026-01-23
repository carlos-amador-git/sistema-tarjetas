'use client';

/**
 * Hook y Contexto de Autenticación
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { getRoleConfig, hasModuleAccess } from '@/config';
import { User, RoleKey, RoleConfig } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roleConfig: RoleConfig | null;
  login: (username: string, password: string) => Promise<{
    success: boolean;
    error?: string;
    requires_2fa?: boolean;
    user_id?: number;
  }>;
  loginWithFace: (faceDescriptor: Float32Array) => Promise<{ success: boolean; error?: string }>;
  verify2FA: (userId: number, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasAccess: (moduleId: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cargar usuario al iniciar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        if (storedUser && authService.hasToken()) {
          // Verificar que la sesión sigue siendo válida
          const { valid, user: freshUser } = await authService.verifySession();
          if (valid && freshUser) {
            setUser(freshUser);
          } else {
            // Sesión inválida, limpiar
            await authService.logout();
          }
        }
      } catch {
        // Error verificando sesión, usar datos locales
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await authService.login(username, password);

      // Si requiere 2FA, retornar sin establecer usuario
      if (result.requires_2fa) {
        return { success: false, requires_2fa: true, user_id: result.user_id };
      }

      if (result.user) {
        setUser(result.user);
      }
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de autenticación';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verify2FA = useCallback(async (userId: number, code: string) => {
    try {
      setIsLoading(true);
      const { user: loggedUser } = await authService.verify2FA(userId, code);
      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Código de verificación inválido';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithFace = useCallback(async (faceDescriptor: Float32Array) => {
    try {
      setIsLoading(true);
      const { user: loggedUser } = await authService.loginWithFace(faceDescriptor);
      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en reconocimiento facial';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const hasAccess = useCallback(
    (moduleId: string): boolean => {
      if (!user) return false;
      return hasModuleAccess(user.rol, moduleId);
    },
    [user]
  );

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
    } catch {
      // Si falla, mantener el usuario actual
    }
  }, []);

  const roleConfig = user ? getRoleConfig(user.rol) : null;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    roleConfig,
    login,
    loginWithFace,
    verify2FA,
    logout,
    hasAccess,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export default useAuth;
