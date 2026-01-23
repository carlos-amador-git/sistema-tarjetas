/**
 * Cliente API para comunicación con el backend
 *
 * SEGURIDAD: Los tokens JWT se envían automáticamente via httpOnly cookies.
 * No se almacenan ni se acceden desde JavaScript del cliente.
 */

import { API_CONFIG } from '@/config';

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado o inválido - redirigir a login
        if (typeof window !== 'undefined') {
          // Llamar al endpoint de logout para limpiar cookies
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
            });
          } catch {
            // Ignorar errores
          }
          window.location.href = '/login';
        }
      }

      const error = await response.json().catch(() => ({ message: 'Error de red' }));
      throw new Error(error.detail || error.message || 'Error en la solicitud');
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Enviar cookies httpOnly automáticamente
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // Enviar cookies httpOnly automáticamente
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // Enviar cookies httpOnly automáticamente
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Enviar cookies httpOnly automáticamente
      ...options,
    });

    return this.handleResponse<T>(response);
  }
}

const api = new ApiClient(API_CONFIG.baseUrl);

export default api;
