/**
 * Seed de Producción - CardSystem
 *
 * Crea o actualiza los usuarios del sistema con sus credenciales definidas.
 * Usa upsert para que cada redeploy garantice que los passwords son correctos.
 */

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error("DATABASE_URL no está definida");
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
    adapter,
    log: ['error'],
})

const SALT_ROUNDS = 10

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}

// ─── Usuarios del sistema ────────────────────────────────────────────────────
const USERS = [
    {
        id: 1,
        nombre: 'Administrador',
        username: 'admin',
        email: 'admin@cardsystem.local',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        rol: 'Administrador',
        area: 'Sistemas',
    },
    {
        id: 2,
        nombre: 'Almacén',
        username: 'tsys_user',
        email: 'almacen@cardsystem.local',
        password: process.env.ALMACEN_PASSWORD || 'tsys123',
        rol: 'Almacén',
        area: 'Almacén',
    },
    {
        id: 3,
        nombre: 'Logística',
        username: 'dist_user',
        email: 'logistica@cardsystem.local',
        password: process.env.LOGISTICA_PASSWORD || 'dist123',
        rol: 'Logística',
        area: 'Logística',
    },
    {
        id: 4,
        nombre: 'Sucursales',
        username: 'mod_user',
        email: 'sucursales@cardsystem.local',
        password: process.env.SUCURSALES_PASSWORD || 'mod123',
        rol: 'Sucursales',
        area: 'Sucursales',
    },
    {
        id: 5,
        nombre: 'Consulta',
        username: 'director',
        email: 'director@cardsystem.local',
        password: process.env.CONSULTA_PASSWORD || 'dir123',
        rol: 'Consulta',
        area: 'Dirección',
    },
]

async function main() {
    console.log('🚀 Iniciando Seed de Producción...');

    for (const user of USERS) {
        const hashedPassword = await hashPassword(user.password)

        await prisma.user.upsert({
            where: { username: user.username },
            update: {
                password: hashedPassword,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                area: user.area,
                activo: true,
            },
            create: {
                id: user.id,
                nombre: user.nombre,
                username: user.username,
                email: user.email,
                password: hashedPassword,
                rol: user.rol,
                area: user.area,
                activo: true,
            },
        })

        console.log(`✅ Usuario listo: ${user.username} (${user.rol})`)
    }

    console.log('');
    console.log('=============================================');
    console.log('  USUARIOS DEL SISTEMA');
    console.log('=============================================');
    console.log('  Rol          | Username    | Password');
    console.log('  -------------|-------------|----------');
    for (const u of USERS) {
        console.log(`  ${u.rol.padEnd(13)}| ${u.username.padEnd(12)}| ${u.password}`)
    }
    console.log('=============================================');
}

main()
    .catch((e) => {
        console.error('🔴 SEED FAILED:', e.message);
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
