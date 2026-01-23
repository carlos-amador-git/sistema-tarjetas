/**
 * Configuración de Productos
 *
 * Catálogo centralizado de productos para todas las áreas.
 * Cada área puede filtrar los productos según sus necesidades.
 */

export interface ProductoCatalogo {
  id: string;
  nombre: string;
  categoria: 'tarjeta' | 'kit' | 'etiqueta' | 'sobre' | 'otro';
  areas: ('almacen' | 'logistica' | 'sucursales')[];
}

// Catálogo completo de productos
export const PRODUCTOS_CATALOGO: ProductoCatalogo[] = [
  {
    id: 'TC-001',
    nombre: 'Tarjeta Clásica - Titular',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
  },
  {
    id: 'TC-002',
    nombre: 'Tarjeta Clásica - Adicional',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
  },
  {
    id: 'TG-001',
    nombre: 'Tarjeta Gold - Titular',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
  },
  {
    id: 'TP-001',
    nombre: 'Tarjeta Platinum - Titular',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
  },
  {
    id: 'TD-001',
    nombre: 'Tarjeta Débito - Estándar',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
  },
  {
    id: 'TD-002',
    nombre: 'Tarjeta Débito - Premium',
    categoria: 'tarjeta',
    areas: ['almacen', 'logistica', 'sucursales'],
  },
  {
    id: 'WK-001',
    nombre: 'Welcome Kit Estándar',
    categoria: 'kit',
    areas: ['logistica', 'sucursales'],
  },
  {
    id: 'WK-002',
    nombre: 'Welcome Kit Premium',
    categoria: 'kit',
    areas: ['logistica'],
  },
  {
    id: 'ET-001',
    nombre: 'Etiquetas de Seguridad',
    categoria: 'etiqueta',
    areas: ['almacen'],
  },
  {
    id: 'SO-001',
    nombre: 'Sobres de Envío Seguro',
    categoria: 'sobre',
    areas: ['logistica'],
  },
];

// Funciones de utilidad para filtrar productos por área
export const getProductosAlmacen = () =>
  PRODUCTOS_CATALOGO.filter(p => p.areas.includes('almacen'));

export const getProductosLogistica = () =>
  PRODUCTOS_CATALOGO.filter(p => p.areas.includes('logistica'));

export const getProductosSucursales = () =>
  PRODUCTOS_CATALOGO.filter(p => p.areas.includes('sucursales'));

// Destinos de logística
export const DESTINOS = [
  { id: 'Z-NORTE', nombre: 'Zona Norte' },
  { id: 'Z-SUR', nombre: 'Zona Sur' },
  { id: 'Z-CENTRO', nombre: 'Zona Centro' },
  { id: 'Z-METRO', nombre: 'Zona Metropolitana' },
  { id: 'Z-OCCIDENTE', nombre: 'Zona Occidente' },
];

// Sucursales
export const SUCURSALES = [
  { id: 'SUC-001', nombre: 'Sucursal Centro' },
  { id: 'SUC-002', nombre: 'Sucursal Norte' },
  { id: 'SUC-003', nombre: 'Sucursal Sur' },
  { id: 'SUC-004', nombre: 'Sucursal Poniente' },
  { id: 'SUC-005', nombre: 'Sucursal Oriente' },
  { id: 'SUC-006', nombre: 'Sucursal Plaza Mayor' },
];

export default PRODUCTOS_CATALOGO;
