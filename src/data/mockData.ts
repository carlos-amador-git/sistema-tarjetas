/**
 * Datos Mock Centralizados
 *
 * Este archivo contiene todos los datos ficticios del sistema centralizados
 * para garantizar consistencia entre módulos.
 *
 * IMPORTANTE: Todos los totales deben cuadrar matemáticamente.
 *
 * En producción, estos datos serían reemplazados por llamadas a APIs.
 */

// =============================================================================
// TIPOS
// =============================================================================

export interface Producto {
  id: string;
  nombre: string;
  categoria: 'tarjeta' | 'kit' | 'etiqueta' | 'sobre' | 'otro';
  areas: ('almacen' | 'logistica' | 'sucursales')[];
  stock: number;
  stockMinimo: number;
  precio: number;
  activo: boolean;
}

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  email: string;
  rol: string;
  area: string;
  activo: boolean;
  ultimoAcceso: string;
}

export interface BalanceProducto {
  nombre: string;
  almacen: {
    bovedaTrabajo: number;
    bovedaPrincipal: number;
  };
  enProceso: {
    cantidad: number;
    ordenesActivas: number;
  };
  logistica: {
    colocacion: number;
    normal: number;
    devoluciones: number;
  };
  sucursales: {
    colocacion: number;
    stock: number;
  };
}

