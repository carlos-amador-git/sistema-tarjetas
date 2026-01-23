# Guía de Agentes - CardSystem

> **Referencia rápida para saber qué agente usar en cada situación**

---

## 1. TABLA DE DECISIÓN RÁPIDA

| ¿Qué necesito hacer? | Agente | Prompt de ejemplo |
|---------------------|--------|-------------------|
| Inicio de sesión / recuperar contexto | `ContextRecovery` | "Activa ContextRecovery y muéstrame el estado del proyecto" |
| Levantar el sistema desde cero | `SystemBootstrap` | "Activa SystemBootstrap para preparar el entorno" |
| Trabajar con balance/stock/capturas | `inventory-expert` | "Activa inventory-expert. Necesito agregar una nueva área al balance" |
| Autenticación/tokens/CSRF/rate limit | `security-expert` | "Activa security-expert. Revisa la configuración de rate limiting" |
| Escribir/arreglar tests | `testing-expert` | "Activa testing-expert. Sprint 12: mejorar coverage a 50%" |
| Crear formularios/CRUD/modales | `crud-expert` | "Activa crud-expert. Crear formulario de edición de órdenes" |
| Configurar tenants/branding | `tenant-expert` | "Activa tenant-expert. Agregar nuevo banco: Santander" |
| Desplegar/Docker/producción | `deploy-expert` | "Activa deploy-expert. Preparar para Antigravity" |
| Modificar schema/Prisma | `database-expert` | "Activa database-expert. Agregar campo 'activo' a Producto" |

---

## 2. HERRAMIENTAS MCP DISPONIBLES

Claude tiene acceso a herramientas especializadas via MCP (Model Context Protocol). **Estas deben usarse activamente**:

### 🧠 Sequential Thinking (`mcp__sequential-thinking__sequentialthinking`)

**Para qué sirve:** Razonamiento estructurado paso a paso en problemas complejos.

**Cuándo usarlo:**
- Análisis de errores de tests
- Debugging de problemas complejos
- Planificación de implementaciones
- Decisiones arquitectónicas
- Cualquier problema que requiera múltiples pasos de análisis

**Ejemplo de uso interno:**
```
Pensamiento 1/5: Analizar el error reportado...
Pensamiento 2/5: Identificar archivos involucrados...
Pensamiento 3/5: Formular hipótesis...
Pensamiento 4/5: Verificar hipótesis...
Pensamiento 5/5: Proponer solución...
```

### 📁 Filesystem (`mcp__filesystem__*`)

**Herramientas disponibles:**
- `read_text_file` - Leer archivos
- `write_file` - Escribir archivos
- `edit_file` - Editar archivos (reemplazo de texto)
- `list_directory` - Listar directorios
- `search_files` - Buscar archivos por patrón
- `directory_tree` - Ver estructura de directorios

### 🗃️ SQLite (`mcp__sqlite__*`)

**Para qué sirve:** Consultas directas a la base de datos dev.db

**Herramientas disponibles:**
- `read_query` - SELECT queries
- `write_query` - INSERT/UPDATE/DELETE
- `list_tables` - Listar tablas
- `describe_table` - Ver schema de tabla

**Ejemplo:**
```sql
-- Ver usuarios
SELECT * FROM User LIMIT 10;

-- Ver productos con bajo stock
SELECT * FROM BalanceProducto WHERE cantidad < 100;
```

### 🌐 Browser/Playwright (`mcp__MCP_DOCKER__browser_*`)

**Para qué sirve:** Automatización de navegador para tests E2E manuales

**Herramientas disponibles:**
- `browser_navigate` - Navegar a URL
- `browser_click` - Click en elementos
- `browser_type` - Escribir texto
- `browser_snapshot` - Captura de accesibilidad
- `browser_take_screenshot` - Screenshots

---

## 3. SISTEMA DE TAREAS

Claude debe usar el sistema de tareas para **trackear progreso** en trabajos complejos:

### TaskCreate
Crear nuevas tareas al inicio de un sprint o trabajo complejo.

```
TaskCreate:
  subject: "Mejorar coverage de src/lib/security"
  description: "Aumentar coverage de 63% a 80%"
  activeForm: "Mejorando coverage de security"
```

