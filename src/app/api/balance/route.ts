/**
 * API Route: Balance de Inventario
 *
 * GET /api/balance - Obtener balance de todos los productos
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Tipo para el balance formateado
interface BalanceFormateado {
  productoId: string;
  nombre: string;
  almacen: {
    bovedaTrabajo: number;
    bovedaPrincipal: number;
    total: number;
  };
  enProceso: {
    cantidad: number;
    ordenesActivas: number;
  };
  logistica: {
    colocacion: number;
    normal: number;
    devoluciones: number;
    total: number;
  };
  sucursales: {
    colocacion: number;
    stock: number;
    total: number;
  };
  totalGeneral: number;
}

// GET - Obtener balance de todos los productos
export async function GET() {
  try {
    const balances = await prisma.balanceProducto.findMany({
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

    // Formatear la respuesta
    const balanceFormateado: Record<string, BalanceFormateado> = {};

    for (const b of balances) {
      const almacenTotal = b.almacenBovedaTrabajo + b.almacenBovedaPrincipal;
      const logisticaTotal = b.logisticaColocacion + b.logisticaNormal + b.logisticaDevoluciones;
      const sucursalesTotal = b.sucursalesColocacion + b.sucursalesStock;
      const totalGeneral = almacenTotal + b.enProcesoCantidad + logisticaTotal + sucursalesTotal;

      balanceFormateado[b.productoId] = {
        productoId: b.productoId,
        nombre: b.producto.nombre,
        almacen: {
          bovedaTrabajo: b.almacenBovedaTrabajo,
          bovedaPrincipal: b.almacenBovedaPrincipal,
          total: almacenTotal,
        },
        enProceso: {
          cantidad: b.enProcesoCantidad,
          ordenesActivas: b.enProcesoOrdenesActivas,
        },
        logistica: {
          colocacion: b.logisticaColocacion,
          normal: b.logisticaNormal,
          devoluciones: b.logisticaDevoluciones,
          total: logisticaTotal,
        },
        sucursales: {
          colocacion: b.sucursalesColocacion,
          stock: b.sucursalesStock,
          total: sucursalesTotal,
        },
        totalGeneral,
      };
    }

    // Calcular resumen global
    let enAlmacen = 0;
    let enLogistica = 0;
    let enSucursales = 0;
    let enProceso = 0;

    Object.values(balanceFormateado).forEach((b) => {
      enAlmacen += b.almacen.total;
      enLogistica += b.logistica.total;
      enSucursales += b.sucursales.total;
      enProceso += b.enProceso.cantidad;
    });

    return NextResponse.json({
      balance: balanceFormateado,
      resumen: {
        totalInventario: enAlmacen + enLogistica + enSucursales,
        enAlmacen,
        enLogistica,
        enSucursales,
        enProceso,
      },
    });
  } catch (error) {
    console.error('Error obteniendo balance:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
