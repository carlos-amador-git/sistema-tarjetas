# Preparación para Auditoría de Seguridad

Este documento describe las medidas de seguridad implementadas y la preparación para una auditoría de seguridad externa.

## 1. Resumen de Controles de Seguridad Implementados

### Autenticación y Autorización

| Control | Estado | Descripción |
|---------|--------|-------------|
| Autenticación basada en JWT | ✅ | Tokens de acceso y refresh con expiración |
| 2FA (TOTP) | ✅ | Autenticación de dos factores compatible con Google Authenticator |
| Códigos de respaldo | ✅ | 10 códigos de un solo uso para recuperación |
| Cookies httpOnly | ✅ | Tokens almacenados en cookies seguras |
| Rate limiting | ✅ | Límite de intentos de login (5/minuto) |
| Bloqueo temporal | ✅ | Bloqueo progresivo después de intentos fallidos |
| CSRF Protection | ✅ | Tokens CSRF en operaciones sensibles |

### Seguridad de Datos

| Control | Estado | Descripción |
|---------|--------|-------------|
| HTTPS forzado | ✅ | Cookies con flag secure en producción |
| Sanitización de inputs | ✅ | Validación y escape de datos de entrada |
| SQL Injection Protection | ✅ | Uso de ORM (SQLAlchemy) con queries parametrizados |
| XSS Protection | ✅ | React escapa por defecto, CSP headers |
| Password hashing | ✅ | bcrypt con salt |

### Logging y Auditoría

| Control | Estado | Descripción |
|---------|--------|-------------|
| Audit logging | ✅ | Registro de acciones críticas |
| Error tracking | ✅ | Sentry para monitoreo de errores |
| IP logging | ✅ | Registro de IPs en intentos de login |

## 2. Checklist de Pre-Auditoría

### Configuración del Servidor

- [ ] HTTPS habilitado con certificado válido (TLS 1.2+)
- [x] Headers de seguridad configurados (en `next.config.ts`):
  - [x] `X-Content-Type-Options: nosniff`
  - [x] `X-Frame-Options: DENY`
  - [x] `X-XSS-Protection: 1; mode=block`
  - [x] `Strict-Transport-Security: max-age=31536000` (solo producción)
  - [x] `Content-Security-Policy` configurada
  - [x] `Referrer-Policy: strict-origin-when-cross-origin`
  - [x] `Permissions-Policy` restrictiva
- [x] Cookies con flags:
  - [x] `httpOnly`
  - [x] `secure` (en producción)
  - [x] `SameSite=Lax`
- [x] Variables de entorno sensibles no expuestas (NEXT_PUBLIC_ solo para cliente)

### Base de Datos

- [ ] PostgreSQL actualizado a última versión estable
- [ ] Conexiones encriptadas (SSL/TLS)
- [ ] Contraseña fuerte para DB user
- [ ] Principio de menor privilegio en permisos
- [ ] Backups configurados y probados
- [ ] Logs de queries lentas habilitados

### Código

- [x] No hay secrets hardcodeados (uso de variables de entorno)
- [x] No hay debug mode en producción (Sentry solo captura en prod)
- [!] Dependencias auditadas (ver nota sobre xlsx más abajo)
- [x] No hay console.log con datos sensibles (filtrado en Sentry)
- [x] Input validation en todos los endpoints (Zod schemas, Pydantic)

> **Nota sobre xlsx**: La librería `xlsx` tiene vulnerabilidades conocidas (Prototype Pollution, ReDoS).
> Sin embargo, en este proyecto solo se usa para **exportar** datos generados localmente, no para
> procesar archivos subidos por usuarios. El riesgo es bajo pero se recomienda migrar a
> `exceljs` o similar cuando haya una versión parcheada disponible.

### Infraestructura

- [ ] Firewall configurado
- [ ] Puertos innecesarios cerrados
- [ ] SSH con keys, no passwords
- [ ] Actualizaciones de seguridad aplicadas
- [ ] Segregación de red (frontend/backend/db)