### TaskList
Ver todas las tareas y su estado.

### TaskUpdate
Actualizar estado de tareas:
- `pending` → `in_progress` (al comenzar)
- `in_progress` → `completed` (al terminar)

### Cuándo usar tareas:
- Sprints de testing
- Implementación de features multi-archivo
- Cualquier trabajo con más de 3 pasos
- Trabajo que puede interrumpirse

---

## 4. PROTOCOLO DE ACTIVACIÓN DE AGENTE

Cuando se active un agente, Claude DEBE seguir este protocolo:

### Paso 1: Declarar activación
```
🤖 Activando [nombre-agente]
```

### Paso 2: Usar Sequential Thinking para planificar
```
[Usar mcp__sequential-thinking para analizar la tarea]
```

### Paso 3: Crear tareas si es trabajo complejo
```
[Usar TaskCreate para cada subtarea identificada]
```

### Paso 4: Ejecutar con tracking
```
[Actualizar tareas con TaskUpdate mientras se avanza]
```

### Paso 5: Validar y reportar
```
[Ejecutar tests/verificaciones]
[Marcar tareas como completed]
[Reportar resultado]
```

### Ejemplo completo:
```
Usuario: "Activa testing-expert. Sprint 12: mejorar coverage"

Claude:
🤖 Activando testing-expert

[Sequential Thinking - Paso 1/4]
Analizando estado actual del coverage...

[TaskCreate]
- Tarea 1: Analizar coverage actual
- Tarea 2: Identificar archivos críticos < 50%
- Tarea 3: Escribir tests para archivos críticos
- Tarea 4: Verificar mejora de coverage

[TaskUpdate: Tarea 1 → in_progress]
Ejecutando npm run test:coverage...

[Continúa con el trabajo...]
```

---

## 5. FLOWCHART DE DECISIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│                    ¿QUÉ VOY A HACER?                            │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ¿Inicio de sesión?    ¿Levantar sistema?   ¿Tarea específica?
          │                   │                   │
          ▼                   ▼                   │
   ContextRecovery      SystemBootstrap          │
                                                  │
    ┌─────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                   TIPO DE TAREA                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ¿Balance, capturas, stock, movimientos?                      │
│       └──► inventory-expert                                   │
│                                                               │
│  ¿Login, tokens, CSRF, rate limit, auditoría?                 │
│       └──► security-expert                                    │
│                                                               │
│  ¿Tests, coverage, Jest, Playwright?                          │
│       └──► testing-expert + sequential-thinking               │
│                                                               │
│  ¿Formularios, modales, crear/editar/eliminar?                │
│       └──► crud-expert                                        │
│                                                               │
│  ¿Branding, multi-tenant, personalización?                    │
│       └──► tenant-expert                                      │
│                                                               │
│  ¿Docker, deploy, Antigravity, producción?                    │
│       └──► deploy-expert                                      │
│                                                               │
│  ¿Prisma, schema, migraciones, seed?                          │
│       └──► database-expert + mcp__sqlite                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 6. EJEMPLOS CONCRETOS POR TIPO DE TAREA

### 🔄 Inicio de Sesión / Recuperación
```
"Activa ContextRecovery y resúmeme en qué estábamos trabajando"
"Lee los archivos de contexto y dime el estado actual del proyecto"
```

### 🚀 Setup Inicial
```
"Activa SystemBootstrap para verificar que todo está listo"
"Necesito levantar el proyecto en una máquina nueva"
```

### 📦 Inventario y Balance
```
"Activa inventory-expert. Necesito agregar la subárea 'Devoluciones Express' a Logística"
"Activa inventory-expert. El balance no está sumando correctamente las capturas"
"Activa inventory-expert. Quiero exportar el historial de movimientos a Excel"
```

### 🔐 Seguridad
```
"Activa security-expert. Necesito implementar 2FA con authenticator"
"Activa security-expert. Hay un posible XSS en el formulario de productos"
"Activa security-expert. Revisa los logs de auditoría para login fallidos"
"Activa security-expert. Aumentar rate limit a 10 intentos/min"
```

