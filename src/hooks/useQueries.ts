/**
 * Hooks de React Query para data fetching
 *
 * ACTUALIZADO: Ahora usa APIs REST con Prisma en lugar de mockData
 *
 * Proporciona cache, deduplicación de requests, y sincronización
 * automática de datos entre componentes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// =============================================================================
// TIPOS
// =============================================================================

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  areas: string[];
  stock: number;
  stockMinimo: number;
  precio: number;
  activo: boolean;
}

export interface BalanceProducto {
  productoId: string;
  nombre: string;
  almacen: {
    bovedaTrabajo: number;
    bovedaPrincipal: number;
    total: number;
  };
  enProceso: {
    cantidad: number;
    ordenesActivas: number;
  };
  logistica: {
    colocacion: number;
    normal: number;
    devoluciones: number;
    total: number;
  };
  sucursales: {
    colocacion: number;
    stock: number;
    total: number;
  };
  totalGeneral: number;
}

export interface ResumenGlobal {
  totalInventario: number;
  enAlmacen: number;
  enLogistica: number;
  enSucursales: number;
  enProceso: number;
}

export interface MovimientoHistorial {
  id: number;
  fecha: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  productoId: string;
  producto: string;
  cantidad: number;
  usuario: string;
  area: string;
  observacion: string;
  documento: string;
}

export interface OrdenCompra {
  id: string;
  fecha: string;
  productoId: string;
  producto: string;
  cantidad: number;
  solicitante: string;
  area: string;
  estatus: 'PENDIENTE' | 'APROBADA' | 'COMPLETADA' | 'RECHAZADA';
  costoTotal: number;
}

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  email: string;
  rol: string;
  area: string;
  activo: boolean;
  ultimoAcceso?: string;
}

// =============================================================================
// QUERY KEYS
// =============================================================================

export const queryKeys = {
  // Inventory
  inventory: ['inventory'] as const,
  balance: ['inventory', 'balance'] as const,
  historial: ['inventory', 'historial'] as const,
  ordenes: ['inventory', 'ordenes'] as const,
  resumenGlobal: ['inventory', 'resumen'] as const,

  // Users
  users: ['users'] as const,
  user: (id: number) => ['users', id] as const,

  // Products
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productsByCategory: (category: string) => ['products', 'category', category] as const,
};

// =============================================================================
// INVENTORY QUERIES - Usando APIs
// =============================================================================

/**
 * Hook para obtener el balance de inventario
 */
export function useBalance() {
  return useQuery({
    queryKey: queryKeys.balance,
    queryFn: async () => {
      const response = await api.get<{ balance: Record<string, BalanceProducto>; resumen: ResumenGlobal }>('/api/balance');
      return response.balance;
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Hook para obtener el resumen global
 */
export function useResumenGlobal() {
  return useQuery({
    queryKey: queryKeys.resumenGlobal,
    queryFn: async () => {
      const response = await api.get<{ balance: Record<string, BalanceProducto>; resumen: ResumenGlobal }>('/api/balance');
      return response.resumen;
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Hook para obtener historial de movimientos con filtros
 */
export function useHistorial(filters?: {
  productoId?: string;
  tipo?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.historial, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.productoId) params.set('productoId', filters.productoId);
      if (filters?.tipo) params.set('tipo', filters.tipo);

      const url = `/api/historial${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get<{ movimientos: MovimientoHistorial[]; total: number }>(url);
      return response.movimientos;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Hook para obtener órdenes con filtros
 */
export function useOrdenes(filters?: {
  estatus?: OrdenCompra['estatus'];
  productoId?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.ordenes, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.estatus) params.set('estatus', filters.estatus);
      if (filters?.productoId) params.set('productoId', filters.productoId);

      const url = `/api/ordenes${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get<{ ordenes: OrdenCompra[] }>(url);
      return response.ordenes;
    },
    staleTime: 30 * 1000,
  });
}

// =============================================================================
// INVENTORY MUTATIONS - Usando APIs
// =============================================================================

/**
 * Mutation para crear una orden
 */
export function useCrearOrden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orden: { productoId: string; cantidad: number; userId: number; area: string }) => {
      const response = await api.post<OrdenCompra>('/api/ordenes', orden);
      return response.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ordenes });
      queryClient.invalidateQueries({ queryKey: queryKeys.resumenGlobal });
    },
  });
}

/**
 * Mutation para actualizar estatus de orden
 */
export function useActualizarEstatusOrden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, estatus }: { id: string; estatus: OrdenCompra['estatus'] }) => {
      await api.put(`/api/ordenes/${id}`, { estatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ordenes });
      queryClient.invalidateQueries({ queryKey: queryKeys.historial });
      queryClient.invalidateQueries({ queryKey: queryKeys.balance });
      queryClient.invalidateQueries({ queryKey: queryKeys.resumenGlobal });
    },
  });
}

/**
 * Mutation para registrar movimiento en historial
 */
export function useRegistrarMovimiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movimiento: {
      tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
      productoId: string;
      cantidad: number;
      userId: number;
      area: string;
      observacion?: string;
      documento: string;
    }) => {
      const response = await api.post<MovimientoHistorial>('/api/historial', movimiento);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.historial });
      queryClient.invalidateQueries({ queryKey: queryKeys.balance });
      queryClient.invalidateQueries({ queryKey: queryKeys.resumenGlobal });
    },
  });
}

/**
 * Mutation para actualizar balance (capturas)
 */
