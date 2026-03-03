# API Reference - CardSystem

Documentación de los endpoints REST del sistema.

**Base URL**: `http://localhost:3000/api`

## Autenticación

Todas las rutas (excepto `/auth/login` y `/health`) requieren autenticación via cookies httpOnly.

### POST /auth/login

Iniciar sesión.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador",
    "rol": "admin",
    "area": "Administración",
    "activo": true,
    "twoFactorEnabled": false
  },
  "requiresTwoFactor": false
}
```

**Response 401:**
```json
{
  "error": "Credenciales inválidas"
}
```

**Response 429:**
```json
{
  "error": "Demasiados intentos. Intente en X segundos"
}
```

**Cookies establecidas:**
- `access_token` (httpOnly, 15min)
- `refresh_token` (httpOnly, 7 días)
- `user_info` (legible por JS)

---

### POST /auth/logout

Cerrar sesión.

**Response 200:**
```json
{
  "success": true
}
```

---

### POST /auth/refresh

Renovar access token usando refresh token.

**Response 200:**
```json
{
  "success": true
}
```

**Response 401:**
```json
{
  "error": "Refresh token inválido o expirado"
}
```

---

### GET /auth/session

Obtener sesión actual.

**Response 200:**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador",
    "rol": "admin",
    "area": "Administración"
  }
}
```

**Response 401:**
```json
{
  "authenticated": false
}
```

---

### GET /auth/csrf

Obtener token CSRF.

**Response 200:**
```json
{
  "csrfToken": "abc123..."
}
```

---

## 2FA (Two-Factor Authentication)

### GET /auth/2fa/status

Estado de 2FA del usuario.

**Response 200:**
```json
{
  "enabled": false,
  "hasBackupCodes": false
}
```

---

### POST /auth/2fa/setup

Iniciar configuración de 2FA.

