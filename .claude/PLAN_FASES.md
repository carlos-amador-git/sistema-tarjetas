# Plan de Fases y Sprints - CardSystem

> Generado: 2026-01-22 | Método: Sequential Thinking

---

## Estado Actual

| Métrica | Valor |
|---------|-------|
| Sprints completados | 7-13 |
| Tests | 667 (100% passing) |
| Coverage | 50.66% |
| E2E | 16/16 passing |
| Bundle | 2.8 MB |
| Build | ✅ Exitoso |

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

### Sprint 14: Consolidación Git 🔄
**Agente:** Bash / general
**Objetivo:** Repositorio completo y sincronizado

| Tarea | Descripción |
|-------|-------------|
| 14.1 | Commit completo de archivos del proyecto |
| 14.2 | Actualizar context.json con estado real |
| 14.3 | Push a origin/main |
| 14.4 | Verificar .gitignore apropiado |
| 14.5 | Verificar repo limpio y funcional |

**Entregable:** Repositorio Git completo

---

## Fase 4 - Integración

### Sprint 15: API Real con Prisma
**Agentes:** `database-expert`, `crud-expert`
**Objetivo:** Backend funcional con datos persistentes

| Tarea | Descripción |
|-------|-------------|
| 15.1 | Auditar rutas API existentes |
| 15.2 | Conectar /api/auth/* con Prisma User |
| 15.3 | Conectar /api/productos con Producto |
| 15.4 | Conectar /api/balance con BalanceProducto |
| 15.5 | Conectar /api/capturas con Captura |
| 15.6 | Migrar stores de mockData a API calls |

**Entregable:** API conectada a Prisma

### Sprint 16: Validación E2E
**Agente:** `testing-expert`
**Objetivo:** Suite E2E validando integración real

| Tarea | Descripción |
|-------|-------------|
| 16.1 | Tests E2E con datos reales |
| 16.2 | Flujo completo: Login → Captura → Balance |
| 16.3 | Tests de roles y permisos |
| 16.4 | Performance testing básico |

**Entregable:** E2E con backend real

### Sprint 17: Monitoreo
**Agentes:** `security-expert`, `deploy-expert`
**Objetivo:** Sistema observable

| Tarea | Descripción |
|-------|-------------|
| 17.1 | Verificar configuración Sentry |
| 17.2 | Implementar health checks |
| 17.3 | Configurar alertas de errores |
| 17.4 | Dashboard de métricas básico |

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
