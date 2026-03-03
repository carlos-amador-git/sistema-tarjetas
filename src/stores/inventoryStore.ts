/**
 * Store de Inventario - Zustand
 *
 * Estado global para gestión de inventario con persistencia en localStorage.
 * Conecta los módulos: Capturas → Balance → Dashboard
 *                      Órdenes → Historial
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  BALANCE_DATA,
  HISTORIAL,
  ORDENES,
  PRODUCTOS,
  type BalanceProducto,
  type MovimientoHistorial,
  type OrdenCompra,
  type Producto,
} from '@/data/mockData';

// =============================================================================
// TIPOS
// =============================================================================

export interface CapturaAlmacen {
  productoId: string;
  bovedaTrabajo: number;
  bovedaPrincipal: number;
  fecha: string;
  usuario: string;
}

export interface CapturaLogistica {
  productoId: string;
  destinoId: string;
  colocacion: number;
  normal: number;
  fecha: string;
  usuario: string;
}

export interface CapturaSucursal {
  productoId: string;
  sucursalId: string;
  colocacion: number;
  stock: number;
  fecha: string;
  usuario: string;
}

export interface InventoryState {
  // Datos de balance por producto
  balance: Record<string, BalanceProducto>;

  // Historial de movimientos
  historial: MovimientoHistorial[];

  // Órdenes de compra
  ordenes: OrdenCompra[];

  // Productos
  productos: Producto[];

  // Contador para IDs
  nextHistorialId: number;
  nextOrdenId: number;

  // Timestamp de última actualización
  lastUpdated: string;
}

export interface InventoryActions {
  // Capturas
  registrarCapturaAlmacen: (captura: CapturaAlmacen) => void;
  registrarCapturaLogistica: (captura: CapturaLogistica) => void;
  registrarCapturaSucursal: (captura: CapturaSucursal) => void;

  // Órdenes
  crearOrden: (orden: Omit<OrdenCompra, 'id'>) => string;
  actualizarEstatusOrden: (ordenId: string, nuevoEstatus: OrdenCompra['estatus']) => void;

  // Historial
  agregarMovimiento: (movimiento: Omit<MovimientoHistorial, 'id'>) => void;

  // Utilidades
  resetToDefaults: () => void;
  getResumenGlobal: () => {
    totalInventario: number;
    enAlmacen: number;
    enLogistica: number;
    enSucursales: number;
    enProceso: number;
  };
}

type InventoryStore = InventoryState & InventoryActions;

// =============================================================================
// ESTADO INICIAL (desde mockData)
// =============================================================================

const getInitialState = (): InventoryState => ({
  balance: { ...BALANCE_DATA },
  historial: [...HISTORIAL],
  ordenes: [...ORDENES],
  productos: [...PRODUCTOS],
  nextHistorialId: HISTORIAL.length + 1,
  nextOrdenId: 6, // OC-2026-006
  lastUpdated: new Date().toISOString(),
});

// =============================================================================
// STORE
// =============================================================================

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      // =========================================================================
      // CAPTURAS
      // =========================================================================

      registrarCapturaAlmacen: (captura) => {
        set((state) => {
          const { productoId, bovedaTrabajo, bovedaPrincipal, fecha, usuario } = captura;

          // Obtener balance actual o crear uno nuevo
          const balanceActual = state.balance[productoId];
          if (!balanceActual) {
            console.warn(`Producto ${productoId} no encontrado en balance`);
            return state;
          }

          // Calcular diferencia para historial
          const diffTrabajo = bovedaTrabajo - balanceActual.almacen.bovedaTrabajo;
          const diffPrincipal = bovedaPrincipal - balanceActual.almacen.bovedaPrincipal;
          const totalDiff = diffTrabajo + diffPrincipal;

          // Actualizar balance
          const nuevoBalance = {
            ...state.balance,
            [productoId]: {
              ...balanceActual,
              almacen: {
                bovedaTrabajo,
                bovedaPrincipal,
              },
            },
          };

          // Crear movimiento en historial si hay diferencia
          const nuevoHistorial = totalDiff !== 0
            ? [
              {
                id: state.nextHistorialId,
                fecha,
                tipo: (totalDiff > 0 ? 'ENTRADA' : 'SALIDA') as MovimientoHistorial['tipo'],
                producto: balanceActual.nombre,
                productoId,
                cantidad: Math.abs(totalDiff),
                usuario,
                area: 'Almacén Central',
                observacion: `Captura de inventario almacén`,
                documento: `CAP-ALM-${Date.now()}`,
              },
              ...state.historial,
            ]
            : state.historial;

          return {
            balance: nuevoBalance,
            historial: nuevoHistorial,
            nextHistorialId: totalDiff !== 0 ? state.nextHistorialId + 1 : state.nextHistorialId,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      registrarCapturaLogistica: (captura) => {
        set((state) => {
          const { productoId, colocacion, normal, fecha, usuario, destinoId } = captura;

          const balanceActual = state.balance[productoId];
          if (!balanceActual) {
            console.warn(`Producto ${productoId} no encontrado en balance`);
            return state;
          }

          const diffColocacion = colocacion - balanceActual.logistica.colocacion;
          const diffNormal = normal - balanceActual.logistica.normal;
          const totalDiff = diffColocacion + diffNormal;

          const nuevoBalance = {
            ...state.balance,
            [productoId]: {
              ...balanceActual,
              logistica: {
                ...balanceActual.logistica,
                colocacion,
                normal,
              },
            },
          };

          const nuevoHistorial = totalDiff !== 0
            ? [
              {
                id: state.nextHistorialId,
                fecha,
                tipo: (totalDiff > 0 ? 'ENTRADA' : 'SALIDA') as MovimientoHistorial['tipo'],
                producto: balanceActual.nombre,
                productoId,
                cantidad: Math.abs(totalDiff),
                usuario,
                area: 'Logística',
                observacion: `Captura logística - Destino: ${destinoId}`,
                documento: `CAP-LOG-${Date.now()}`,
              },
              ...state.historial,
            ]
            : state.historial;

          return {
            balance: nuevoBalance,
            historial: nuevoHistorial,
            nextHistorialId: totalDiff !== 0 ? state.nextHistorialId + 1 : state.nextHistorialId,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      registrarCapturaSucursal: (captura) => {
        set((state) => {
          const { productoId, colocacion, stock, fecha, usuario, sucursalId } = captura;

          const balanceActual = state.balance[productoId];
          if (!balanceActual) {
            console.warn(`Producto ${productoId} no encontrado en balance`);
            return state;
          }

          const diffColocacion = colocacion - balanceActual.sucursales.colocacion;
          const diffStock = stock - balanceActual.sucursales.stock;
          const totalDiff = diffColocacion + diffStock;

          const nuevoBalance = {
            ...state.balance,
            [productoId]: {
              ...balanceActual,
              sucursales: {
                colocacion,
                stock,
              },
            },
          };

          const nuevoHistorial = totalDiff !== 0
            ? [
              {
                id: state.nextHistorialId,
                fecha,
                tipo: (totalDiff > 0 ? 'ENTRADA' : 'SALIDA') as MovimientoHistorial['tipo'],
                producto: balanceActual.nombre,
                productoId,
                cantidad: Math.abs(totalDiff),
                usuario,
                area: 'Sucursales',
                observacion: `Captura sucursal: ${sucursalId}`,
                documento: `CAP-SUC-${Date.now()}`,
              },
              ...state.historial,
            ]
            : state.historial;

          return {
            balance: nuevoBalance,
            historial: nuevoHistorial,
            nextHistorialId: totalDiff !== 0 ? state.nextHistorialId + 1 : state.nextHistorialId,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      // =========================================================================
      // ÓRDENES
      // =========================================================================

      crearOrden: (ordenData) => {
        const state = get();
        const nuevoId = `OC-2026-${String(state.nextOrdenId).padStart(3, '0')}`;

        const nuevaOrden: OrdenCompra = {
          ...ordenData,
          id: nuevoId,
        };

        set({
          ordenes: [nuevaOrden, ...state.ordenes],
          nextOrdenId: state.nextOrdenId + 1,
          lastUpdated: new Date().toISOString(),
        });

        return nuevoId;
      },

      actualizarEstatusOrden: (ordenId, nuevoEstatus) => {
        set((state) => {
          const ordenIndex = state.ordenes.findIndex((o) => o.id === ordenId);
          if (ordenIndex === -1) return state;

          const orden = state.ordenes[ordenIndex];
          const ordenesActualizadas = [...state.ordenes];
          ordenesActualizadas[ordenIndex] = { ...orden, estatus: nuevoEstatus };

          // Si la orden se completa, agregar movimiento al historial
          let nuevoHistorial = state.historial;
          let nextId = state.nextHistorialId;

          if (nuevoEstatus === 'COMPLETADA') {
            nuevoHistorial = [
              {
                id: nextId,
                fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
                tipo: 'ENTRADA' as const,
                producto: orden.producto,
                productoId: orden.productoId,
                cantidad: orden.cantidad,
                usuario: 'sistema',
                area: orden.area,
                observacion: `Orden completada: ${ordenId}`,
                documento: ordenId,
              },
              ...state.historial,
            ];
            nextId += 1;
          }

          return {
            ordenes: ordenesActualizadas,
            historial: nuevoHistorial,
            nextHistorialId: nextId,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      // =========================================================================
      // HISTORIAL
      // =========================================================================

      agregarMovimiento: (movimiento) => {
        set((state) => ({
          historial: [
            { ...movimiento, id: state.nextHistorialId },
            ...state.historial,
          ],
          nextHistorialId: state.nextHistorialId + 1,
          lastUpdated: new Date().toISOString(),
        }));
      },

      // =========================================================================
      // UTILIDADES
      // =========================================================================

      resetToDefaults: () => {
        set(getInitialState());
      },

      getResumenGlobal: () => {
        const state = get();
        let enAlmacen = 0;
        let enLogistica = 0;
        let enSucursales = 0;
        let enProceso = 0;

        Object.values(state.balance).forEach((data) => {
          enAlmacen += data.almacen.bovedaTrabajo + data.almacen.bovedaPrincipal;
          enLogistica += data.logistica.colocacion + data.logistica.normal + data.logistica.devoluciones;
          enSucursales += data.sucursales.colocacion + data.sucursales.stock;
          enProceso += data.enProceso.cantidad;
        });

        return {
          totalInventario: enAlmacen + enLogistica + enSucursales,
          enAlmacen,
          enLogistica,
          enSucursales,
          enProceso,
        };
      },
    }),
    {
      name: 'cardsystem-inventory-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        balance: state.balance,
        historial: state.historial,
        ordenes: state.ordenes,
        nextHistorialId: state.nextHistorialId,
        nextOrdenId: state.nextOrdenId,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// =============================================================================
// SELECTORES
// =============================================================================

export const selectBalance = (state: InventoryStore) => state.balance;
export const selectHistorial = (state: InventoryStore) => state.historial;
export const selectOrdenes = (state: InventoryStore) => state.ordenes;
export const selectResumenGlobal = (state: InventoryStore) => state.getResumenGlobal();

// =============================================================================
// HOOKS DE CONVENIENCIA
// =============================================================================

export const useBalance = () => useInventoryStore((state) => state.balance);
export const useHistorial = () => useInventoryStore((state) => state.historial);
export const useOrdenes = () => useInventoryStore((state) => state.ordenes);
export const useResumenGlobal = () => useInventoryStore((state) => state.getResumenGlobal());