**Response 200:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code": "data:image/png;base64,...",
  "backup_codes": ["12345678", "87654321", ...]
}
```

---

### POST /auth/2fa/enable

Activar 2FA después de verificar código.

**Request:**
```json
{
  "code": "123456"
}
```

**Response 200:**
```json
{
  "success": true,
  "backup_codes": ["12345678", ...]
}
```

---

### POST /auth/2fa/verify

Verificar código 2FA durante login.

**Request:**
```json
{
  "code": "123456"
}
```

**Response 200:**
```json
{
  "success": true,
  "user": { ... }
}
```

---

### POST /auth/2fa/disable

Desactivar 2FA.

**Request:**
```json
{
  "code": "123456"
}
```

**Response 200:**
```json
{
  "success": true
}
```

---

### POST /auth/2fa/regenerate-backup-codes

Regenerar códigos de respaldo.

**Request:**
```json
{
  "code": "123456"
}
```

**Response 200:**
```json
{
  "backup_codes": ["12345678", ...]
}
```

---

## Productos

### GET /productos

Listar todos los productos.

**Response 200:**
```json
[
  {
    "id": 1,
    "codigo": "VISA-ORO",
    "nombre": "Visa Oro",
    "descripcion": "Tarjeta Visa Oro Premium",
    "tipo": "DEBITO",
    "activo": true,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
]
```

---

### POST /productos

Crear producto (solo admin).

**Request:**
```json
{
  "codigo": "MC-PLAT",
  "nombre": "Mastercard Platinum",
  "descripcion": "Tarjeta premium",
  "tipo": "CREDITO"
}
```

**Response 201:**
```json
{
  "id": 2,
  "codigo": "MC-PLAT",
  ...
}
```

---

### GET /productos/[id]

Obtener producto por ID.

**Response 200:**
```json
{
  "id": 1,
  "codigo": "VISA-ORO",
  ...
}
```

---

### PUT /productos/[id]

Actualizar producto (solo admin).

**Request:**
```json
{
  "nombre": "Visa Oro Plus",
  "activo": true
}
```

---

### DELETE /productos/[id]

Eliminar producto (solo admin).

**Response 200:**
```json
{
  "success": true
}
```

---

## Balance (Inventario)

### GET /balance

Obtener balance de todos los productos.

**Query params:**
- `productoId` (opcional): Filtrar por producto

**Response 200:**
```json
[
  {
    "id": 1,
    "productoId": 1,
    "boveda": 1000,
    "workcenter": 500,
    "logistica": 200,
    "sucursales": 300,
    "enProceso": 50,
    "total": 2050,
    "producto": {
      "codigo": "VISA-ORO",
      "nombre": "Visa Oro"
    },
    "updatedAt": "2026-01-23T00:00:00Z"
  }
]
```

---

### GET /balance/[productoId]

Balance de un producto específico.

---

### PUT /balance/[productoId]

Actualizar balance (roles con permisos de captura).

**Request:**
```json
{
  "boveda": 1100,
  "workcenter": 450
}
```

---

## Historial

### GET /historial

Obtener movimientos históricos.

**Query params:**
- `productoId` (opcional)
- `tipo` (opcional): ENTRADA, SALIDA, AJUSTE
- `desde` (opcional): Fecha inicio
- `hasta` (opcional): Fecha fin
- `limit` (opcional, default: 100)

**Response 200:**
```json
[
  {
    "id": 1,
    "productoId": 1,
    "tipo": "ENTRADA",
    "cantidad": 100,
    "ubicacion": "boveda",
    "descripcion": "Recepción de lote",
    "usuarioId": 1,
    "createdAt": "2026-01-23T10:00:00Z",
    "producto": { ... },
    "usuario": { ... }
  }
]
```

---

### POST /historial

Registrar movimiento.

**Request:**
```json
{
  "productoId": 1,
  "tipo": "ENTRADA",
  "cantidad": 100,
  "ubicacion": "boveda",
  "descripcion": "Recepción de lote #123"
}
```

---

## Órdenes de Compra

### GET /ordenes

Listar órdenes.

**Query params:**
- `estatus` (opcional): PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA

**Response 200:**
```json
[
  {
    "id": 1,
    "numero": "OC-2026-001",
    "productoId": 1,
    "cantidad": 500,
    "estatus": "PENDIENTE",
    "proveedor": "VISA International",
    "fechaEstimada": "2026-02-15",
    "notas": "Urgente",
    "createdAt": "2026-01-20T00:00:00Z",
    "producto": { ... }
  }
]
```

---

### POST /ordenes

Crear orden (admin, almacen).

**Request:**
```json
{
  "productoId": 1,
  "cantidad": 500,
  "proveedor": "VISA International",
  "fechaEstimada": "2026-02-15",
  "notas": "Pedido urgente"
}
```

---

### GET /ordenes/[id]

Obtener orden por ID.

---

### PUT /ordenes/[id]

Actualizar orden.

**Request:**
```json
{
  "estatus": "EN_PROCESO",
  "notas": "En tránsito"
}
```

---

### DELETE /ordenes/[id]

Cancelar/eliminar orden (solo PENDIENTE).

---

## Sistema

### GET /health

Estado del sistema (público).

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-23T12:00:00Z",
  "version": "0.1.0",
  "environment": "production",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "up",
      "latencyMs": 5
    },
    "sentry": {
      "configured": true
    }
  }
}
```

---

### GET /metrics

Métricas del sistema (solo admin).

**Response 200:**
```json
{
  "timestamp": "2026-01-23T12:00:00Z",
  "system": {
    "uptime": 3600,
    "memory": {
      "used": 150000000,
      "total": 500000000
    }
  },
  "database": {
    "users": 5,
    "productos": 10,
    "ordenes": 25,
    "historial": 150
  },
  "api": {
    "requestsLastHour": 1500,
    "errorsLastHour": 2
  }
}
```

---

## Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 400 | Bad Request - datos inválidos |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 429 | Rate limit excedido |
| 500 | Error interno |

## Rate Limiting

- Login: 5 intentos por minuto
- API general: 100 requests por minuto
- Headers de respuesta: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Seguridad

- Todas las contraseñas hasheadas con bcrypt (cost 12)
- Tokens JWT con expiración corta (15min access, 7d refresh)
- Cookies httpOnly para tokens
- CSRF protection en mutaciones
- Rate limiting por IP y usuario
- Audit logging de acciones sensibles