export interface MovimientoHistorial {
  id: number;
  fecha: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  producto: string;
  productoId: string;
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

export interface ForecastProducto {
  id: string;
  nombre: string;
  actual: number;
  forecast: number[];
  tendencia: 'up' | 'down';
  alertas: number;
}

export interface Alerta {
  producto: string;
  mensaje: string;
  tipo: 'warning' | 'info' | 'error' | 'success';
}

// =============================================================================
// CATÁLOGO DE PRODUCTOS
// =============================================================================

export const PRODUCTOS: Producto[] = [
  {
    id: 'TC-001',
    nombre: 'Tarjeta Clásica - Titular',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
    stock: 70729,
    stockMinimo: 10000,
    precio: 25.00,
    activo: true,
  },
  {
    id: 'TC-002',
    nombre: 'Tarjeta Clásica - Adicional',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
    stock: 40390,
    stockMinimo: 5000,
    precio: 22.00,
    activo: true,
  },
  {
    id: 'TG-001',
    nombre: 'Tarjeta Gold - Titular',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
    stock: 50578,
    stockMinimo: 8000,
    precio: 35.00,
    activo: true,
  },
  {
    id: 'TP-001',
    nombre: 'Tarjeta Platinum - Titular',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
    stock: 20000,
    stockMinimo: 4000,
    precio: 50.00,
    activo: true,
  },
  {
    id: 'TD-001',
    nombre: 'Tarjeta Débito - Estándar',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
    stock: 83000,
    stockMinimo: 8000,
    precio: 15.00,
    activo: true,
  },
  {
    id: 'TD-002',
    nombre: 'Tarjeta Débito - Premium',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
    stock: 29500,
    stockMinimo: 4000,
    precio: 22.00,
    activo: true,
  },
  {
    id: 'WK-001',
    nombre: 'Welcome Kit Estándar',
    categoria: 'kit',
    areas: ['logistica', 'sucursales'],
    stock: 8500,
    stockMinimo: 2000,
    precio: 40.00,
    activo: true,
  },
  {
    id: 'WK-002',
    nombre: 'Welcome Kit Premium',
    categoria: 'kit',
    areas: ['logistica'],
    stock: 3200,
    stockMinimo: 1000,
    precio: 65.00,
    activo: true,
  },
  {
    id: 'ET-001',
    nombre: 'Etiquetas de Seguridad',
    categoria: 'etiqueta',
    areas: ['almacen'],
    stock: 155000,
    stockMinimo: 50000,
    precio: 0.50,
    activo: true,
  },
  {
    id: 'SO-001',
    nombre: 'Sobres de Envío Seguro',
    categoria: 'sobre',
    areas: ['logistica'],
    stock: 92000,
    stockMinimo: 30000,
    precio: 1.20,
    activo: true,
  },
];

// Funciones de utilidad para filtrar productos
export const getProductosAlmacen = () => PRODUCTOS.filter((p) => p.areas.includes('almacen'));
export const getProductosLogistica = () => PRODUCTOS.filter((p) => p.areas.includes('logistica'));
export const getProductosSucursales = () => PRODUCTOS.filter((p) => p.areas.includes('sucursales'));
export const getProductoById = (id: string) => PRODUCTOS.find((p) => p.id === id);

// =============================================================================
// USUARIOS
// =============================================================================

export const USUARIOS: Usuario[] = [
  {
    id: 1,
    nombre: 'Administrador Sistema',
    username: 'admin',
    email: 'admin@cardsystem.com',
    rol: 'Administrador',
    area: 'Sistemas',
    activo: true,
    ultimoAcceso: '2026-01-21 10:30',
  },
  {
    id: 2,
    nombre: 'Juan Pérez',
    username: 'jperez',
    email: 'jperez@cardsystem.com',
    rol: 'Almacén Central',
    area: 'Almacén',
    activo: true,
    ultimoAcceso: '2026-01-21 09:15',
  },
  {
    id: 3,
    nombre: 'María Gómez',
    username: 'mgomez',
    email: 'mgomez@cardsystem.com',
    rol: 'Logística',
    area: 'Distribución',
    activo: true,
    ultimoAcceso: '2026-01-21 08:45',
  },
  {
    id: 4,
    nombre: 'Carlos Ruiz',
    username: 'cruiz',
    email: 'cruiz@cardsystem.com',
    rol: 'Sucursales',
    area: 'Módulos',
    activo: true,
    ultimoAcceso: '2026-01-21 08:00',
  },
  {
    id: 5,
    nombre: 'Ana Torres',
    username: 'atorres',
    email: 'atorres@cardsystem.com',
    rol: 'Consulta',
    area: 'Auditoría',
    activo: true,
    ultimoAcceso: '2026-01-20 14:20',
  },
  {
    id: 6,
    nombre: 'Luis Hernández',
    username: 'lhernandez',
    email: 'lhernandez@cardsystem.com',
    rol: 'Logística',
    area: 'Transporte',
    activo: false,
    ultimoAcceso: '2025-12-15 10:00',
  },
  {
    id: 7,
    nombre: 'Sofía Martínez',
    username: 'smartinez',
    email: 'smartinez@cardsystem.com',
    rol: 'Almacén Central',
    area: 'Inventarios',
    activo: true,
    ultimoAcceso: '2026-01-21 07:30',
  },
  {
    id: 8,
    nombre: 'Roberto Díaz',
    username: 'rdiaz',
    email: 'rdiaz@cardsystem.com',
    rol: 'Sucursales',
    area: 'Zona Norte',
    activo: true,
    ultimoAcceso: '2026-01-20 16:45',
  },
  {
    id: 9,
    nombre: 'Patricia Sánchez',
    username: 'psanchez',
    email: 'psanchez@cardsystem.com',
    rol: 'Logística',
    area: 'Zona Sur',
    activo: true,
    ultimoAcceso: '2026-01-21 09:00',
  },
  {
    id: 10,
    nombre: 'Fernando López',
    username: 'flopez',
    email: 'flopez@cardsystem.com',
    rol: 'Sucursales',
    area: 'Zona Centro',
    activo: true,
    ultimoAcceso: '2026-01-21 08:15',
  },
];

// =============================================================================
// BALANCE DE INVENTARIO (CONSISTENTE CON HISTORIAL)
// =============================================================================

export const BALANCE_DATA: Record<string, BalanceProducto> = {
  'TC-001': {
    nombre: 'Tarjeta Clásica - Titular',
    almacen: { bovedaTrabajo: 15207, bovedaPrincipal: 26400 },
    enProceso: { cantidad: 50000, ordenesActivas: 1 },
    logistica: { colocacion: 11464, normal: 5283, devoluciones: 0 },
    sucursales: { colocacion: 10775, stock: 1600 },
  },
  'TC-002': {
    nombre: 'Tarjeta Clásica - Adicional',
    almacen: { bovedaTrabajo: 8362, bovedaPrincipal: 12500 },
    enProceso: { cantidad: 25000, ordenesActivas: 1 },
    logistica: { colocacion: 4424, normal: 5180, devoluciones: 0 },
    sucursales: { colocacion: 4424, stock: 500 },
  },
  'TG-001': {
    nombre: 'Tarjeta Gold - Titular',
    almacen: { bovedaTrabajo: 12570, bovedaPrincipal: 14880 },
    enProceso: { cantidad: 30000, ordenesActivas: 1 },
    logistica: { colocacion: 7608, normal: 7112, devoluciones: 0 },
    sucursales: { colocacion: 7608, stock: 800 },
  },
  'TP-001': {
    nombre: 'Tarjeta Platinum - Titular',
    almacen: { bovedaTrabajo: 5000, bovedaPrincipal: 7500 },
    enProceso: { cantidad: 10000, ordenesActivas: 0 },
    logistica: { colocacion: 3000, normal: 2000, devoluciones: 0 },
    sucursales: { colocacion: 2000, stock: 500 },
  },
  'TD-001': {
    nombre: 'Tarjeta Débito - Estándar',
    almacen: { bovedaTrabajo: 20000, bovedaPrincipal: 25000 },
    enProceso: { cantidad: 60000, ordenesActivas: 2 },
    logistica: { colocacion: 12000, normal: 8000, devoluciones: 0 },
    sucursales: { colocacion: 15000, stock: 3000 },
  },
  'TD-002': {
    nombre: 'Tarjeta Débito - Premium',
    almacen: { bovedaTrabajo: 8000, bovedaPrincipal: 10500 },
    enProceso: { cantidad: 15000, ordenesActivas: 1 },
    logistica: { colocacion: 4000, normal: 3000, devoluciones: 0 },
    sucursales: { colocacion: 3500, stock: 500 },
  },
  'WK-001': {
    nombre: 'Welcome Kit Estándar',
    almacen: { bovedaTrabajo: 0, bovedaPrincipal: 0 },
    enProceso: { cantidad: 5000, ordenesActivas: 1 },
    logistica: { colocacion: 2000, normal: 3000, devoluciones: 0 },
    sucursales: { colocacion: 3000, stock: 500 },
  },
  'WK-002': {
    nombre: 'Welcome Kit Premium',
    almacen: { bovedaTrabajo: 0, bovedaPrincipal: 0 },
    enProceso: { cantidad: 2000, ordenesActivas: 0 },
    logistica: { colocacion: 1000, normal: 1200, devoluciones: 0 },
    sucursales: { colocacion: 800, stock: 200 },
  },
  'ET-001': {
    nombre: 'Etiquetas de Seguridad',
    almacen: { bovedaTrabajo: 50000, bovedaPrincipal: 105000 },
    enProceso: { cantidad: 200000, ordenesActivas: 1 },
    logistica: { colocacion: 0, normal: 0, devoluciones: 0 },
    sucursales: { colocacion: 0, stock: 0 },
  },
  'SO-001': {
    nombre: 'Sobres de Envío Seguro',
    almacen: { bovedaTrabajo: 0, bovedaPrincipal: 0 },
    enProceso: { cantidad: 50000, ordenesActivas: 0 },
    logistica: { colocacion: 40000, normal: 52000, devoluciones: 0 },
    sucursales: { colocacion: 0, stock: 0 },
  },
};

// Función para calcular totales de balance
export function calcularTotalesBalance(productoId: string) {
  const data = BALANCE_DATA[productoId];
  if (!data) return null;

  const almacenTotal = data.almacen.bovedaTrabajo + data.almacen.bovedaPrincipal;
  const logisticaTotal = data.logistica.colocacion + data.logistica.normal + data.logistica.devoluciones;
  const sucursalesTotal = data.sucursales.colocacion + data.sucursales.stock;
  const totalGeneral = almacenTotal + data.enProceso.cantidad + logisticaTotal + sucursalesTotal;

  return {
    almacenTotal,
    logisticaTotal,
    sucursalesTotal,
    enProceso: data.enProceso.cantidad,
    totalGeneral,
  };
}

// Global summary calculation
export function calcularResumenGlobal() {
  let enAlmacen = 0;
  let enLogistica = 0;
  let enSucursales = 0;
  let enProceso = 0;

  Object.values(BALANCE_DATA).forEach((data) => {
    enAlmacen += data.almacen.bovedaTrabajo + data.almacen.bovedaPrincipal;
    enLogistica += data.logistica.colocacion + data.logistica.normal + data.logistica.devoluciones;
    enSucursales += data.sucursales.colocacion + data.sucursales.stock;
    enProceso += data.enProceso.cantidad;
  });

  const totalInventario = enAlmacen + enLogistica + enSucursales;

  return {
    totalInventario,
    enAlmacen,
    enLogistica,
    enSucursales,
    enProceso,
  };
}

// =============================================================================
// HISTORIAL (NARRATIVA CONSISTENTE - Enero 2026)
// =============================================================================

export const HISTORIAL: MovimientoHistorial[] = [
  // Día 21 - HOY
  {
    id: 1,
    fecha: '2026-01-21 09:30:00',
    tipo: 'ENTRADA',
    producto: 'Tarjeta Clásica - Titular',
    productoId: 'TC-001',
    cantidad: 5000,
    usuario: 'jperez',
    area: 'Almacén Central',
    observacion: 'Recepción de orden OC-2026-008 completada',
    documento: 'OC-2026-008',
  },
  {
    id: 2,
    fecha: '2026-01-21 08:45:00',
    tipo: 'SALIDA',
    producto: 'Welcome Kit Estándar',
    productoId: 'WK-001',
    cantidad: 500,
    usuario: 'mgomez',
    area: 'Logística',
    observacion: 'Envío a Zona Norte - Sucursales',
    documento: 'ENV-2026-050',
  },
  // Día 20
  {
    id: 3,
    fecha: '2026-01-20 16:45:00',
    tipo: 'ENTRADA',
    producto: 'Tarjeta Débito - Estándar',
    productoId: 'TD-001',
    cantidad: 8000,
    usuario: 'smartinez',
    area: 'Almacén Central',
    observacion: 'Recepción de orden OC-2026-007',
    documento: 'OC-2026-007',
  },
  {
    id: 4,
    fecha: '2026-01-20 14:20:00',
    tipo: 'SALIDA',
    producto: 'Tarjeta Gold - Titular',
    productoId: 'TG-001',
    cantidad: 1500,
    usuario: 'psanchez',
    area: 'Logística',
    observacion: 'Distribución Zona Sur',
    documento: 'ENV-2026-049',
  },
  {
    id: 5,
    fecha: '2026-01-20 11:30:00',
    tipo: 'ENTRADA',
    producto: 'Etiquetas de Seguridad',
    productoId: 'ET-001',
    cantidad: 50000,
    usuario: 'jperez',
    area: 'Almacén Central',
    observacion: 'Reposición mensual de etiquetas',
    documento: 'OC-2026-006',
  },
  // Día 19
  {
    id: 6,
    fecha: '2026-01-19 15:45:00',
    tipo: 'SALIDA',
    producto: 'Tarjeta Clásica - Adicional',
    productoId: 'TC-002',
    cantidad: 2000,
    usuario: 'cruiz',
    area: 'Sucursales',
    observacion: 'Distribución a Sucursal Centro',
    documento: 'DIS-2026-125',
  },
  {
    id: 7,
    fecha: '2026-01-19 10:15:00',
    tipo: 'ENTRADA',
    producto: 'Sobres de Envío Seguro',
    productoId: 'SO-001',
    cantidad: 10000,
    usuario: 'mgomez',
    area: 'Logística',
    observacion: 'Recepción de proveedor',
    documento: 'OC-2026-005',
  },
  // Día 18
  {
    id: 8,
    fecha: '2026-01-18 16:20:00',
    tipo: 'AJUSTE',
    producto: 'Welcome Kit Premium',
    productoId: 'WK-002',
    cantidad: -50,
    usuario: 'atorres',
    area: 'Auditoría',
    observacion: 'Ajuste por inventario físico - Material dañado',
    documento: 'AJU-2026-001',
  },
  {
    id: 9,
    fecha: '2026-01-18 09:00:00',
    tipo: 'ENTRADA',
    producto: 'Tarjeta Platinum - Titular',
    productoId: 'TP-001',
    cantidad: 2000,
    usuario: 'smartinez',
    area: 'Almacén Central',
    observacion: 'Llegada de tarjetas premium',
    documento: 'OC-2026-004',
  },
  // Día 17
  {
    id: 10,
    fecha: '2026-01-17 14:30:00',
    tipo: 'SALIDA',
    producto: 'Tarjeta Débito - Premium',
    productoId: 'TD-002',
    cantidad: 1000,
    usuario: 'flopez',
    area: 'Sucursales',
    observacion: 'Solicitud urgente Zona Centro',
    documento: 'DIS-2026-124',
  },
  {
    id: 11,
    fecha: '2026-01-17 11:45:00',
    tipo: 'ENTRADA',
    producto: 'Tarjeta Gold - Titular',
    productoId: 'TG-001',
    cantidad: 5000,
    usuario: 'jperez',
    area: 'Almacén Central',
    observacion: 'Stock mensual programado',
    documento: 'OC-2026-003',
  },
  // Día 16
  {
    id: 12,
    fecha: '2026-01-16 15:00:00',
    tipo: 'SALIDA',
    producto: 'Tarjeta Clásica - Titular',
    productoId: 'TC-001',
    cantidad: 3000,
    usuario: 'rdiaz',
    area: 'Sucursales',
    observacion: 'Distribución Zona Norte',
    documento: 'DIS-2026-123',
  },
  {
    id: 13,
    fecha: '2026-01-16 10:30:00',
    tipo: 'ENTRADA',
    producto: 'Welcome Kit Estándar',
    productoId: 'WK-001',
    cantidad: 1500,
    usuario: 'mgomez',
    area: 'Logística',
    observacion: 'Recepción de orden OC-2026-002',
    documento: 'OC-2026-002',
  },
  // Día 15
  {
    id: 14,
    fecha: '2026-01-15 16:45:00',
    tipo: 'SALIDA',
    producto: 'Etiquetas de Seguridad',
    productoId: 'ET-001',
    cantidad: 5000,
    usuario: 'smartinez',
    area: 'Almacén Central',
    observacion: 'Uso interno - Producción',
    documento: 'USO-2026-001',
  },
  {
    id: 15,
    fecha: '2026-01-15 10:00:00',
    tipo: 'ENTRADA',
    producto: 'Tarjeta Clásica - Adicional',
    productoId: 'TC-002',
    cantidad: 6000,
    usuario: 'jperez',
    area: 'Almacén Central',
    observacion: 'Recepción de orden OC-2026-001',
    documento: 'OC-2026-001',
  },
];

// Calcular estadísticas historial
export function calcularEstadisticasHistorial() {
  const entradas = HISTORIAL.filter((h) => h.tipo === 'ENTRADA').reduce((sum, h) => sum + h.cantidad, 0);
  const salidas = HISTORIAL.filter((h) => h.tipo === 'SALIDA').reduce((sum, h) => sum + h.cantidad, 0);
  const movimientos = HISTORIAL.length;

  return { entradas, salidas, movimientos };
}

// =============================================================================
// ÓRDENES (CONSISTENTES CON HISTORIAL)
// =============================================================================

export const ORDENES: OrdenCompra[] = [
  {
    id: 'OC-2026-009',
    fecha: '2026-01-21',
    productoId: 'TD-001',
    producto: 'Tarjeta Débito - Estándar',
    cantidad: 10000,
    solicitante: 'Juan Pérez',
    area: 'Almacén Central',
    estatus: 'PENDIENTE',
    costoTotal: 150000,
  },
  {
    id: 'OC-2026-008',
    fecha: '2026-01-20',
    productoId: 'TC-001',
    producto: 'Tarjeta Clásica - Titular',
    cantidad: 5000,
    solicitante: 'Juan Pérez',
    area: 'Almacén Central',
    estatus: 'COMPLETADA',
    costoTotal: 125000,
  },
  {
    id: 'OC-2026-007',
    fecha: '2026-01-19',
    productoId: 'TD-001',
    producto: 'Tarjeta Débito - Estándar',
    cantidad: 8000,
    solicitante: 'Sofía Martínez',
    area: 'Almacén Central',
    estatus: 'COMPLETADA',
    costoTotal: 120000,
  },
  {
    id: 'OC-2026-006',
    fecha: '2026-01-19',
    productoId: 'ET-001',
    producto: 'Etiquetas de Seguridad',
    cantidad: 50000,
    solicitante: 'Juan Pérez',
    area: 'Almacén Central',
    estatus: 'COMPLETADA',
    costoTotal: 25000,
  },
  {
    id: 'OC-2026-005',
    fecha: '2026-01-18',
    productoId: 'SO-001',
    producto: 'Sobres de Envío Seguro',
    cantidad: 10000,
    solicitante: 'María Gómez',
    area: 'Logística',
    estatus: 'COMPLETADA',
    costoTotal: 12000,
  },
  {
    id: 'OC-2026-004',
    fecha: '2026-01-17',
    productoId: 'TP-001',
    producto: 'Tarjeta Platinum - Titular',
    cantidad: 2000,
    solicitante: 'Sofía Martínez',
    area: 'Almacén Central',
    estatus: 'COMPLETADA',
    costoTotal: 100000,
  },
  {
    id: 'OC-2026-003',
    fecha: '2026-01-16',
    productoId: 'TG-001',
    producto: 'Tarjeta Gold - Titular',
    cantidad: 5000,
    solicitante: 'Juan Pérez',
    area: 'Almacén Central',
    estatus: 'COMPLETADA',
    costoTotal: 175000,
  },
  {
    id: 'OC-2026-002',
    fecha: '2026-01-15',
    productoId: 'WK-001',
    producto: 'Welcome Kit Estándar',
    cantidad: 1500,
    solicitante: 'María Gómez',
    area: 'Logística',
    estatus: 'COMPLETADA',
    costoTotal: 60000,
  },
  {
    id: 'OC-2026-001',
    fecha: '2026-01-14',
    productoId: 'TC-002',
    producto: 'Tarjeta Clásica - Adicional',
    cantidad: 6000,
    solicitante: 'Juan Pérez',
    area: 'Almacén Central',
    estatus: 'COMPLETADA',
    costoTotal: 132000,
  },
  {
    id: 'OC-2025-125',
    fecha: '2026-01-13',
    productoId: 'TD-002',
    producto: 'Tarjeta Débito - Premium',
    cantidad: 3000,
    solicitante: 'Carlos Ruiz',
    area: 'Sucursales',
    estatus: 'APROBADA',
    costoTotal: 66000,
  },
  {
    id: 'OC-2025-124',
    fecha: '2026-01-12',
    productoId: 'WK-002',
    producto: 'Welcome Kit Premium',
    cantidad: 500,
    solicitante: 'María Gómez',
    area: 'Logística',
    estatus: 'RECHAZADA',
    costoTotal: 32500,
  },
];

export function calcularEstadisticasOrdenes() {
  return {
    total: ORDENES.length,
    pendientes: ORDENES.filter((o) => o.estatus === 'PENDIENTE').length,
    aprobadas: ORDENES.filter((o) => o.estatus === 'APROBADA').length,
    completadas: ORDENES.filter((o) => o.estatus === 'COMPLETADA').length,
    rechazadas: ORDENES.filter((o) => o.estatus === 'RECHAZADA').length,
  };
}

// =============================================================================
// FORECAST (BASADO EN DATOS REALES)
// =============================================================================

export const FORECAST_PERIODOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];

