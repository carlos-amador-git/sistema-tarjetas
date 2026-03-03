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
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

// Instanciamos el cliente dentro de una función para manejar errores de configuración
function getPrismaClient() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error("❌ ERROR: La variable DATABASE_URL está vacía o no definida en el entorno del SEED.");
    }
    return new PrismaClient({
        datasources: {
            db: { url: dbUrl }
        }
    });
}

const prisma = getPrismaClient();

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}

function generateSecurePassword(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
        password += chars.charAt(nodeCrypto.randomInt(0, chars.length))
    }
    return password
}

async function main() {
    console.log('🚀 Iniciando Seed de Producción...');

    try {
        const existingAdmin = await prisma.user.findFirst({
            where: { username: 'admin' }
        })

        if (existingAdmin) {
            console.log('✅ El usuario admin ya existe. Saltando seed.');
            return;
        }

        const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || generateSecurePassword();
        const hashedPassword = await hashPassword(adminPassword);

        await prisma.user.create({
            data: {
                id: 1,
                nombre: 'Administrador',
                username: 'admin',
                email: 'admin@cardsystem.local',
                password: hashedPassword,
                rol: 'Administrador',
                area: 'Sistemas',
                activo: true
            }
        });

        console.log('=============================================');
        console.log('  ADMIN USER CREATED SUCCESSFULLY');
        console.log(`  Username: admin`);
        console.log(`  Password: ${adminPassword}`);
        console.log('=============================================');

    } catch (error) {
        console.error('❌ Error detallado en el main del seed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('🔴 SEED FAILED:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