### 🧪 Testing
```
"Activa testing-expert. Sprint 12: analizar coverage y crear plan"
"Activa testing-expert. Los tests de inventoryStore están fallando"
"Activa testing-expert. Necesito tests E2E para el flujo de login"
"Activa testing-expert. Mejorar coverage de src/lib/security a 80%"
```

### 📝 CRUD y Formularios
```
"Activa crud-expert. Crear formulario para nueva orden de compra"
"Activa crud-expert. Agregar validación de email único en usuarios"
"Activa crud-expert. El modal de editar producto no cierra correctamente"
"Activa crud-expert. Implementar eliminación en cascada de productos"
```

### 🏢 Multi-Tenant
```
"Activa tenant-expert. Agregar nuevo tenant: Banco Santander"
"Activa tenant-expert. Cambiar colores del tema para banco-ejemplo"
"Activa tenant-expert. Agregar feature flag para exportación Excel"
"Activa tenant-expert. Configurar logo y favicon por tenant"
```

### 🐳 Despliegue
```
"Activa deploy-expert. Preparar imagen Docker para producción"
"Activa deploy-expert. El healthcheck está fallando"
"Activa deploy-expert. Configurar variables de entorno para Antigravity"
"Activa deploy-expert. Hacer deploy a staging"
```

### 🗃️ Base de Datos
```
"Activa database-expert. Agregar campo 'fechaBaja' a Usuario"
"Activa database-expert. Crear migración para índices de rendimiento"
"Activa database-expert. El seed no está creando los productos correctamente"
"Activa database-expert. Agregar relación entre Orden y Producto"
```

---

## 7. PROMPT TEMPLATES (Copiar/Pegar)

### Template: Inicio de Sesión
```
Activa ContextRecovery.
Lee .claude/context.json y .claude/history.jsonl
Muéstrame:
1. Estado actual del proyecto
2. Última tarea en la que estábamos
3. Pendientes prioritarios
```

### Template: Sprint de Testing (COMPLETO)
```
Activa testing-expert. Sprint [N]: [Descripción]

Usa sequential-thinking para:
1. Analizar coverage actual (npm run test:coverage)
2. Identificar archivos con coverage < 50%
3. Priorizar por criticidad

Crea tareas con TaskCreate para cada archivo a mejorar.
Trackea progreso con TaskUpdate.

Meta: Alcanzar [X]% de coverage global
```

### Template: Nueva Funcionalidad de Inventario
```
Activa inventory-expert.

Necesito implementar: [Descripción de la funcionalidad]

Contexto:
- Área afectada: [Almacén/Logística/Sucursales/En Proceso]
- Tipo de movimiento: [Entrada/Salida/Transferencia]
- Requiere registro en historial: [Sí/No]

Archivos relevantes que debes revisar:
- src/stores/inventoryStore.ts
- src/data/mockData.ts
```

### Template: Revisión de Seguridad
```
Activa security-expert.

Revisar: [Componente/Flujo específico]

Checklist a verificar:
- [ ] XSS en inputs
- [ ] CSRF en forms
- [ ] Rate limiting
- [ ] Tokens seguros
- [ ] Logging de auditoría

Reporta vulnerabilidades encontradas y soluciones propuestas.
```

### Template: Nuevo Formulario CRUD
```
Activa crud-expert.

Crear formulario para: [Entidad]

Campos requeridos:
- [Campo 1]: [Tipo] - [Validación]
- [Campo 2]: [Tipo] - [Validación]
- ...

Comportamiento:
- Modal: [Sí/No]
- Notificación al guardar: [Tipo de toast]
- Redirección después: [Ruta]
```

### Template: Nuevo Tenant
```
Activa tenant-expert.

Agregar nuevo tenant: [Nombre del Banco]

Configuración:
- ID: [id-banco]
- Colores: Primary [#XXX], Secondary [#XXX]
- Logo: [URL o descripción]
- Features habilitadas: [Lista]

Crear archivos en:
- src/config/tenants/[id-banco].ts
- public/tenants/[id-banco]/
```

