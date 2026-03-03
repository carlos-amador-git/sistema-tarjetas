/**
 * API Route: Historial de Movimientos
 *
 * GET /api/historial - Listar movimientos con filtros
 * POST /api/historial - Registrar nuevo movimiento
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - Listar movimientos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const productoId = searchParams.get('productoId');
    const area = searchParams.get('area');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir filtros
    const where: Record<string, unknown> = {};

    if (tipo) {
      where.tipo = tipo;
    }

    if (productoId) {
      where.productoId = productoId;
    }

    if (area) {
      where.area = area;
    }

    const [movimientos, total] = await Promise.all([
      prisma.movimientoHistorial.findMany({
        where,
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              nombre: true,
            },
          },
        },
        orderBy: { fecha: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.movimientoHistorial.count({ where }),
    ]);

    // Formatear respuesta
    const movimientosFormateados = movimientos.map((m) => ({
      id: m.id,
      fecha: m.fecha.toISOString(),
      tipo: m.tipo,
      productoId: m.productoId,
      producto: m.producto.nombre,
      cantidad: m.cantidad,
      usuario: m.user.username,
      area: m.area,
      observacion: m.observacion,
      documento: m.documento,
    }));

    // Calcular estadísticas
    const allMovimientos = await prisma.movimientoHistorial.findMany({ where });
    const entradas = allMovimientos.filter((m) => m.tipo === 'ENTRADA').reduce((sum, m) => sum + m.cantidad, 0);
    const salidas = allMovimientos.filter((m) => m.tipo === 'SALIDA').reduce((sum, m) => sum + m.cantidad, 0);

    return NextResponse.json({
      movimientos: movimientosFormateados,
      total,
      estadisticas: {
        entradas,
        salidas,
        movimientos: total,
      },
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Registrar movimiento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, productoId, cantidad, userId, area, observacion, documento } = body;

    // Validaciones
    if (!tipo || !productoId || cantidad === undefined || !userId || !area || !documento) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (!['ENTRADA', 'SALIDA', 'AJUSTE'].includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo de movimiento inválido' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const producto = await prisma.producto.findUnique({ where: { id: productoId } });
    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const movimiento = await prisma.movimientoHistorial.create({
      data: {
        fecha: new Date(),
        tipo,
        productoId,
        cantidad,
        userId,
        area,
        observacion: observacion || '',
        documento,
      },
      include: {
        producto: {
          select: { nombre: true },
        },
        user: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json({
      id: movimiento.id,
      fecha: movimiento.fecha.toISOString(),
      tipo: movimiento.tipo,
      productoId: movimiento.productoId,
      producto: movimiento.producto.nombre,
      cantidad: movimiento.cantidad,
      usuario: movimiento.user.username,
      area: movimiento.area,
      observacion: movimiento.observacion,
      documento: movimiento.documento,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando movimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
