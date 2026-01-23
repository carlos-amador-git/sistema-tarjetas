/**
 * Hooks de React Query para data fetching
 *
 * Proporciona cache, deduplicación de requests, y sincronización
 * automática de datos entre componentes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useUserStore } from '@/stores/userStore';
import { useProductStore, type Producto } from '@/stores/productStore';
import { type OrdenCompra } from '@/data/mockData';

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
// INVENTORY QUERIES
// =============================================================================

/**
 * Hook para obtener el balance de inventario con cache
 */
export function useBalance() {
  return useQuery({
    queryKey: queryKeys.balance,
    queryFn: () => {
      const { balance } = useInventoryStore.getState();
      return balance;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
}

/**
 * Hook para obtener el resumen global con cache
 */
export function useResumenGlobal() {
  return useQuery({
    queryKey: queryKeys.resumenGlobal,
    queryFn: () => {
      const { getResumenGlobal } = useInventoryStore.getState();
      return getResumenGlobal();
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
    queryFn: () => {
      const { historial } = useInventoryStore.getState();
      let filtered = historial;

      if (filters?.productoId) {
        filtered = filtered.filter((h) => h.productoId === filters.productoId);
      }
      if (filters?.tipo) {
        filtered = filtered.filter((h) => h.tipo === filters.tipo);
      }
      if (filters?.startDate) {
        filtered = filtered.filter((h) => h.fecha >= filters.startDate!);
      }
      if (filters?.endDate) {
        filtered = filtered.filter((h) => h.fecha <= filters.endDate!);
      }

      return filtered;
    },
    staleTime: 60 * 1000, // 1 minuto
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
    queryFn: () => {
      const { ordenes } = useInventoryStore.getState();
      let filtered = ordenes;

      if (filters?.estatus) {
        filtered = filtered.filter((o) => o.estatus === filters.estatus);
      }
      if (filters?.productoId) {
        filtered = filtered.filter((o) => o.productoId === filters.productoId);
      }

      return filtered;
    },
    staleTime: 30 * 1000,
  });
}

// =============================================================================
// INVENTORY MUTATIONS
// =============================================================================

/**
 * Mutation para crear una orden
 */
export function useCrearOrden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orden: Omit<OrdenCompra, 'id'>) => {
      const { crearOrden } = useInventoryStore.getState();
      const id = crearOrden(orden);
      return Promise.resolve(id);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
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
    mutationFn: ({ id, estatus }: { id: string; estatus: OrdenCompra['estatus'] }) => {
      const { actualizarEstatusOrden } = useInventoryStore.getState();
      actualizarEstatusOrden(id, estatus);
      return Promise.resolve();
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
 * Mutation para registrar captura de almacén
 */
export function useRegistrarCapturaAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (captura: {
      productoId: string;
      bovedaTrabajo: number;
      bovedaPrincipal: number;
      fecha: string;
      usuario: string;
    }) => {
      const { registrarCapturaAlmacen } = useInventoryStore.getState();
      registrarCapturaAlmacen(captura);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.balance });
      queryClient.invalidateQueries({ queryKey: queryKeys.historial });
      queryClient.invalidateQueries({ queryKey: queryKeys.resumenGlobal });
    },
  });
}

// =============================================================================
// USER QUERIES
// =============================================================================

/**
 * Hook para obtener todos los usuarios
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
// USER MUTATIONS
// =============================================================================

/**
 * Mutation para crear usuario
 */
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

/**
 * Mutation para actualizar usuario
 */
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

/**
 * Mutation para eliminar usuario
 */
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

/**
 * Mutation para toggle activo usuario
 */
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
// PRODUCT QUERIES
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
    queryFn: () => {
      const { productos } = useProductStore.getState();
      let filtered = productos;

      if (filters?.categoria) {
        filtered = filtered.filter((p) => p.categoria === filters.categoria);
      }
      if (filters?.activo !== undefined) {
        filtered = filtered.filter((p) => p.activo === filters.activo);
      }
      if (filters?.lowStock) {
        filtered = filtered.filter((p) => p.stock <= p.stockMinimo);
      }

      return filtered;
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
    queryFn: () => {
      const { productos } = useProductStore.getState();
      return productos.find((p) => p.id === id) || null;
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
    queryFn: () => {
      const { productos } = useProductStore.getState();
      return productos.filter((p) => p.stock <= p.stockMinimo);
    },
    staleTime: 30 * 1000,
  });
}

// =============================================================================
// PRODUCT MUTATIONS
// =============================================================================

/**
 * Mutation para crear producto
 */
export function useCrearProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (producto: Omit<Producto, 'id' | 'activo'>) => {
      const { crearProducto } = useProductStore.getState();
      const id = crearProducto(producto);
      return Promise.resolve(id);
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Producto> }) => {
      const { actualizarProducto } = useProductStore.getState();
      actualizarProducto(id, data);
      return Promise.resolve();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.product(id) });
    },
  });
}

/**
 * Mutation para eliminar producto
 */
export function useEliminarProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const { eliminarProducto } = useProductStore.getState();
      eliminarProducto(id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

/**
 * Mutation para ajustar stock
 */
export function useAjustarStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      cantidad,
      operacion,
    }: {
      id: string;
      cantidad: number;
      operacion: 'add' | 'subtract' | 'set';
    }) => {
      const { ajustarStock } = useProductStore.getState();
      ajustarStock(id, cantidad, operacion);
      return Promise.resolve();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.product(id) });
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
      queryFn: () => useInventoryStore.getState().balance,
    });

    // Prefetch resumen
    queryClient.prefetchQuery({
      queryKey: queryKeys.resumenGlobal,
      queryFn: () => useInventoryStore.getState().getResumenGlobal(),
    });

    // Prefetch productos con stock bajo
    queryClient.prefetchQuery({
      queryKey: [...queryKeys.products, 'lowStock'],
      queryFn: () => {
        const { productos } = useProductStore.getState();
        return productos.filter((p) => p.stock <= p.stockMinimo);
      },
    });
  };
}