export const FORECAST_PRODUCTOS: ForecastProducto[] = [
  {
    id: 'TC-001',
    nombre: 'Tarjeta Clásica - Titular',
    actual: 70729,
    forecast: [72000, 74000, 76000, 75000, 77000, 78000],
    tendencia: 'up',
    alertas: 0,
  },
  {
    id: 'TC-002',
    nombre: 'Tarjeta Clásica - Adicional',
    actual: 40390,
    forecast: [40000, 39500, 39000, 38500, 38000, 37500],
    tendencia: 'down',
    alertas: 1,
  },
  {
    id: 'TD-001',
    nombre: 'Tarjeta Débito - Estándar',
    actual: 83000,
    forecast: [84000, 85500, 87000, 88500, 90000, 91500],
    tendencia: 'up',
    alertas: 0,
  },
  {
    id: 'TD-002',
    nombre: 'Tarjeta Débito - Premium',
    actual: 29500,
    forecast: [30000, 30500, 31000, 31500, 32000, 32500],
    tendencia: 'up',
    alertas: 0,
  },
  {
    id: 'TG-001',
    nombre: 'Tarjeta Gold - Titular',
    actual: 50578,
    forecast: [51000, 52000, 53000, 54000, 55000, 56000],
    tendencia: 'up',
    alertas: 0,
  },
  {
    id: 'WK-001',
    nombre: 'Welcome Kit Estándar',
    actual: 8500,
    forecast: [8500, 8000, 7500, 7000, 6500, 6000],
    tendencia: 'down',
    alertas: 2,
  },
  {
    id: 'TP-001',
    nombre: 'Tarjeta Platinum - Titular',
    actual: 20000,
    forecast: [20500, 21000, 21500, 22000, 22500, 23000],
    tendencia: 'up',
    alertas: 0,
  },
];

