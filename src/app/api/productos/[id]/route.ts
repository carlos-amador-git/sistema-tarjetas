/**
 * API Route: Producto Individual
 *
 * GET /api/productos/[id] - Obtener producto por ID
 * PUT /api/productos/[id] - Actualizar producto
 * DELETE /api/productos/[id] - Eliminar producto
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Obtener producto por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        balance: true,
      },
    });

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...producto,
      areas: JSON.parse(producto.areas),
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, categoria, areas, stockMinimo, precio, activo } = body;

    // Verificar que existe
    const existente = await prisma.producto.findUnique({ where: { id } });
    if (!existente) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(categoria !== undefined && { categoria }),
        ...(areas !== undefined && { areas: JSON.stringify(areas) }),
        ...(stockMinimo !== undefined && { stockMinimo }),
        ...(precio !== undefined && { precio }),
        ...(activo !== undefined && { activo }),
      },
    });

    return NextResponse.json({
      ...producto,
      areas: JSON.parse(producto.areas),
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar que existe
    const existente = await prisma.producto.findUnique({ where: { id } });
    if (!existente) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete - marcar como inactivo
    await prisma.producto.update({
      where: { id },
      data: { activo: false },
    });

    return NextResponse.json({ success: true, message: 'Producto desactivado' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
