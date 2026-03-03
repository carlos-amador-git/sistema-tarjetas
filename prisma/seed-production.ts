/**
 * Seed de Producción - CardSystem
 *
 * Este script crea solo los datos mínimos necesarios para iniciar el sistema:
 * - Un usuario administrador inicial
 *
 * La contraseña del admin se genera aleatoriamente y se muestra en consola.
 * IMPORTANTE: Guardar la contraseña mostrada y cambiarla después del primer login.
 */

import { PrismaClient } from '@prisma/client'
import nodeCrypto from 'crypto'
// Importación directa de bcryptjs para evitar dependencias relativas complejas en Docker standalone
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}

const prisma = new PrismaClient()

// Generar contraseña aleatoria segura
function generateSecurePassword(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
        password += chars.charAt(nodeCrypto.randomInt(0, chars.length))
    }
    return password
}

async function main() {
    console.log('')
    console.log('=============================================')
    console.log('  CardSystem - Production Seed')
    console.log('=============================================')
    console.log('')

    // Verificar si ya existe un usuario admin
    const existingAdmin = await prisma.user.findFirst({
        where: { username: 'admin' }
    })

    if (existingAdmin) {
        console.log('Admin user already exists. Skipping seed.')
        console.log('')
        return
    }

    // Generar contraseña para el admin
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || generateSecurePassword()
    const hashedPassword = await hashPassword(adminPassword)

    // Crear usuario administrador
    console.log('Creating admin user...')

    await prisma.user.create({
        data: {
            id: 1,
            nombre: 'Administrador',
            username: 'admin',
            email: 'admin@cardsystem.local',
            password: hashedPassword,
            rol: 'Administrador',
            area: 'Sistemas',
            activo: true,
            ultimoAcceso: null
        }
    })

    console.log('')
    console.log('=============================================')
    console.log('  ADMIN USER CREATED SUCCESSFULLY')
    console.log('=============================================')
    console.log('')
    console.log('  Username: admin')
    console.log(`  Password: ${adminPassword}`)
    console.log('')
    console.log('  IMPORTANT: Save this password and change it')
    console.log('  after your first login!')
    console.log('')
    console.log('=============================================')
    console.log('')
}

main()
    .catch((e) => {
        console.error('')
        console.error('ERROR during production seed:')
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
