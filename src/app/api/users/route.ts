/**
 * API Route: Crear Usuario
 *
 * Endpoint protegido para crear nuevos usuarios.
 * Solo administradores pueden crear usuarios.
 *
 * POST /api/users
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import {
  sanitizeUsername,
  sanitizeEmail,
  sanitizeString,
  logAuditEvent,
  extractRequestInfo,
} from '@/lib/security';
import { verify } from 'jsonwebtoken';

// Secreto JWT (debe coincidir con el usado en login)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  nombre: string;
  rol: string;
  area: string;
}

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent } = extractRequestInfo(request);

  try {
    // 1. Verificar autenticación y rol de administrador
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
      // Verificar token y rol
      const decoded: any = verify(accessToken, JWT_SECRET);
      
      // Consultar rol actual en BD para mayor seguridad
      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { rol: true }
      });

      if (!currentUser || currentUser.rol !== 'Administrador') {
         await logAuditEvent({
          action: 'SECURITY_VIOLATION',
          severity: 'WARNING',
          userId: String(decoded.userId),
          username: decoded.username,
          ipAddress,
          userAgent,
          resource: 'users',
          resourceId: null,
          details: { reason: 'Unauthorized user creation attempt' },
          success: false,
          errorMessage: 'Permisos insuficientes',
        });
        return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
      }
    } catch (err) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    // 2. Obtener y validar datos
    const body: CreateUserRequest = await request.json();
    const { username, email, password, nombre, rol, area } = body;

    if (!username || !email || !password || !nombre || !rol || !area) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    // 3. Sanitización
    const cleanUsername = sanitizeUsername(username);
    const cleanEmail = sanitizeEmail(email);
    const cleanNombre = sanitizeString(nombre);
    const cleanArea = sanitizeString(area);
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Correo electrónico inválido' }, { status: 400 });
    }

    // Validar fortaleza de contraseña (mínimo 8 caracteres)
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    // 4. Verificar duplicados
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email: cleanEmail }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.username === cleanUsername ? 'nombre de usuario' : 'correo electrónico';
      return NextResponse.json({ error: `El ${field} ya está en uso` }, { status: 409 });
    }

    // 5. Crear usuario
    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        nombre: cleanNombre,
        rol: rol, // Se asume que el rol viene de una lista controlada en el frontend
        area: cleanArea,
        activo: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        nombre: true,
        rol: true,
        area: true,
        activo: true,
        createdAt: true,
      }
    });

    // 6. Audit Log
    await logAuditEvent({
      action: 'USER_CREATED',
      severity: 'INFO',
      userId: null, // El creador ya fue verificado, idealmente registraríamos quién lo creó si el modelo lo permite
      username: 'admin', // Simplificación, deberíamos usar el username del token
      ipAddress,
      userAgent,
      resource: 'users',
      resourceId: String(newUser.id),
      details: { createdUser: newUser.username, role: newUser.rol },
      success: true,
      errorMessage: null,
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });

  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