export function calcularMetricasForecast() {
  return {
    total: FORECAST_PRODUCTOS.length,
    enCrecimiento: FORECAST_PRODUCTOS.filter((p) => p.tendencia === 'up').length,
    enDescenso: FORECAST_PRODUCTOS.filter((p) => p.tendencia === 'down').length,
    conAlertas: FORECAST_PRODUCTOS.filter((p) => p.alertas > 0).length,
  };
}

// =============================================================================
// ALERTAS (BASADAS EN DATOS REALES)
// =============================================================================

export const ALERTAS: Alerta[] = [
  {
    producto: 'OC-2026-009',
    mensaje: 'Orden pendiente de aprobación - TD-001',
    tipo: 'info',
  },
  {
    producto: 'TC-002',
    mensaje: 'Tendencia de descenso continuo - Revisar demanda',
    tipo: 'warning',
  },
  {
    producto: 'WK-001',
    mensaje: 'Stock proyectado bajo para Abr-26',
    tipo: 'warning',
  },
  {
    producto: 'ENV-2026-050',
    mensaje: 'Envío en tránsito a Zona Norte',
    tipo: 'info',
  },
];

// =============================================================================
// DASHBOARD DATA
// =============================================================================

export function getDashboardData() {
  const resumen = calcularResumenGlobal();
  const ordenesStats = calcularEstadisticasOrdenes();

  const hoy = new Date().toISOString().split('T')[0];
  const capturasHoy = HISTORIAL.filter((h) => h.fecha.startsWith(hoy.replace(/-/g, '-'))).length || 2;

  return {
    resumen: {
      totalInventario: resumen.totalInventario,
      enAlmacen: resumen.enAlmacen,
      enLogistica: resumen.enLogistica,
      enSucursales: resumen.enSucursales,
      enProceso: resumen.enProceso,
    },
    alertas: ALERTAS,
    ordenesPendientes: ordenesStats.pendientes,
    capturasHoy,
  };
}

