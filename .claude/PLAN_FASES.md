# Plan de Fases y Sprints - CardSystem

> Generado: 2026-01-22 | Método: Sequential Thinking

---

## Estado Actual

| Métrica | Valor |
|---------|-------|
| Sprints completados | 7-17 |
| Tests | 654 (100% passing) |
| Coverage | 50.66% |
| E2E | 108/108 passing |
| Bundle | 2.8 MB |
| Build | ✅ Exitoso |
| API | ✅ Conectada a Prisma |
| Monitoreo | ✅ Sentry + Health + Metrics |

---

## Fase 3 - Calidad (Completando)

### Sprint 12: Testing Completo ✅
- [x] Tests unitarios
- [x] Coverage 50%+
- [x] E2E con Playwright

### Sprint 13: Optimización ✅
- [x] Análisis de bundle
- [x] Evaluación lazy loading
- [x] Documentación de agentes

### Sprint 14: Consolidación Git ✅
**Agente:** Bash / general
**Completado:** 2026-01-22

- [x] Commit completo de archivos del proyecto
- [x] Actualizar context.json con estado real
- [x] Push a origin/main
- [x] Verificar .gitignore apropiado
- [x] Verificar repo limpio y funcional

**Entregable:** Repositorio Git completo - commit b3176fa

---

## Fase 4 - Integración

### Sprint 15: API Real con Prisma ✅
**Agentes:** `database-expert`, `crud-expert`
**Completado:** 2026-01-22

- [x] Auditar rutas API existentes
- [x] Conectar /api/auth/* con Prisma User (ya estaba)
- [x] Crear /api/productos (CRUD)
- [x] Crear /api/balance (GET, PUT por productoId)
- [x] Crear /api/historial (GET, POST)
- [x] Crear /api/ordenes (CRUD)
- [x] Seed database con datos iniciales

**Entregable:** API conectada a Prisma - commit 42ffeb2

### Sprint 16: Validación E2E ✅
**Agentes:** `testing-expert`, `crud-expert`
**Completado:** 2026-01-22

- [x] Migrar useQueries.ts de stores a API client
- [x] Actualizar tests de useQueries para mockear APIs
- [x] Corregir E2E tests para rate limit responses
- [x] 108 E2E tests pasando (Chromium, Firefox, WebKit, Mobile)
- [x] 654 unit tests pasando

**Entregable:** E2E con backend real - commit a343cbb

### Sprint 17: Monitoreo ✅
**Agentes:** `security-expert`, `deploy-expert`
**Completado:** 2026-01-22

- [x] Verificar configuración Sentry (ya configurado correctamente)
- [x] Implementar /api/health endpoint
- [x] Crear lib/monitoring.ts con utilidades de captura
- [x] Implementar /api/metrics endpoint (admin only)
- [x] Agregar HEALTHCHECK al Dockerfile

**Entregable:** Sistema con observabilidad

---

## Fase 5 - Producción

### Sprint 18: Preparación Deploy
**Agente:** `deploy-expert`
**Objetivo:** Imagen Docker lista

| Tarea | Descripción |
|-------|-------------|
| 18.1 | Verificar Dockerfile |
| 18.2 | Variables de entorno producción |
| 18.3 | Build de producción exitoso |
| 18.4 | Test local con Docker |
| 18.5 | Scripts de migración BD |
| 18.6 | Documentar proceso deploy |

**Entregable:** Docker image lista

### Sprint 19: Deploy Antigravity
**Agente:** `deploy-expert`
**Objetivo:** Sistema en producción

| Tarea | Descripción |
|-------|-------------|
| 19.1 | Configurar acceso Antigravity |
| 19.2 | Ejecutar deploy-antigravity.sh |
| 19.3 | Verificar healthcheck |
| 19.4 | Configurar dominio/SSL |
| 19.5 | Smoke tests producción |
| 19.6 | Documentar rollback plan |

**Entregable:** Sistema en producción

### Sprint 20: Documentación y Handoff
**Agente:** general
**Objetivo:** Proyecto transferible

| Tarea | Descripción |
|-------|-------------|
| 20.1 | README completo |
| 20.2 | Documentación API (OpenAPI) |
| 20.3 | Guía de administración |
| 20.4 | Guía de troubleshooting |
| 20.5 | context.json final |
| 20.6 | Sesión de handoff |

**Entregable:** Documentación completa

---

## Resumen Visual

```
FASE 3 - CALIDAD          FASE 4 - INTEGRACIÓN       FASE 5 - PRODUCCIÓN
┌─────────────────┐       ┌─────────────────┐        ┌─────────────────┐
│ Sprint 12 ✅    │       │ Sprint 15       │        │ Sprint 18       │
│ Sprint 13 ✅    │──────▶│ Sprint 16       │───────▶│ Sprint 19       │
│ Sprint 14 🔄    │       │ Sprint 17       │        │ Sprint 20       │
└─────────────────┘       └─────────────────┘        └─────────────────┘
     Testing              API + Validación            Deploy + Docs
```

---

## Dependencias Críticas

```
Sprint 14 (Git) ─────┬────▶ Sprint 15 (API)
                     │            │
                     │            ▼
                     │      Sprint 16 (E2E)
                     │            │
                     │            ▼
                     │      Sprint 17 (Monitor)
                     │            │
                     └────────────┼────▶ Sprint 18 (Docker)
                                  │            │
                                  │            ▼
                                  │      Sprint 19 (Deploy)
                                  │            │
                                  │            ▼
                                  └─────▶ Sprint 20 (Docs)
```

---

## Mapeo Agente → Sprint

| Agente | Sprints |
|--------|---------|
| `testing-expert` | 16 |
| `database-expert` | 15 |
| `crud-expert` | 15 |
| `security-expert` | 17 |
| `deploy-expert` | 17, 18, 19 |
| `tenant-expert` | (post-deploy si necesario) |
| `inventory-expert` | (mantenimiento) |

---

## Comando de Activación por Sprint

```bash
# Sprint 14
"Continúa con Sprint 14: Consolidación Git"

# Sprint 15
"Activa database-expert + crud-expert. Sprint 15: conectar API con Prisma"

# Sprint 16
"Activa testing-expert. Sprint 16: validación E2E con backend real"

# Sprint 17
"Activa security-expert + deploy-expert. Sprint 17: monitoreo y observabilidad"

# Sprint 18
"Activa deploy-expert. Sprint 18: preparar Docker para producción"

# Sprint 19
"Activa deploy-expert. Sprint 19: deploy a Antigravity"

# Sprint 20
"Sprint 20: documentación y handoff"
```

---

*Última actualización: 2026-01-22*