### Template: Deploy a Producción
```
Activa deploy-expert.

Preparar deploy a: [Antigravity/Otro]

Checklist pre-deploy:
1. [ ] Build exitoso (npm run build)
2. [ ] Tests pasando (npm test)
3. [ ] Variables de entorno configuradas
4. [ ] NEXT_PUBLIC_DEMO_MODE=false
5. [ ] Docker image construida

Ejecutar secuencia de deploy.
```

### Template: Modificación de Schema
```
Activa database-expert.

Modificar modelo: [Nombre del modelo]

Cambios:
- Agregar campo: [nombre] [tipo] [restricciones]
- Modificar campo: [nombre] → [nuevo tipo/restricción]
- Agregar relación: [Modelo A] → [Modelo B]

Después de modificar:
1. npm run db:generate
2. npm run db:push (dev) o db:migrate (prod)
3. Actualizar seed si es necesario
```

---

## 8. REGLAS DE ORO

1. **Siempre inicia con ContextRecovery** si es una nueva sesión
2. **Un agente a la vez** - no mezcles dominios en un mismo prompt
3. **Usa sequential-thinking** para problemas que requieren análisis
4. **Usa TaskCreate/TaskUpdate** para trabajos con más de 3 pasos
5. **Sé específico** - incluye nombres de archivos, líneas, errores exactos
6. **Proporciona contexto** - qué intentaste, qué esperabas, qué pasó
7. **Valida al final** - pide que ejecute tests o verificaciones
8. **Usa MCP tools** - SQLite para queries, filesystem para archivos

---

## 9. ARCHIVOS CLAVE POR AGENTE

| Agente | Archivos que domina |
|--------|---------------------|
| `inventory-expert` | `inventoryStore.ts`, `mockData.ts`, `balance/page.tsx`, `capturas/*` |
| `security-expert` | `rateLimit.ts`, `csrf.ts`, `sanitize.ts`, `auditLog.ts`, `auth/*` |
| `testing-expert` | `jest.config.js`, `playwright.config.ts`, `__tests__/**/*` |
| `crud-expert` | `forms/*.tsx`, `Modal.tsx`, `*Store.ts` |
| `tenant-expert` | `tenants/*.ts`, `useTenant.tsx`, `public/tenants/*` |
| `deploy-expert` | `Dockerfile`, `docker-compose.yml`, `scripts/*.sh` |
| `database-expert` | `schema.prisma`, `seed.ts`, `prisma.config.ts` |

---

## 10. COMANDOS ÚTILES POR AGENTE

### testing-expert
```bash
npm test                    # Ejecutar tests
npm run test:coverage       # Coverage completo
npm run e2e                 # Tests E2E
npm run e2e:ui              # E2E con UI
```

### deploy-expert
```bash
docker build -t cardsystem .           # Build imagen
docker run -p 3000:3000 cardsystem     # Ejecutar local
./scripts/deploy-antigravity.sh        # Deploy prod
```

### database-expert
```bash
npm run db:generate    # Generar cliente Prisma
npm run db:push        # Push schema (dev)
npm run db:migrate     # Migración (prod)
npm run db:studio      # UI de Prisma
npm run db:seed        # Seed datos
```

---

## 11. RESUMEN DE HERRAMIENTAS MCP

| Herramienta | Comando | Uso |
|-------------|---------|-----|
| Sequential Thinking | `mcp__sequential-thinking__sequentialthinking` | Razonamiento paso a paso |
| SQLite Read | `mcp__sqlite__read_query` | SELECT en dev.db |
| SQLite Write | `mcp__sqlite__write_query` | INSERT/UPDATE/DELETE |
| SQLite Tables | `mcp__sqlite__list_tables` | Listar tablas |
| File Read | `mcp__filesystem__read_text_file` | Leer archivos |
| File Write | `mcp__filesystem__write_file` | Escribir archivos |
| File Edit | `mcp__filesystem__edit_file` | Editar archivos |
| Browser Navigate | `mcp__MCP_DOCKER__browser_navigate` | Navegar URL |
| Browser Click | `mcp__MCP_DOCKER__browser_click` | Click elementos |
| Browser Screenshot | `mcp__MCP_DOCKER__browser_take_screenshot` | Capturas |

---

*Última actualización: 2026-01-22*