export function useActualizarBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productoId, data }: {
      productoId: string;
      data: {
        almacen?: { bovedaTrabajo?: number; bovedaPrincipal?: number };
        logistica?: { colocacion?: number; normal?: number; devoluciones?: number };
        sucursales?: { colocacion?: number; stock?: number };
        enProceso?: { cantidad?: number; ordenesActivas?: number };
      };
    }) => {
      await api.put(`/api/balance/${productoId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.balance });
      queryClient.invalidateQueries({ queryKey: queryKeys.resumenGlobal });
    },
  });
}

// Legacy alias for backward compatibility
export const useRegistrarCapturaAlmacen = useActualizarBalance;

// =============================================================================
// PRODUCT QUERIES - Usando APIs
// =============================================================================

/**
 * Hook para obtener todos los productos
 */
export function useProductos(filters?: {
  categoria?: string;
  activo?: boolean;
  lowStock?: boolean;
}) {
  return useQuery({
    queryKey: [...queryKeys.products, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.categoria && filters.categoria !== 'todas') {
        params.set('categoria', filters.categoria);
      }
      if (filters?.activo !== undefined) {
        params.set('activo', String(filters.activo));
      }

      const url = `/api/productos${params.toString() ? '?' + params.toString() : ''}`;
      const productos = await api.get<Producto[]>(url);

      // Client-side filter for lowStock (API doesn't have this)
      if (filters?.lowStock) {
        return productos.filter((p) => p.stock <= p.stockMinimo);
      }

      return productos;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Hook para obtener un producto por ID
 */
export function useProducto(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async () => {
      const producto = await api.get<Producto>(`/api/productos/${id}`);
      return producto;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener productos con stock bajo
 */
export function useProductosStockBajo() {
  return useQuery({
    queryKey: [...queryKeys.products, 'lowStock'],
    queryFn: async () => {
      const productos = await api.get<Producto[]>('/api/productos');
      return productos.filter((p) => p.stock <= p.stockMinimo);
    },
    staleTime: 30 * 1000,
  });
}

// =============================================================================
// PRODUCT MUTATIONS - Usando APIs
// =============================================================================

/**
 * Mutation para crear producto
 */
export function useCrearProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (producto: Omit<Producto, 'activo' | 'stock'>) => {
      const response = await api.post<Producto>('/api/productos', producto);
      return response.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

/**
 * Mutation para actualizar producto
 */
export function useActualizarProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Producto> }) => {
      await api.put(`/api/productos/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.product(id) });
    },
  });
}

/**
 * Mutation para eliminar producto (soft delete)
 */
export function useEliminarProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/productos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

/**
 * Mutation para ajustar stock (via producto update)
 */
export function useAjustarStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      cantidad,
      operacion,
    }: {
      id: string;
      cantidad: number;
      operacion: 'add' | 'subtract' | 'set';
    }) => {
      // Get current stock first
      const producto = await api.get<Producto>(`/api/productos/${id}`);
      let newStock = producto.stock;

      if (operacion === 'add') {
        newStock += cantidad;
      } else if (operacion === 'subtract') {
        newStock -= cantidad;
      } else {
        newStock = cantidad;
      }

      await api.put(`/api/productos/${id}`, { stock: newStock });
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.product(id) });
    },
  });
}

// =============================================================================
// USER QUERIES - Estos todavía usan el store (no hay API de usuarios aún)
// =============================================================================

// Importar stores para usuarios (aún no migrados a API)
import { useUserStore } from '@/stores/userStore';

/**
 * Hook para obtener todos los usuarios
 * TODO: Migrar a API cuando se cree /api/usuarios
 */
export function useUsuarios(filters?: {
  rol?: string;
  activo?: boolean;
  area?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.users, filters],
    queryFn: () => {
      const { usuarios } = useUserStore.getState();
      let filtered = usuarios;

      if (filters?.rol) {
        filtered = filtered.filter((u) => u.rol === filters.rol);
      }
      if (filters?.activo !== undefined) {
        filtered = filtered.filter((u) => u.activo === filters.activo);
      }
      if (filters?.area) {
        filtered = filtered.filter((u) => u.area === filters.area);
      }

      return filtered;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Hook para obtener un usuario por ID
 */
export function useUsuario(id: number) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => {
      const { usuarios } = useUserStore.getState();
      return usuarios.find((u) => u.id === id) || null;
    },
    enabled: !!id,
  });
}

// =============================================================================
// USER MUTATIONS - Usando store (pendiente API)
// =============================================================================

export function useCrearUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuario: { nombre: string; username: string; email: string; rol: string; area: string }) => {
      const { crearUsuario } = useUserStore.getState();
      const id = crearUsuario(usuario);
      return Promise.resolve(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useActualizarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ nombre: string; email: string; rol: string; area: string }> }) => {
      const { actualizarUsuario } = useUserStore.getState();
      actualizarUsuario(id, data);
      return Promise.resolve();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) });
    },
  });
}

export function useEliminarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => {
      const { eliminarUsuario } = useUserStore.getState();
      eliminarUsuario(id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useToggleActivoUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => {
      const { toggleActivoUsuario } = useUserStore.getState();
      toggleActivoUsuario(id);
      return Promise.resolve();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) });
    },
  });
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook para invalidar todas las queries de inventario
 */
export function useInvalidateInventory() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
  };
}

/**
 * Hook para prefetch de datos comunes al cargar el dashboard
 */
export function usePrefetchDashboardData() {
  const queryClient = useQueryClient();

  return () => {
    // Prefetch balance
    queryClient.prefetchQuery({
      queryKey: queryKeys.balance,
      queryFn: async () => {
        const response = await api.get<{ balance: Record<string, BalanceProducto> }>('/api/balance');
        return response.balance;
      },
    });

    // Prefetch productos con stock bajo
    queryClient.prefetchQuery({
      queryKey: [...queryKeys.products, 'lowStock'],
      queryFn: async () => {
        const productos = await api.get<Producto[]>('/api/productos');
        return productos.filter((p) => p.stock <= p.stockMinimo);
      },
    });
  };
}
