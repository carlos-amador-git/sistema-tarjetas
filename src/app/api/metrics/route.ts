/**
 * API Route: System Metrics
 *
 * GET /api/metrics - Obtener métricas del sistema
 *
 * Requiere autenticación (cookie auth_token)
 * Solo usuarios con rol admin pueden acceder
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

interface JWTPayload {
  userId: number;
  username: string;
  rol: string;
}

interface MetricsResponse {
  timestamp: string;
  system: {
    usuarios: {
      total: number;
      activos: number;
      porRol: Record<string, number>;
    };
    productos: {
      total: number;
      activos: number;
      stockBajo: number;
      porCategoria: Record<string, number>;
    };
    ordenes: {
      total: number;
      pendientes: number;
      aprobadas: number;
      completadas: number;
      rechazadas: number;
      valorTotal: number;
    };
    movimientos: {
      total: number;
      hoy: number;
      semana: number;
      mes: number;
    };
  };
  inventory: {
    totalItems: number;
    enAlmacen: number;
    enLogistica: number;
    enSucursales: number;
    enProceso: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token y rol
    let payload: JWTPayload;
    try {
      payload = verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Solo admin puede ver métricas
    if (payload.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requiere rol de administrador.' },
        { status: 403 }
      );
    }

    // Calcular fechas
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setMonth(monthStart.getMonth() - 1);

    // Ejecutar todas las queries en paralelo
    const [
      usuariosStats,
      productosStats,
      productosStockBajo,
      productosPorCategoria,
      ordenesStats,
      movimientosStats,
      balanceStats,
    ] = await Promise.all([
      // Usuarios
      prisma.user.groupBy({
        by: ['rol', 'activo'],
        _count: true,
      }),

      // Productos
      prisma.producto.aggregate({
        _count: true,
        where: { activo: true },
      }),

      // Productos con stock bajo
      prisma.producto.count({
        where: {
          activo: true,
          stock: { lte: prisma.producto.fields.stockMinimo },
        },
      }).catch(() => 0), // Fallback si la query falla

      // Productos por categoría
      prisma.producto.groupBy({
        by: ['categoria'],
        _count: true,
        where: { activo: true },
      }),

      // Órdenes
      prisma.ordenCompra.groupBy({
        by: ['estatus'],
        _count: true,
        _sum: { costoTotal: true },
      }),

      // Movimientos por período
      Promise.all([
        prisma.movimientoHistorial.count(),
        prisma.movimientoHistorial.count({ where: { fecha: { gte: todayStart } } }),
        prisma.movimientoHistorial.count({ where: { fecha: { gte: weekStart } } }),
        prisma.movimientoHistorial.count({ where: { fecha: { gte: monthStart } } }),
      ]),

      // Balance de inventario
      prisma.balanceProducto.aggregate({
        _sum: {
          almacenBovedaTrabajo: true,
          almacenBovedaPrincipal: true,
          logisticaColocacion: true,
          logisticaNormal: true,
          logisticaDevoluciones: true,
          sucursalesColocacion: true,
          sucursalesStock: true,
          enProcesoCantidad: true,
        },
      }),
    ]);

    // Procesar estadísticas de usuarios
    const usuariosPorRol: Record<string, number> = {};
    let totalUsuarios = 0;
    let usuariosActivos = 0;

    usuariosStats.forEach((stat) => {
      totalUsuarios += stat._count;
      if (stat.activo) {
        usuariosActivos += stat._count;
      }
      usuariosPorRol[stat.rol] = (usuariosPorRol[stat.rol] || 0) + stat._count;
    });

    // Procesar estadísticas de órdenes
    const ordenesData = {
      total: 0,
      pendientes: 0,
      aprobadas: 0,
      completadas: 0,
      rechazadas: 0,
      valorTotal: 0,
    };

    ordenesStats.forEach((stat) => {
      ordenesData.total += stat._count;
      ordenesData.valorTotal += stat._sum.costoTotal || 0;
      switch (stat.estatus) {
        case 'PENDIENTE':
          ordenesData.pendientes = stat._count;
          break;
        case 'APROBADA':
          ordenesData.aprobadas = stat._count;
          break;
        case 'COMPLETADA':
          ordenesData.completadas = stat._count;
          break;
        case 'RECHAZADA':
          ordenesData.rechazadas = stat._count;
          break;
      }
    });

    // Procesar categorías
    const porCategoria: Record<string, number> = {};
    productosPorCategoria.forEach((cat) => {
      porCategoria[cat.categoria] = cat._count;
    });

    // Calcular totales de inventario
    const sums = balanceStats._sum;
    const enAlmacen = (sums.almacenBovedaTrabajo || 0) + (sums.almacenBovedaPrincipal || 0);
    const enLogistica = (sums.logisticaColocacion || 0) + (sums.logisticaNormal || 0) + (sums.logisticaDevoluciones || 0);
    const enSucursales = (sums.sucursalesColocacion || 0) + (sums.sucursalesStock || 0);
    const enProceso = sums.enProcesoCantidad || 0;

    const response: MetricsResponse = {
      timestamp: new Date().toISOString(),
      system: {
        usuarios: {
          total: totalUsuarios,
          activos: usuariosActivos,
          porRol: usuariosPorRol,
        },
        productos: {
          total: productosStats._count || 0,
          activos: productosStats._count || 0,
          stockBajo: productosStockBajo,
          porCategoria,
        },
        ordenes: ordenesData,
        movimientos: {
          total: movimientosStats[0],
          hoy: movimientosStats[1],
          semana: movimientosStats[2],
          mes: movimientosStats[3],
        },
      },
      inventory: {
        totalItems: enAlmacen + enLogistica + enSucursales + enProceso,
        enAlmacen,
        enLogistica,
        enSucursales,
        enProceso,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
