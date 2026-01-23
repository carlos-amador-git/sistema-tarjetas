/**
 * Store de Usuarios - Zustand
 *
 * Estado global para gestión de usuarios con persistencia en localStorage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { USUARIOS, type Usuario } from '@/data/mockData';

// Re-export para uso externo
export type { Usuario };

// =============================================================================
// TIPOS
// =============================================================================

export interface NuevoUsuario {
  nombre: string;
  username: string;
  email: string;
  rol: string;
  area: string;
}

export interface UserState {
  usuarios: Usuario[];
  nextUserId: number;
  lastUpdated: string;
}

export interface UserActions {
  crearUsuario: (usuario: NuevoUsuario) => number;
  actualizarUsuario: (id: number, datos: Partial<Omit<Usuario, 'id'>>) => void;
  toggleActivoUsuario: (id: number) => void;
  eliminarUsuario: (id: number) => void;
  resetToDefaults: () => void;
}

type UserStore = UserState & UserActions;

// =============================================================================
// ESTADO INICIAL
// =============================================================================

const getInitialState = (): UserState => ({
  usuarios: [...USUARIOS],
  nextUserId: Math.max(...USUARIOS.map((u) => u.id)) + 1,
  lastUpdated: new Date().toISOString(),
});

// =============================================================================
// STORE
// =============================================================================

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      crearUsuario: (nuevoUsuario) => {
        const state = get();
        const nuevoId = state.nextUserId;

        const usuario: Usuario = {
          id: nuevoId,
          ...nuevoUsuario,
          activo: true,
          ultimoAcceso: 'Nunca',
        };

        set({
          usuarios: [usuario, ...state.usuarios],
          nextUserId: nuevoId + 1,
          lastUpdated: new Date().toISOString(),
        });

        return nuevoId;
      },

      actualizarUsuario: (id, datos) => {
        set((state) => {
          const index = state.usuarios.findIndex((u) => u.id === id);
          if (index === -1) return state;

          const usuariosActualizados = [...state.usuarios];
          usuariosActualizados[index] = {
            ...usuariosActualizados[index],
            ...datos,
          };

          return {
            usuarios: usuariosActualizados,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      toggleActivoUsuario: (id) => {
        set((state) => {
          const index = state.usuarios.findIndex((u) => u.id === id);
          if (index === -1) return state;

          const usuariosActualizados = [...state.usuarios];
          usuariosActualizados[index] = {
            ...usuariosActualizados[index],
            activo: !usuariosActualizados[index].activo,
          };

          return {
            usuarios: usuariosActualizados,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      eliminarUsuario: (id) => {
        set((state) => ({
          usuarios: state.usuarios.filter((u) => u.id !== id),
          lastUpdated: new Date().toISOString(),
        }));
      },

      resetToDefaults: () => {
        set(getInitialState());
      },
    }),
    {
      name: 'cardsystem-users',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usuarios: state.usuarios,
        nextUserId: state.nextUserId,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// =============================================================================
// HOOKS DE CONVENIENCIA
// =============================================================================

export const useUsuarios = () => useUserStore((state) => state.usuarios);
