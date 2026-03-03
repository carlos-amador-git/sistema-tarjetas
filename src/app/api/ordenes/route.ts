/**
 * API Route: Órdenes de Compra
 *
 * GET /api/ordenes - Listar órdenes con filtros
 * POST /api/ordenes - Crear nueva orden
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - Listar órdenes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estatus = searchParams.get('estatus');
    const productoId = searchParams.get('productoId');
    const area = searchParams.get('area');

    // Construir filtros
    const where: Record<string, unknown> = {};

    if (estatus) {
      where.estatus = estatus;
    }

    if (productoId) {
      where.productoId = productoId;
    }

    if (area) {
      where.area = area;
    }

    const ordenes = await prisma.ordenCompra.findMany({
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
            nombre: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    // Formatear respuesta
    const ordenesFormateadas = ordenes.map((o) => ({
      id: o.id,
      fecha: o.fecha.toISOString().split('T')[0],
      productoId: o.productoId,
      producto: o.producto.nombre,
      cantidad: o.cantidad,
      solicitante: o.user.nombre,
      area: o.area,
      estatus: o.estatus,
      costoTotal: o.costoTotal,
    }));

    // Calcular estadísticas
    const estadisticas = {
      total: ordenes.length,
      pendientes: ordenes.filter((o) => o.estatus === 'PENDIENTE').length,
      aprobadas: ordenes.filter((o) => o.estatus === 'APROBADA').length,
      completadas: ordenes.filter((o) => o.estatus === 'COMPLETADA').length,
      rechazadas: ordenes.filter((o) => o.estatus === 'RECHAZADA').length,
    };

    return NextResponse.json({
      ordenes: ordenesFormateadas,
      estadisticas,
    });
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear orden
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productoId, cantidad, userId, area } = body;

    // Validaciones
    if (!productoId || cantidad === undefined || !userId || !area) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe y obtener precio
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

    // Generar ID de orden
    const year = new Date().getFullYear();
    const lastOrden = await prisma.ordenCompra.findFirst({
      where: {
        id: {
          startsWith: `OC-${year}-`,
        },
      },
      orderBy: { id: 'desc' },
    });

    let nextNum = 1;
    if (lastOrden) {
      const lastNum = parseInt(lastOrden.id.split('-')[2]);
      nextNum = lastNum + 1;
    }

    const ordenId = `OC-${year}-${String(nextNum).padStart(3, '0')}`;
    const costoTotal = cantidad * producto.precio;

    const orden = await prisma.ordenCompra.create({
      data: {
        id: ordenId,
        fecha: new Date(),
        productoId,
        cantidad,
        userId,
        area,
        estatus: 'PENDIENTE',
        costoTotal,
      },
      include: {
        producto: {
          select: { nombre: true },
        },
        user: {
          select: { nombre: true },
        },
      },
    });

    return NextResponse.json({
      id: orden.id,
      fecha: orden.fecha.toISOString().split('T')[0],
      productoId: orden.productoId,
      producto: orden.producto.nombre,
      cantidad: orden.cantidad,
      solicitante: orden.user.nombre,
      area: orden.area,
      estatus: orden.estatus,
      costoTotal: orden.costoTotal,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
