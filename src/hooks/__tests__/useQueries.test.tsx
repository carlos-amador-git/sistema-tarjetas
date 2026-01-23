/**
 * Tests para useQueries hooks
 *
 * Tests para los hooks de React Query que usan APIs REST
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// =============================================================================
// MOCKS
// =============================================================================

// Mock API client
const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
const mockApiPut = jest.fn();
const mockApiDelete = jest.fn();

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
    put: (...args: unknown[]) => mockApiPut(...args),
    delete: (...args: unknown[]) => mockApiDelete(...args),
  },
}));

// Mock data
const mockBalanceResponse = {
  balance: {
    'TC-001': {
      productoId: 'TC-001',
      nombre: 'Tarjeta Clásica',
      almacen: { bovedaTrabajo: 100, bovedaPrincipal: 200, total: 300 },
      enProceso: { cantidad: 50, ordenesActivas: 1 },
      logistica: { colocacion: 20, normal: 30, devoluciones: 0, total: 50 },
      sucursales: { colocacion: 10, stock: 40, total: 50 },
      totalGeneral: 450,
    },
  },
  resumen: {
    totalInventario: 400,
    enAlmacen: 300,
    enLogistica: 50,
    enSucursales: 50,
    enProceso: 50,
  },
};

const mockProductos = [
  { id: 'TC-001', nombre: 'Tarjeta Clásica', categoria: 'tarjeta', areas: ['almacen'], stock: 100, stockMinimo: 50, precio: 25, activo: true },
  { id: 'TC-002', nombre: 'Tarjeta Gold', categoria: 'tarjeta', areas: ['almacen', 'logistica'], stock: 30, stockMinimo: 50, precio: 35, activo: true },
];

const mockHistorialResponse = {
  movimientos: [
    { id: 1, productoId: 'TC-001', producto: 'Tarjeta Clásica', tipo: 'ENTRADA', fecha: '2024-01-15', cantidad: 10, usuario: 'admin', area: 'Almacén', observacion: 'Test', documento: 'DOC-001' },
    { id: 2, productoId: 'TC-002', producto: 'Tarjeta Gold', tipo: 'SALIDA', fecha: '2024-01-16', cantidad: 5, usuario: 'user', area: 'Logística', observacion: 'Test 2', documento: 'DOC-002' },
  ],
  total: 2,
};

const mockOrdenesResponse = {
  ordenes: [
    { id: 'OC-001', productoId: 'TC-001', producto: 'Tarjeta Clásica', cantidad: 100, solicitante: 'Admin', area: 'Almacén', estatus: 'PENDIENTE', fecha: '2024-01-15', costoTotal: 2500 },
    { id: 'OC-002', productoId: 'TC-002', producto: 'Tarjeta Gold', cantidad: 50, solicitante: 'User', area: 'Logística', estatus: 'COMPLETADA', fecha: '2024-01-14', costoTotal: 1750 },
  ],
};

// Mock userStore for user queries (still uses store)
const mockUserState = {
  usuarios: [
    { id: 1, nombre: 'Admin', username: 'admin', email: 'admin@test.com', rol: 'admin', activo: true, area: 'TI' },
    { id: 2, nombre: 'Usuario', username: 'user', email: 'user@test.com', rol: 'usuario', activo: true, area: 'Almacén' },
    { id: 3, nombre: 'Inactivo', username: 'inactive', email: 'inactive@test.com', rol: 'usuario', activo: false, area: 'TI' },
  ],
  crearUsuario: jest.fn(() => 4),
  actualizarUsuario: jest.fn(),
  eliminarUsuario: jest.fn(),
  toggleActivoUsuario: jest.fn(),
};

jest.mock('@/stores/userStore', () => ({
  useUserStore: {
    getState: () => mockUserState,
  },
}));

// Import after mocks
import {
  queryKeys,
  useBalance,
  useResumenGlobal,
  useHistorial,
  useOrdenes,
  useCrearOrden,
  useActualizarEstatusOrden,
  useUsuarios,
  useUsuario,
  useCrearUsuario,
  useProductos,
  useProducto,
  useProductosStockBajo,
  useCrearProducto,
  useActualizarProducto,
  useEliminarProducto,
} from '../useQueries';

// =============================================================================
// TEST SETUP
// =============================================================================

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// =============================================================================
// TESTS
// =============================================================================

describe('queryKeys', () => {
  it('debe tener las keys correctas para inventory', () => {
    expect(queryKeys.inventory).toEqual(['inventory']);
    expect(queryKeys.balance).toEqual(['inventory', 'balance']);
    expect(queryKeys.historial).toEqual(['inventory', 'historial']);
    expect(queryKeys.ordenes).toEqual(['inventory', 'ordenes']);
  });

  it('debe tener las keys correctas para users', () => {
    expect(queryKeys.users).toEqual(['users']);
    expect(queryKeys.user(1)).toEqual(['users', 1]);
    expect(queryKeys.user(42)).toEqual(['users', 42]);
  });

  it('debe tener las keys correctas para products', () => {
    expect(queryKeys.products).toEqual(['products']);
    expect(queryKeys.product('abc')).toEqual(['products', 'abc']);
  });
});

describe('useBalance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockResolvedValue(mockBalanceResponse);
  });

  it('debe retornar el balance desde la API', async () => {
    const { result } = renderHook(() => useBalance(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiGet).toHaveBeenCalledWith('/api/balance');
    expect(result.current.data).toEqual(mockBalanceResponse.balance);
  });

  it('debe manejar errores de la API', async () => {
    mockApiGet.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useBalance(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useResumenGlobal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockResolvedValue(mockBalanceResponse);
  });

  it('debe retornar el resumen global desde la API', async () => {
    const { result } = renderHook(() => useResumenGlobal(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBalanceResponse.resumen);
  });
});

describe('useHistorial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockResolvedValue(mockHistorialResponse);
  });

  it('debe retornar el historial desde la API', async () => {
    const { result } = renderHook(() => useHistorial(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiGet).toHaveBeenCalledWith('/api/historial');
    expect(result.current.data).toEqual(mockHistorialResponse.movimientos);
  });

  it('debe aplicar filtros en la URL', async () => {
    const { result } = renderHook(
      () => useHistorial({ productoId: 'TC-001', tipo: 'ENTRADA' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiGet).toHaveBeenCalledWith('/api/historial?productoId=TC-001&tipo=ENTRADA');
  });
});

describe('useOrdenes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockResolvedValue(mockOrdenesResponse);
  });

  it('debe retornar las órdenes desde la API', async () => {
    const { result } = renderHook(() => useOrdenes(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiGet).toHaveBeenCalledWith('/api/ordenes');
    expect(result.current.data).toEqual(mockOrdenesResponse.ordenes);
  });

  it('debe aplicar filtros de estatus', async () => {
    const { result } = renderHook(
      () => useOrdenes({ estatus: 'PENDIENTE' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiGet).toHaveBeenCalledWith('/api/ordenes?estatus=PENDIENTE');
  });
});

describe('useCrearOrden', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiPost.mockResolvedValue({ id: 'OC-NEW-001' });
  });

  it('debe crear una orden via API', async () => {
    const { result } = renderHook(() => useCrearOrden(), { wrapper: createWrapper() });

    const ordenData = { productoId: 'TC-001', cantidad: 100, userId: 1, area: 'Almacén' };

    await result.current.mutateAsync(ordenData);

    expect(mockApiPost).toHaveBeenCalledWith('/api/ordenes', ordenData);
  });
});

describe('useActualizarEstatusOrden', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiPut.mockResolvedValue({});
  });

  it('debe actualizar el estatus via API', async () => {
    const { result } = renderHook(() => useActualizarEstatusOrden(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 'OC-001', estatus: 'COMPLETADA' });

    expect(mockApiPut).toHaveBeenCalledWith('/api/ordenes/OC-001', { estatus: 'COMPLETADA' });
  });
});

describe('useProductos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockResolvedValue(mockProductos);
  });

  it('debe retornar los productos desde la API', async () => {
    const { result } = renderHook(() => useProductos(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiGet).toHaveBeenCalledWith('/api/productos');
    expect(result.current.data).toEqual(mockProductos);
  });

  it('debe filtrar por categoría', async () => {
    const { result } = renderHook(
      () => useProductos({ categoria: 'tarjeta' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiGet).toHaveBeenCalledWith('/api/productos?categoria=tarjeta');
  });

  it('debe filtrar por lowStock en cliente', async () => {
    const { result } = renderHook(
      () => useProductos({ lowStock: true }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // TC-002 tiene stock 30 y stockMinimo 50, así que está bajo
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].id).toBe('TC-002');
  });
});

describe('useProducto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockResolvedValue(mockProductos[0]);
  });

  it('debe retornar un producto por ID', async () => {
    const { result } = renderHook(() => useProducto('TC-001'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiGet).toHaveBeenCalledWith('/api/productos/TC-001');
    expect(result.current.data?.id).toBe('TC-001');
  });

  it('debe estar deshabilitado si no hay ID', () => {
    const { result } = renderHook(() => useProducto(''), { wrapper: createWrapper() });

    expect(result.current.isFetching).toBe(false);
  });
});

describe('useProductosStockBajo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockResolvedValue(mockProductos);
  });

  it('debe retornar solo productos con stock bajo', async () => {
    const { result } = renderHook(() => useProductosStockBajo(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].id).toBe('TC-002');
  });
});

describe('useCrearProducto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiPost.mockResolvedValue({ id: 'TC-NEW' });
  });

  it('debe crear un producto via API', async () => {
    const { result } = renderHook(() => useCrearProducto(), { wrapper: createWrapper() });

    const productoData = {
      id: 'TC-NEW',
      nombre: 'Nuevo Producto',
      categoria: 'tarjeta',
      areas: ['almacen'],
      stockMinimo: 100,
      precio: 25,
    };

    await result.current.mutateAsync(productoData);

    expect(mockApiPost).toHaveBeenCalledWith('/api/productos', productoData);
  });
});

describe('useActualizarProducto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiPut.mockResolvedValue({});
  });

  it('debe actualizar un producto via API', async () => {
    const { result } = renderHook(() => useActualizarProducto(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 'TC-001', data: { nombre: 'Nuevo Nombre' } });

    expect(mockApiPut).toHaveBeenCalledWith('/api/productos/TC-001', { nombre: 'Nuevo Nombre' });
  });
});

describe('useEliminarProducto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiDelete.mockResolvedValue({});
  });

  it('debe eliminar un producto via API', async () => {
    const { result } = renderHook(() => useEliminarProducto(), { wrapper: createWrapper() });

    await result.current.mutateAsync('TC-001');

    expect(mockApiDelete).toHaveBeenCalledWith('/api/productos/TC-001');
  });
});

// =============================================================================
// USER QUERIES (still using store)
// =============================================================================

describe('useUsuarios', () => {
  it('debe retornar todos los usuarios desde el store', async () => {
    const { result } = renderHook(() => useUsuarios(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(3);
  });

  it('debe filtrar usuarios por rol', async () => {
    const { result } = renderHook(
      () => useUsuarios({ rol: 'admin' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].rol).toBe('admin');
  });

  it('debe filtrar usuarios por activo', async () => {
    const { result } = renderHook(
      () => useUsuarios({ activo: false }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].activo).toBe(false);
  });
});

describe('useUsuario', () => {
  it('debe retornar un usuario por ID', async () => {
    const { result } = renderHook(() => useUsuario(1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.id).toBe(1);
    expect(result.current.data?.nombre).toBe('Admin');
  });

  it('debe retornar null si el usuario no existe', async () => {
    const { result } = renderHook(() => useUsuario(999), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });
});

describe('useCrearUsuario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe crear un usuario via store', async () => {
    const { result } = renderHook(() => useCrearUsuario(), { wrapper: createWrapper() });

    const usuarioData = {
      nombre: 'Nuevo Usuario',
      username: 'nuevo',
      email: 'nuevo@test.com',
      rol: 'usuario',
      area: 'Logística',
    };

    const id = await result.current.mutateAsync(usuarioData);

    expect(mockUserState.crearUsuario).toHaveBeenCalledWith(usuarioData);
    expect(id).toBe(4);
  });
});