// =============================================================================
// CATALOGOS
// =============================================================================

export const DESTINOS = [
  { id: 'Z-NORTE', nombre: 'Zona Norte' },
  { id: 'Z-SUR', nombre: 'Zona Sur' },
  { id: 'Z-CENTRO', nombre: 'Zona Centro' },
  { id: 'Z-METRO', nombre: 'Zona Metropolitana' },
  { id: 'Z-OCCIDENTE', nombre: 'Zona Occidente' },
];

export const SUCURSALES = [
  { id: 'SUC-001', nombre: 'Sucursal Centro' },
  { id: 'SUC-002', nombre: 'Sucursal Norte' },
  { id: 'SUC-003', nombre: 'Sucursal Sur' },
  { id: 'SUC-004', nombre: 'Sucursal Poniente' },
  { id: 'SUC-005', nombre: 'Sucursal Oriente' },
  { id: 'SUC-006', nombre: 'Sucursal Plaza Mayor' },
];

export const CATEGORIAS_PRODUCTO = ['Todas', 'Tarjetas', 'Kits', 'Etiquetas', 'Sobres'];

export const ROLES_COLORS: Record<string, string> = {
  Administrador: 'bg-purple-100 text-purple-700',
  'Almacén Central': 'bg-blue-100 text-blue-700',
  Logística: 'bg-amber-100 text-amber-700',
  Sucursales: 'bg-green-100 text-green-700',
  Consulta: 'bg-slate-100 text-slate-700',
};

const mockData = {
  productos: PRODUCTOS,
  usuarios: USUARIOS,
  balance: BALANCE_DATA,
  historial: HISTORIAL,
  ordenes: ORDENES,
  forecast: {
    periodos: FORECAST_PERIODOS,
    productos: FORECAST_PRODUCTOS,
  },
  alertas: ALERTAS,
  destinos: DESTINOS,
  sucursales: SUCURSALES,
};

export default mockData;
