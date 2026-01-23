/**
 * Store de Productos - Zustand
 *
 * Estado global para gestión de productos con persistencia en localStorage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PRODUCTOS, type Producto } from '@/data/mockData';

// Re-export para uso externo
export type { Producto };
export type ProductoStore = Producto;

// =============================================================================
// TIPOS
// =============================================================================

export interface NuevoProducto {
  nombre: string;
  categoria: Producto['categoria'];
  areas: Producto['areas'];
  stock: number;
  stockMinimo: number;
  precio: number;
}

export interface ProductState {
  productos: Producto[];
  nextProductId: number;
  lastUpdated: string;
}

export interface ProductActions {
  crearProducto: (producto: NuevoProducto) => string;
  actualizarProducto: (id: string, datos: Partial<Omit<Producto, 'id'>>) => void;
  toggleActivoProducto: (id: string) => void;
  eliminarProducto: (id: string) => void;
  ajustarStock: (id: string, cantidad: number, tipo: 'add' | 'subtract' | 'set') => void;
  resetToDefaults: () => void;
}

type ProductStore = ProductState & ProductActions;

// =============================================================================
// ESTADO INICIAL
// =============================================================================

const getInitialState = (): ProductState => ({
  productos: [...PRODUCTOS],
  nextProductId: 11, // Los IDs actuales van hasta 10 (ET-001, SO-001, etc.)
  lastUpdated: new Date().toISOString(),
});

// =============================================================================
// HELPER PARA GENERAR ID
// =============================================================================

const generateProductId = (categoria: Producto['categoria'], nextId: number): string => {
  const prefixes: Record<Producto['categoria'], string> = {
    tarjeta: 'TC',
    kit: 'WK',
    etiqueta: 'ET',
    sobre: 'SO',
    otro: 'OT',
  };
  const prefix = prefixes[categoria] || 'PR';
  return `${prefix}-${String(nextId).padStart(3, '0')}`;
};

// =============================================================================
// STORE
// =============================================================================

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      crearProducto: (nuevoProducto) => {
        const state = get();
        const nuevoId = generateProductId(nuevoProducto.categoria, state.nextProductId);

        const producto: Producto = {
          id: nuevoId,
          ...nuevoProducto,
          activo: true,
        };

        set({
          productos: [producto, ...state.productos],
          nextProductId: state.nextProductId + 1,
          lastUpdated: new Date().toISOString(),
        });

        return nuevoId;
      },

      actualizarProducto: (id, datos) => {
        set((state) => {
          const index = state.productos.findIndex((p) => p.id === id);
          if (index === -1) return state;

          const productosActualizados = [...state.productos];
          productosActualizados[index] = {
            ...productosActualizados[index],
            ...datos,
          };

          return {
            productos: productosActualizados,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      toggleActivoProducto: (id) => {
        set((state) => {
          const index = state.productos.findIndex((p) => p.id === id);
          if (index === -1) return state;

          const productosActualizados = [...state.productos];
          productosActualizados[index] = {
            ...productosActualizados[index],
            activo: !productosActualizados[index].activo,
          };

          return {
            productos: productosActualizados,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      eliminarProducto: (id) => {
        set((state) => ({
          productos: state.productos.filter((p) => p.id !== id),
          lastUpdated: new Date().toISOString(),
        }));
      },

      ajustarStock: (id, cantidad, tipo) => {
        set((state) => {
          const index = state.productos.findIndex((p) => p.id === id);
          if (index === -1) return state;

          const productosActualizados = [...state.productos];
          const producto = productosActualizados[index];

          let nuevoStock: number;
          switch (tipo) {
            case 'add':
              nuevoStock = producto.stock + cantidad;
              break;
            case 'subtract':
              nuevoStock = Math.max(0, producto.stock - cantidad);
              break;
            case 'set':
              nuevoStock = Math.max(0, cantidad);
              break;
            default:
              nuevoStock = producto.stock;
          }

          productosActualizados[index] = {
            ...producto,
            stock: nuevoStock,
          };

          return {
            productos: productosActualizados,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      resetToDefaults: () => {
        set(getInitialState());
      },
    }),
    {
      name: 'cardsystem-products',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        productos: state.productos,
        nextProductId: state.nextProductId,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// =============================================================================
// HOOKS DE CONVENIENCIA
// =============================================================================

export const useProductos = () => useProductStore((state) => state.productos);
