import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { hashPassword } from '../src/lib/auth/password'

const DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db'

const adapter = new PrismaLibSql({ url: DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Contraseñas para usuarios demo
const DEMO_PASSWORDS: Record<string, string> = {
    'admin': 'admin123',
    'tsys_user': 'tsys123',
    'dist_user': 'dist123',
    'mod_user': 'mod123',
    'director': 'dir123',
    'inactivo': 'inactivo123',
}

async function main() {
    console.log('🌱 Starting database seed...\n')

    // ============================================================================
    // 1. USUARIOS
    // ============================================================================
    console.log('👤 Creating users...')

    const usuarios = [
        {
            id: 1,
            nombre: 'Administrador Sistema',
            username: 'admin',
            email: 'admin@cardsystem.com',
            rol: 'Administrador',
            area: 'Sistemas',
            activo: true,
            ultimoAcceso: new Date('2026-01-20 10:30')
        },
        {
            id: 2,
            nombre: 'Usuario Almacén',
            username: 'tsys_user',
            email: 'almacen@cardsystem.com',
            rol: 'Almacén Central',
            area: 'Almacén',
            activo: true,
            ultimoAcceso: new Date('2026-01-20 09:15')
        },
        {
            id: 3,
            nombre: 'Usuario Logística',
            username: 'dist_user',
            email: 'logistica@cardsystem.com',
            rol: 'Logística',
            area: 'Distribución',
            activo: true,
            ultimoAcceso: new Date('2026-01-19 16:45')
        },
        {
            id: 4,
            nombre: 'Usuario Sucursales',
            username: 'mod_user',
            email: 'sucursales@cardsystem.com',
            rol: 'Sucursales',
            area: 'Módulos',
            activo: true,
            ultimoAcceso: new Date('2026-01-20 08:00')
        },
        {
            id: 5,
            nombre: 'Director General',
            username: 'director',
            email: 'director@cardsystem.com',
            rol: 'Consulta',
            area: 'Dirección',
            activo: true,
            ultimoAcceso: new Date('2026-01-18 14:20')
        },
        {
            id: 6,
            nombre: 'Usuario Inactivo',
            username: 'inactivo',
            email: 'inactivo@cardsystem.com',
            rol: 'Sucursales',
            area: 'Módulos',
            activo: false,
            ultimoAcceso: new Date('2025-12-15 10:00')
        }
    ]

    for (const usuario of usuarios) {
        const password = await hashPassword(DEMO_PASSWORDS[usuario.username])
        await prisma.user.create({
            data: {
                ...usuario,
                password
            }
        })
        console.log(`  ✓ Created user: ${usuario.username}`)
    }

    // ============================================================================
    // 2. PRODUCTOS
    // ============================================================================
    console.log('\n📦 Creating products...')

    const productos = [
        {
            id: 'TC-001',
            nombre: 'Tarjeta Clásica - Titular',
            categoria: 'tarjeta',
            areas: JSON.stringify(['almacen', 'logistica', 'sucursales']),
            stock: 41607,
            stockMinimo: 10000,
            precio: 25.00,
            activo: true
        },
        {
            id: 'TC-002',
            nombre: 'Tarjeta Clásica - Adicional',
            categoria: 'tarjeta',
            areas: JSON.stringify(['almacen', 'logistica', 'sucursales']),
            stock: 20862,
            stockMinimo: 5000,
            precio: 22.00,
            activo: true
        },
        {
            id: 'TG-001',
            nombre: 'Tarjeta Gold - Titular',
            categoria: 'tarjeta',
            areas: JSON.stringify(['almacen', 'logistica', 'sucursales']),
            stock: 27450,
            stockMinimo: 8000,
            precio: 35.00,
            activo: true
        },
        {
            id: 'TP-001',
            nombre: 'Tarjeta Platinum - Titular',
            categoria: 'tarjeta',
            areas: JSON.stringify(['almacen', 'logistica', 'sucursales']),
            stock: 15000,
            stockMinimo: 4000,
            precio: 50.00,
            activo: true
        },
        {
            id: 'TD-001',
            nombre: 'Tarjeta Débito - Estándar',
            categoria: 'tarjeta',
            areas: JSON.stringify(['almacen', 'logistica', 'sucursales']),
            stock: 25000,
            stockMinimo: 8000,
            precio: 15.00,
            activo: true
        },
        {
            id: 'TD-002',
            nombre: 'Tarjeta Débito - Premium',
            categoria: 'tarjeta',
            areas: JSON.stringify(['almacen', 'logistica', 'sucursales']),
            stock: 12000,
            stockMinimo: 4000,
            precio: 22.00,
            activo: true
        },
        {
            id: 'WK-001',
            nombre: 'Welcome Kit Estándar',
            categoria: 'kit',
            areas: JSON.stringify(['logistica', 'sucursales']),
            stock: 5000,
            stockMinimo: 2000,
            precio: 40.00,
            activo: true
        },
        {
            id: 'WK-002',
            nombre: 'Welcome Kit Premium',
            categoria: 'kit',
            areas: JSON.stringify(['logistica']),
            stock: 2500,
            stockMinimo: 1000,
            precio: 65.00,
            activo: true
        },
        {
            id: 'ET-001',
            nombre: 'Etiquetas de Seguridad',
            categoria: 'etiqueta',
            areas: JSON.stringify(['almacen']),
            stock: 150000,
            stockMinimo: 50000,
            precio: 0.50,
            activo: true
        },
        {
            id: 'SO-001',
            nombre: 'Sobres de Envío Seguro',
            categoria: 'sobre',
            areas: JSON.stringify(['logistica']),
            stock: 98000,
            stockMinimo: 30000,
            precio: 1.20,
            activo: true
        }
    ]

    for (const producto of productos) {
        await prisma.producto.create({ data: producto })
        console.log(`  ✓ Created product: ${producto.id} - ${producto.nombre}`)
    }

    // ============================================================================
    // 3. BALANCE DE INVENTARIO
    // ============================================================================
    console.log('\n📊 Creating inventory balance...')

    const balances = [
        {
            productoId: 'TC-001',
            almacenBovedaTrabajo: 15207,
            almacenBovedaPrincipal: 26400,
            enProcesoCantidad: 123000,
            enProcesoOrdenesActivas: 2,
            logisticaColocacion: 11464,
            logisticaNormal: 5283,
            logisticaDevoluciones: 0,
            sucursalesColocacion: 10775,
            sucursalesStock: 1500
        },
        {
            productoId: 'TC-002',
            almacenBovedaTrabajo: 8362,
            almacenBovedaPrincipal: 12500,
            enProcesoCantidad: 35000,
            enProcesoOrdenesActivas: 1,
            logisticaColocacion: 4424,
            logisticaNormal: 10180,
            logisticaDevoluciones: 0,
            sucursalesColocacion: 4424,
            sucursalesStock: 500
        },
        {
            productoId: 'TG-001',
            almacenBovedaTrabajo: 12570,
            almacenBovedaPrincipal: 14880,
            enProcesoCantidad: 30000,
            enProcesoOrdenesActivas: 1,
            logisticaColocacion: 7608,
            logisticaNormal: 7112,
            logisticaDevoluciones: 0,
            sucursalesColocacion: 7608,
            sucursalesStock: 800
        }
    ]

    for (const balance of balances) {
        await prisma.balanceProducto.create({ data: balance })
        console.log(`  ✓ Created balance for product: ${balance.productoId}`)
    }

    // ============================================================================
    // 4. ÓRDENES DE COMPRA
    // ============================================================================
    console.log('\n📝 Creating purchase orders...')

    const ordenes = [
        {
            id: 'OC-2026-001',
            fecha: new Date('2026-01-15'),
            productoId: 'TC-001',
            cantidad: 5000,
            userId: 2, // tsys_user
            area: 'Almacén Central',
            estatus: 'PENDIENTE',
            costoTotal: 125000
        },
        {
            id: 'OC-2026-002',
            fecha: new Date('2026-01-14'),
            productoId: 'WK-001',
            cantidad: 2000,
            userId: 3, // dist_user
            area: 'Logística',
            estatus: 'APROBADA',
            costoTotal: 80000
        },
        {
            id: 'OC-2026-003',
            fecha: new Date('2026-01-13'),
            productoId: 'TD-002',
            cantidad: 3000,
            userId: 4, // mod_user
            area: 'Sucursales',
            estatus: 'COMPLETADA',
            costoTotal: 66000
        },
        {
            id: 'OC-2026-004',
            fecha: new Date('2026-01-12'),
            productoId: 'SO-001',
            cantidad: 10000,
            userId: 2, // tsys_user
            area: 'Almacén Central',
            estatus: 'RECHAZADA',
            costoTotal: 12000
        },
        {
            id: 'OC-2026-005',
            fecha: new Date('2026-01-11'),
            productoId: 'ET-001',
            cantidad: 50000,
            userId: 3, // dist_user
            area: 'Logística',
            estatus: 'PENDIENTE',
            costoTotal: 25000
        }
    ]

    for (const orden of ordenes) {
        await prisma.ordenCompra.create({ data: orden })
        console.log(`  ✓ Created order: ${orden.id}`)
    }

    // ============================================================================
    // 5. HISTORIAL DE MOVIMIENTOS
    // ============================================================================
    console.log('\n📜 Creating movement history...')

    const movimientos = [
        {
            id: 1,
            fecha: new Date('2026-01-20 10:30:00'),
            tipo: 'ENTRADA',
            productoId: 'TC-001',
            cantidad: 5000,
            userId: 2,
            area: 'Almacén Central',
            observacion: 'Recepción de proveedor',
            documento: 'OC-2026-001'
        },
        {
            id: 2,
            fecha: new Date('2026-01-20 09:15:00'),
            tipo: 'SALIDA',
            productoId: 'WK-001',
            cantidad: 500,
            userId: 3,
            area: 'Logística',
            observacion: 'Envío a sucursales zona norte',
            documento: 'ENV-2026-045'
        },
        {
            id: 3,
            fecha: new Date('2026-01-19 16:45:00'),
            tipo: 'ENTRADA',
            productoId: 'ET-001',
            cantidad: 50000,
            userId: 2,
            area: 'Almacén Central',
            observacion: 'Reposición de inventario',
            documento: 'OC-2026-002'
        },
        {
            id: 4,
            fecha: new Date('2026-01-19 14:20:00'),
            tipo: 'SALIDA',
            productoId: 'TD-001',
            cantidad: 2000,
            userId: 4,
            area: 'Sucursales',
            observacion: 'Distribución a módulos',
            documento: 'DIS-2026-123'
        },
        {
            id: 5,
            fecha: new Date('2026-01-18 11:00:00'),
            tipo: 'ENTRADA',
            productoId: 'SO-001',
            cantidad: 10000,
            userId: 2,
            area: 'Almacén Central',
            observacion: 'Orden de compra completada',
            documento: 'OC-2026-003'
        },
        {
            id: 6,
            fecha: new Date('2026-01-18 09:30:00'),
            tipo: 'SALIDA',
            productoId: 'TC-002',
            cantidad: 1500,
            userId: 3,
            area: 'Logística',
            observacion: 'Envío zona metropolitana',
            documento: 'ENV-2026-044'
        },
        {
            id: 7,
            fecha: new Date('2026-01-17 15:00:00'),
            tipo: 'AJUSTE',
            productoId: 'WK-002',
            cantidad: 50,
            userId: 1,
            area: 'Administración',
            observacion: 'Ajuste por inventario físico',
            documento: 'AJU-2026-001'
        }
    ]

    for (const movimiento of movimientos) {
        await prisma.movimientoHistorial.create({ data: movimiento })
        console.log(`  ✓ Created movement: #${movimiento.id} - ${movimiento.tipo}`)
    }

    console.log('\n✅ Database seed completed successfully!\n')
}

main()
    .catch((e) => {
        console.error('\n❌ Error during seed:')
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
