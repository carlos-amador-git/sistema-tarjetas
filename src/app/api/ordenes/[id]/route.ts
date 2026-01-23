/**
 * API Route: Orden Individual
 *
 * GET /api/ordenes/[id] - Obtener orden por ID
 * PATCH /api/ordenes/[id] - Actualizar estatus de orden
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Obtener orden por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const orden = await prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            precio: true,
          },
        },
        user: {
          select: {
            id: true,
            nombre: true,
            username: true,
          },
        },
      },
    });

    if (!orden) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

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
      createdAt: orden.createdAt.toISOString(),
      updatedAt: orden.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar estatus de orden
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estatus } = body;

    // Validar estatus
    const estatusValidos = ['PENDIENTE', 'APROBADA', 'COMPLETADA', 'RECHAZADA'];
    if (!estatus || !estatusValidos.includes(estatus)) {
      return NextResponse.json(
        { error: 'Estatus inválido. Valores permitidos: ' + estatusValidos.join(', ') },
        { status: 400 }
      );
    }

    // Verificar que existe
    const ordenExistente = await prisma.ordenCompra.findUnique({ where: { id } });
    if (!ordenExistente) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    const orden = await prisma.ordenCompra.update({
      where: { id },
      data: { estatus },
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
    });
  } catch (error) {
    console.error('Error actualizando orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