## 3. Vulnerabilidades Conocidas y Mitigaciones

### OWASP Top 10 (2021)

| Vulnerabilidad | Mitigación |
|----------------|------------|
| A01: Broken Access Control | RBAC implementado, validación en backend |
| A02: Cryptographic Failures | bcrypt para passwords, HTTPS obligatorio |
| A03: Injection | SQLAlchemy ORM, input sanitization |
| A04: Insecure Design | Threat modeling, código revisado |
| A05: Security Misconfiguration | Headers seguros, no debug en prod |
| A06: Vulnerable Components | npm audit, actualizaciones regulares |
| A07: Auth Failures | 2FA, rate limiting, session management |
| A08: Data Integrity Failures | CSP headers, SRI para CDN |
| A09: Logging Failures | Audit log completo |
| A10: SSRF | No se aceptan URLs de usuarios |

## 4. Pruebas de Penetración Recomendadas

### Alcance Sugerido

1. **Autenticación**
   - Bypass de login
   - Bypass de 2FA
   - Session hijacking
   - Password brute force
   - Token manipulation

2. **Autorización**
   - Escalación de privilegios horizontal
   - Escalación de privilegios vertical
   - IDOR (Insecure Direct Object Reference)

3. **Inyección**
   - SQL Injection
   - XSS (Stored, Reflected, DOM)
   - Command Injection
   - LDAP Injection

4. **Lógica de Negocio**
   - Manipulación de parámetros
   - Race conditions
   - Business logic flaws

5. **Infraestructura**
   - Port scanning
   - Service enumeration
   - SSL/TLS configuration

### Herramientas Recomendadas

- **SAST**: SonarQube, Semgrep
- **DAST**: OWASP ZAP, Burp Suite
- **Dependency Check**: npm audit, Snyk
- **Secret Scanning**: GitLeaks, TruffleHog

## 5. Información para Auditores

### Endpoints Críticos

```
POST /api/auth/login          - Autenticación
POST /api/auth/2fa/verify     - Verificación 2FA
POST /api/auth/2fa/setup      - Configuración 2FA
GET  /api/auth/session        - Verificación de sesión
POST /api/auth/refresh        - Refresh token
POST /api/auth/logout         - Cierre de sesión
```

### Roles del Sistema

| Rol | Permisos |
|-----|----------|
| admin | Todos los módulos, gestión de usuarios |
| almacen | Capturas de almacén, consulta |
| logistica | Capturas de logística, consulta |
| sucursal | Capturas de sucursal, consulta |
| consulta | Solo lectura |

### Archivos de Configuración

```
/src/lib/security/           - Funciones de seguridad
/src/app/api/auth/           - API routes de autenticación
/backend/app/routers/auth.py - Endpoints de auth en backend
/backend/app/utils/security.py - Utilidades de seguridad
```

## 6. Contactos

Para coordinación de la auditoría:

- **Seguridad**: security@company.com
- **Desarrollo**: dev@company.com
- **Operaciones**: ops@company.com

## 7. Timeline Sugerido

| Fase | Duración | Descripción |
|------|----------|-------------|
| Planificación | 1 semana | Definir alcance, accesos |
| Auditoría | 2-3 semanas | Pruebas de penetración |
| Reporte | 1 semana | Documentación de hallazgos |
| Remediación | 2-4 semanas | Corrección de vulnerabilidades |
| Re-test | 1 semana | Verificación de correcciones |

## 8. Documentos Adicionales

- [DATABASE.md](./DATABASE.md) - Configuración de base de datos
- [MONITORING.md](./MONITORING.md) - Monitoreo y observabilidad
- [MULTI_TENANT.md](./MULTI_TENANT.md) - Arquitectura multi-tenant

---

**Última actualización**: Enero 2026
**Versión del documento**: 1.0
