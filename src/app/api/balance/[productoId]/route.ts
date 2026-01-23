/**
 * API Route: Balance Individual por Producto
 *
 * GET /api/balance/[productoId] - Obtener balance de un producto
 * PUT /api/balance/[productoId] - Actualizar balance (para capturas)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
  params: Promise<{ productoId: string }>;
}

// GET - Obtener balance de un producto específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { productoId } = await params;

    const balance = await prisma.balanceProducto.findUnique({
      where: { productoId },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            categoria: true,
            stockMinimo: true,
          },
        },
      },
    });

    if (!balance) {
      return NextResponse.json(
        { error: 'Balance no encontrado para este producto' },
        { status: 404 }
      );
    }

    const almacenTotal = balance.almacenBovedaTrabajo + balance.almacenBovedaPrincipal;
    const logisticaTotal = balance.logisticaColocacion + balance.logisticaNormal + balance.logisticaDevoluciones;
    const sucursalesTotal = balance.sucursalesColocacion + balance.sucursalesStock;
    const totalGeneral = almacenTotal + balance.enProcesoCantidad + logisticaTotal + sucursalesTotal;

    return NextResponse.json({
      productoId: balance.productoId,
      nombre: balance.producto.nombre,
      almacen: {
        bovedaTrabajo: balance.almacenBovedaTrabajo,
        bovedaPrincipal: balance.almacenBovedaPrincipal,
        total: almacenTotal,
      },
      enProceso: {
        cantidad: balance.enProcesoCantidad,
        ordenesActivas: balance.enProcesoOrdenesActivas,
      },
      logistica: {
        colocacion: balance.logisticaColocacion,
        normal: balance.logisticaNormal,
        devoluciones: balance.logisticaDevoluciones,
        total: logisticaTotal,
      },
      sucursales: {
        colocacion: balance.sucursalesColocacion,
        stock: balance.sucursalesStock,
        total: sucursalesTotal,
      },
      totalGeneral,
    });
  } catch (error) {
    console.error('Error obteniendo balance:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar balance (usado por capturas)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { productoId } = await params;
    const body = await request.json();

    // Verificar que existe
    let balance = await prisma.balanceProducto.findUnique({
      where: { productoId },
    });

    // Si no existe, crear uno nuevo
    if (!balance) {
      balance = await prisma.balanceProducto.create({
        data: {
          productoId,
          almacenBovedaTrabajo: body.almacen?.bovedaTrabajo ?? 0,
          almacenBovedaPrincipal: body.almacen?.bovedaPrincipal ?? 0,
          enProcesoCantidad: body.enProceso?.cantidad ?? 0,
          enProcesoOrdenesActivas: body.enProceso?.ordenesActivas ?? 0,
          logisticaColocacion: body.logistica?.colocacion ?? 0,
          logisticaNormal: body.logistica?.normal ?? 0,
          logisticaDevoluciones: body.logistica?.devoluciones ?? 0,
          sucursalesColocacion: body.sucursales?.colocacion ?? 0,
          sucursalesStock: body.sucursales?.stock ?? 0,
        },
      });
    } else {
      // Actualizar existente
      balance = await prisma.balanceProducto.update({
        where: { productoId },
        data: {
          ...(body.almacen?.bovedaTrabajo !== undefined && { almacenBovedaTrabajo: body.almacen.bovedaTrabajo }),
          ...(body.almacen?.bovedaPrincipal !== undefined && { almacenBovedaPrincipal: body.almacen.bovedaPrincipal }),
          ...(body.enProceso?.cantidad !== undefined && { enProcesoCantidad: body.enProceso.cantidad }),
          ...(body.enProceso?.ordenesActivas !== undefined && { enProcesoOrdenesActivas: body.enProceso.ordenesActivas }),
          ...(body.logistica?.colocacion !== undefined && { logisticaColocacion: body.logistica.colocacion }),
          ...(body.logistica?.normal !== undefined && { logisticaNormal: body.logistica.normal }),
          ...(body.logistica?.devoluciones !== undefined && { logisticaDevoluciones: body.logistica.devoluciones }),
          ...(body.sucursales?.colocacion !== undefined && { sucursalesColocacion: body.sucursales.colocacion }),
          ...(body.sucursales?.stock !== undefined && { sucursalesStock: body.sucursales.stock }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.error('Error actualizando balance:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
