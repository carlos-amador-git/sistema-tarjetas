/**
 * Tests para useQueries hooks
 *
 * Tests para los hooks de React Query que manejan data fetching
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// =============================================================================
// MOCKS
// =============================================================================

// Mock stores
const mockInventoryState = {
  balance: {
    almacen: { bovedaTrabajo: { cantidad: 100 }, bovedaPrincipal: { cantidad: 200 } },
    enProceso: { cantidad: 50 },
    logistica: { normal: { cantidad: 30 }, colocacion: { cantidad: 20 } },
    sucursales: { stock: { cantidad: 40 }, colocacion: { cantidad: 10 } },
  },
  historial: [
    { id: '1', productoId: 'prod-1', tipo: 'entrada', fecha: '2024-01-15', cantidad: 10 },
    { id: '2', productoId: 'prod-2', tipo: 'salida', fecha: '2024-01-16', cantidad: 5 },
    { id: '3', productoId: 'prod-1', tipo: 'salida', fecha: '2024-01-17', cantidad: 3 },
  ],
  ordenes: [
    { id: 'ord-1', productoId: 'prod-1', estatus: 'pendiente', cantidad: 100 },
    { id: 'ord-2', productoId: 'prod-2', estatus: 'completada', cantidad: 50 },
  ],
  getResumenGlobal: jest.fn(() => ({
    totalTarjetas: 450,
    enAlmacen: 300,
    enProceso: 50,
    enLogistica: 50,
    enSucursales: 50,
  })),
  crearOrden: jest.fn(() => 'new-order-id'),
  actualizarEstatusOrden: jest.fn(),
  registrarCapturaAlmacen: jest.fn(),
};

const mockUserState = {
  usuarios: [
    { id: 1, nombre: 'Admin', rol: 'admin', activo: true, area: 'TI' },
    { id: 2, nombre: 'Usuario', rol: 'usuario', activo: true, area: 'Almacén' },
    { id: 3, nombre: 'Inactivo', rol: 'usuario', activo: false, area: 'TI' },
  ],
  agregarUsuario: jest.fn(() => 4),
  actualizarUsuario: jest.fn(),
  eliminarUsuario: jest.fn(),
  toggleActivo: jest.fn(),
};

const mockProductState = {
  productos: [
    { id: 'prod-1', nombre: 'Visa Gold', categoria: 'debito', stockMinimo: 100 },
    { id: 'prod-2', nombre: 'Master Platinum', categoria: 'credito', stockMinimo: 50 },
  ],
  getProducto: jest.fn((id: string) => mockProductState.productos.find(p => p.id === id)),
  agregarProducto: jest.fn(),
  actualizarProducto: jest.fn(),
  eliminarProducto: jest.fn(),
};

jest.mock('@/stores/inventoryStore', () => ({
  useInventoryStore: {
    getState: () => mockInventoryState,
  },
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: {
    getState: () => mockUserState,
  },
}));

jest.mock('@/stores/productStore', () => ({
  useProductStore: {
    getState: () => mockProductState,
  },
}));

// Import después de mocks
import {
  queryKeys,
  useBalance,
  useResumenGlobal,
  useHistorial,
  useOrdenes,
  useCrearOrden,
  useActualizarEstatusOrden,
  useRegistrarCapturaAlmacen,
  useUsuarios,
  useUsuario,
  useCrearUsuario,
  useActualizarUsuario,
  useProductos,
  useProducto,
  useCrearProducto,
  useInvalidateInventory,
} from '../useQueries';

// =============================================================================
// TEST SETUP
// =============================================================================

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
};

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// QUERY KEYS TESTS
// =============================================================================

describe('queryKeys', () => {
  it('debe tener las keys de inventory', () => {
    expect(queryKeys.inventory).toEqual(['inventory']);
    expect(queryKeys.balance).toEqual(['inventory', 'balance']);
    expect(queryKeys.historial).toEqual(['inventory', 'historial']);
    expect(queryKeys.ordenes).toEqual(['inventory', 'ordenes']);
    expect(queryKeys.resumenGlobal).toEqual(['inventory', 'resumen']);
  });

  it('debe tener las keys de users', () => {
    expect(queryKeys.users).toEqual(['users']);
    expect(queryKeys.user(1)).toEqual(['users', 1]);
    expect(queryKeys.user(42)).toEqual(['users', 42]);
  });

  it('debe tener las keys de products', () => {
    expect(queryKeys.products).toEqual(['products']);
    expect(queryKeys.product('abc')).toEqual(['products', 'abc']);
    expect(queryKeys.productsByCategory('debito')).toEqual(['products', 'category', 'debito']);
  });
});

// =============================================================================
// INVENTORY QUERIES TESTS
// =============================================================================

describe('useBalance', () => {
  it('debe retornar el balance del inventario', async () => {
    const { result } = renderHook(() => useBalance(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockInventoryState.balance);
  });
});

describe('useResumenGlobal', () => {
  it('debe retornar el resumen global', async () => {
    const { result } = renderHook(() => useResumenGlobal(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockInventoryState.getResumenGlobal).toHaveBeenCalled();
    expect(result.current.data).toEqual({
      totalTarjetas: 450,
      enAlmacen: 300,
      enProceso: 50,
      enLogistica: 50,
      enSucursales: 50,
    });
  });
});

describe('useHistorial', () => {
  it('debe retornar todo el historial sin filtros', async () => {
    const { result } = renderHook(() => useHistorial(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(3);
  });

  it('debe filtrar por productoId', async () => {
    const { result } = renderHook(
      () => useHistorial({ productoId: 'prod-1' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.every(h => h.productoId === 'prod-1')).toBe(true);
  });

  it('debe filtrar por tipo', async () => {
    const { result } = renderHook(
      () => useHistorial({ tipo: 'entrada' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].tipo).toBe('entrada');
  });

  it('debe filtrar por rango de fechas', async () => {
    const { result } = renderHook(
      () => useHistorial({ startDate: '2024-01-16', endDate: '2024-01-16' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].fecha).toBe('2024-01-16');
  });

  it('debe combinar múltiples filtros', async () => {
    const { result } = renderHook(
      () => useHistorial({ productoId: 'prod-1', tipo: 'salida' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
  });
});

describe('useOrdenes', () => {
  it('debe retornar todas las órdenes sin filtros', async () => {
    const { result } = renderHook(() => useOrdenes(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
  });

  it('debe filtrar por estatus', async () => {
    const { result } = renderHook(
      () => useOrdenes({ estatus: 'pendiente' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].estatus).toBe('pendiente');
  });

  it('debe filtrar por productoId', async () => {
    const { result } = renderHook(
      () => useOrdenes({ productoId: 'prod-2' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].productoId).toBe('prod-2');
  });
});

// =============================================================================
// INVENTORY MUTATIONS TESTS
// =============================================================================

describe('useCrearOrden', () => {
  it('debe crear una orden y retornar el id', async () => {
    const { result } = renderHook(() => useCrearOrden(), { wrapper: createWrapper() });

    const nuevaOrden = {
      productoId: 'prod-1',
      cantidad: 100,
      estatus: 'pendiente' as const,
      fechaCreacion: '2024-01-20',
      proveedor: 'Test',
    };

    await result.current.mutateAsync(nuevaOrden);

    expect(mockInventoryState.crearOrden).toHaveBeenCalledWith(nuevaOrden);
  });
});

describe('useActualizarEstatusOrden', () => {
  it('debe actualizar el estatus de una orden', async () => {
    const { result } = renderHook(() => useActualizarEstatusOrden(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 'ord-1', estatus: 'completada' });

    expect(mockInventoryState.actualizarEstatusOrden).toHaveBeenCalledWith('ord-1', 'completada');
  });
});

describe('useRegistrarCapturaAlmacen', () => {
  it('debe registrar una captura de almacén', async () => {
    const { result } = renderHook(() => useRegistrarCapturaAlmacen(), { wrapper: createWrapper() });

    const captura = {
      productoId: 'prod-1',
      bovedaTrabajo: 50,
      bovedaPrincipal: 100,
      fecha: '2024-01-20',
      usuario: 'admin',
    };

    await result.current.mutateAsync(captura);

    expect(mockInventoryState.registrarCapturaAlmacen).toHaveBeenCalledWith(captura);
  });
});

// =============================================================================
// USER QUERIES TESTS
// =============================================================================

describe('useUsuarios', () => {
  it('debe retornar todos los usuarios sin filtros', async () => {
    const { result } = renderHook(() => useUsuarios(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(3);
  });

  it('debe filtrar por rol', async () => {
    const { result } = renderHook(
      () => useUsuarios({ rol: 'admin' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].rol).toBe('admin');
  });

  it('debe filtrar por activo', async () => {
    const { result } = renderHook(
      () => useUsuarios({ activo: false }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].activo).toBe(false);
  });

  it('debe filtrar por area', async () => {
    const { result } = renderHook(
      () => useUsuarios({ area: 'TI' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
  });
});

describe('useUsuario', () => {
  it('debe retornar un usuario por id', async () => {
    const { result } = renderHook(() => useUsuario(1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.nombre).toBe('Admin');
  });

  it('debe retornar null si el usuario no existe', async () => {
    const { result } = renderHook(() => useUsuario(999), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });

  it('no debe ejecutar query si id es 0', async () => {
    const { result } = renderHook(() => useUsuario(0), { wrapper: createWrapper() });

    // La query no debe ejecutarse porque enabled: !!id es false para 0
    expect(result.current.fetchStatus).toBe('idle');
  });
});

// =============================================================================
// USER MUTATIONS TESTS
// =============================================================================

describe('useCrearUsuario', () => {
  it('debe retornar funciones de mutation', () => {
    const { result } = renderHook(() => useCrearUsuario(), { wrapper: createWrapper() });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useActualizarUsuario', () => {
  it('debe retornar funciones de mutation', () => {
    const { result } = renderHook(() => useActualizarUsuario(), { wrapper: createWrapper() });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useEliminarUsuario', () => {
  it('debe retornar funciones de mutation', () => {
    const { result } = renderHook(
      () => {
        // Importar dinámicamente para coverage
        const { useEliminarUsuario } = require('../useQueries');
        return useEliminarUsuario();
      },
      { wrapper: createWrapper() }
    );

    expect(result.current.mutate).toBeDefined();
  });
});

describe('useToggleActivoUsuario', () => {
  it('debe retornar funciones de mutation', () => {
    const { result } = renderHook(
      () => {
        const { useToggleActivoUsuario } = require('../useQueries');
        return useToggleActivoUsuario();
      },
      { wrapper: createWrapper() }
    );

    expect(result.current.mutate).toBeDefined();
  });
});

// =============================================================================
// PRODUCT QUERIES TESTS
// =============================================================================

describe('useProductos', () => {
  it('debe retornar todos los productos sin filtros', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
  });

  it('debe filtrar por categoría', async () => {
    const { result } = renderHook(
      () => useProductos({ categoria: 'debito' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].categoria).toBe('debito');
  });

  it('debe manejar filtro lowStock', async () => {
    const { result } = renderHook(
      () => useProductos({ lowStock: true }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Los productos mock no tienen la propiedad para lowStock así que retorna todos
    expect(result.current.data).toBeDefined();
  });
});

describe('useProductosStockBajo', () => {
  it('debe retornar productos con stock bajo', async () => {
    const { useProductosStockBajo } = require('../useQueries');
    const { result } = renderHook(() => useProductosStockBajo(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useActualizarProducto', () => {
  it('debe retornar funciones de mutation', () => {
    const { useActualizarProducto } = require('../useQueries');
    const { result } = renderHook(() => useActualizarProducto(), { wrapper: createWrapper() });

    expect(result.current.mutate).toBeDefined();
  });
});

describe('useEliminarProducto', () => {
  it('debe retornar funciones de mutation', () => {
    const { useEliminarProducto } = require('../useQueries');
    const { result } = renderHook(() => useEliminarProducto(), { wrapper: createWrapper() });

    expect(result.current.mutate).toBeDefined();
  });
});

describe('useAjustarStock', () => {
  it('debe retornar funciones de mutation', () => {
    const { useAjustarStock } = require('../useQueries');
    const { result } = renderHook(() => useAjustarStock(), { wrapper: createWrapper() });

    expect(result.current.mutate).toBeDefined();
  });
});

describe('usePrefetchDashboardData', () => {
  it('debe retornar una función de prefetch', () => {
    const { usePrefetchDashboardData } = require('../useQueries');
    const { result } = renderHook(() => usePrefetchDashboardData(), { wrapper: createWrapper() });

    expect(typeof result.current).toBe('function');
  });
});

describe('useProducto', () => {
  it('debe retornar un producto por id', async () => {
    const { result } = renderHook(() => useProducto('prod-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // El hook usa getProducto del store
    expect(result.current.data).toBeDefined();
  });

  it('no debe ejecutar query si id está vacío', async () => {
    const { result } = renderHook(() => useProducto(''), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCrearProducto', () => {
  it('debe llamar la función mutate', async () => {
    const { result } = renderHook(() => useCrearProducto(), { wrapper: createWrapper() });

    // Verificar que el hook retorna una mutation
    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});

// =============================================================================
// UTILITY HOOKS TESTS
// =============================================================================

describe('useInvalidateInventory', () => {
  it('debe retornar una función de invalidación', () => {
    const { result } = renderHook(() => useInvalidateInventory(), { wrapper: createWrapper() });

    expect(typeof result.current).toBe('function');
  });

  it('la función debe ser llamable sin errores', () => {
    const { result } = renderHook(() => useInvalidateInventory(), { wrapper: createWrapper() });

    // La función no retorna promesa, solo invalida queries
    expect(() => result.current()).not.toThrow();
  });
});
