/**
 * API Route: Productos
 *
 * CRUD para gestión de productos con Prisma
 *
 * GET /api/productos - Listar todos los productos
 * POST /api/productos - Crear nuevo producto
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - Listar productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const activo = searchParams.get('activo');
    const area = searchParams.get('area');

    // Construir filtros
    const where: Record<string, unknown> = {};

    if (categoria && categoria !== 'todas') {
      where.categoria = categoria;
    }

    if (activo !== null) {
      where.activo = activo === 'true';
    }

    const productos = await prisma.producto.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });

    // Parsear el campo areas (JSON string) y filtrar por área si se especifica
    const productosFormateados = productos
      .map((p) => ({
        ...p,
        areas: JSON.parse(p.areas) as string[],
      }))
      .filter((p) => {
        if (area) {
          return p.areas.includes(area);
        }
        return true;
      });

    return NextResponse.json(productosFormateados);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nombre, categoria, areas, stockMinimo, precio, activo = true } = body;

    // Validaciones básicas
    if (!id || !nombre || !categoria || !areas || stockMinimo === undefined || precio === undefined) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el ID no exista
    const existente = await prisma.producto.findUnique({ where: { id } });
    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe un producto con ese ID' },
        { status: 409 }
      );
    }

    const producto = await prisma.producto.create({
      data: {
        id,
        nombre,
        categoria,
        areas: JSON.stringify(areas),
        stock: 0,
        stockMinimo,
        precio,
        activo,
      },
    });

    return NextResponse.json({
      ...producto,
      areas: JSON.parse(producto.areas),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
