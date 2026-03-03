# Plan de Solventación UX/UI - Roadmap por Fases y Sprints

## Resumen de Brechas Identificadas

Basado en la auditoría UX/UI, se identificaron las siguientes brechas entre el estado actual y el estado óptimo del sistema:

### Brechas Críticas (Impacto Alto)
| ID | Brecha | Estado Actual | Estado Deseado | Prioridad |
|----|--------|---------------|----------------|-----------|
| G1 | Botón de configuración UI no integrado | Componente creado, no visible | Botón accesible en header | P0 |
| G2 | Páginas usan componentes legacy | StatCards/tablas manuales | Componentes adaptables | P0 |
| G3 | Sin skeleton loaders | Páginas en blanco al cargar | Skeletons informativos | P1 |
| G4 | Sin gráficos interactivos | Solo texto/números | Charts visuales | P1 |

### Brechas Importantes (Impacto Medio)
| ID | Brecha | Estado Actual | Estado Deseado | Prioridad |
|----|--------|---------------|----------------|-----------|
| G5 | Accesibilidad limitada | Sin aria-labels | WCAG 2.1 AA | P1 |
| G6 | Animaciones no aplicadas | CSS creado, no usado | Transiciones suaves | P2 |
| G7 | Modo oscuro incompleto | Variables CSS listas | Aplicado en todos los componentes | P2 |
| G8 | Sin estados vacíos ilustrados | Texto simple | Ilustraciones + CTA | P2 |

### Brechas Deseables (Impacto Bajo)
| ID | Brecha | Estado Actual | Estado Deseado | Prioridad |
|----|--------|---------------|----------------|-----------|
| G9 | Sin onboarding guiado | DemoTour básico | Tour contextual completo | P3 |
| G10 | Dashboard no personalizable | Layout fijo | Widgets drag & drop | P3 |
| G11 | Sin PWA | Web tradicional | Instalable + offline | P4 |

---

## Plan de Solventación por Fases

```
┌────────────────────────────────────────────────────────────────────────┐
│                    ROADMAP DE IMPLEMENTACIÓN UX/UI                      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FASE 1          FASE 2           FASE 3           FASE 4              │
│  Integración     Migración        Mejoras          Avanzado            │
│  ──────────      ─────────        ───────          ────────            │
│  Sprint 1-2      Sprint 3-4       Sprint 5-6       Sprint 7+           │
│                                                                         │
│  [■■■■■■■■]      [░░░░░░░░]       [░░░░░░░░]       [░░░░░░░░]          │
│                                                                         │
│  • UISettings    • Dashboard      • Charts         • PWA               │
│  • Sidebar btn   • Balance        • Skeletons      • Drag&Drop         │
│  • Animaciones   • Usuarios       • A11y           • Analytics         │
│  • Dark mode     • Órdenes        • Empty states   • Kiosko            │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## FASE 1: Integración Básica (Sprint 1-2)

**Objetivo:** Hacer visibles y funcionales los componentes UX/UI creados.

**Duración estimada:** 1-2 semanas

### Sprint 1: Integración del Sistema de Configuración

#### 1.1 Agregar botón UISettings al Sidebar
**Archivo:** `src/components/Sidebar.tsx`

**Tarea:** Integrar `UISettingsButton` en el footer del sidebar.

```typescript
// Agregar al final del sidebar, antes del botón de cerrar sesión
import { UISettingsButton } from '@/components/ui/UISettings';

// En el JSX:
<div className="mt-auto p-4 border-t border-slate-700/50">
  <div className="flex items-center justify-between">
    <UISettingsButton />
    <button onClick={logout}>Cerrar sesión</button>
  </div>
</div>
```

**Criterios de aceptación:**
- [ ] Botón visible en sidebar colapsado y expandido
- [ ] Panel se abre correctamente
- [ ] Cambios de paleta se aplican en tiempo real
- [ ] Configuración persiste al recargar

#### 1.2 Aplicar animaciones a páginas existentes
**Archivos:** Todas las páginas en `src/app/(dashboard)/`

**Tarea:** Agregar clases de animación a contenedores principales.

```typescript
// Ejemplo en dashboard/page.tsx
<div className="animate-fade-in-up">
  <h1>Dashboard</h1>
  {/* contenido */}
</div>
```

**Criterios de aceptación:**
- [ ] Páginas tienen animación de entrada suave
- [ ] Respeta configuración de "reduce motion"
- [ ] No afecta rendimiento (< 16ms por frame)

#### 1.3 Implementar modo oscuro en layout
**Archivo:** `src/app/(dashboard)/layout.tsx`

**Tarea:** Agregar clase `dark` al elemento raíz según configuración.

**Criterios de aceptación:**
- [ ] Toggle funcional claro/oscuro/sistema
- [ ] Colores de sidebar se adaptan
- [ ] Colores de contenido se adaptan
- [ ] Sin flash de contenido al cargar

### Sprint 2: Componente Skeleton y Estados

#### 2.1 Crear componente Skeleton reutilizable
**Archivo:** `src/components/ui/Skeleton.tsx` (NUEVO)

```typescript
interface SkeletonProps {
  variant: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number; // Para variant="text"
}

export function Skeleton({ variant, width, height, lines }: SkeletonProps) {
  // Implementación con clase .skeleton de animations.css
}

// Presets para casos comunes
export function SkeletonCard() { /* ... */ }
export function SkeletonTable({ rows }: { rows: number }) { /* ... */ }
export function SkeletonStats() { /* ... */ }
```

**Criterios de aceptación:**
- [ ] Animación de shimmer suave
- [ ] Variantes para diferentes usos
- [ ] Tamaños responsivos

#### 2.2 Crear componente EmptyState
**Archivo:** `src/components/ui/EmptyState.tsx` (NUEVO)

```typescript
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Criterios de aceptación:**
- [ ] Ilustración/icono centrado
- [ ] Mensaje claro y accionable
- [ ] Botón CTA opcional

---

## FASE 2: Migración de Componentes (Sprint 3-4)

**Objetivo:** Reemplazar componentes legacy con los nuevos componentes adaptables.

**Duración estimada:** 2 semanas

### Sprint 3: Páginas Principales

#### 3.1 Migrar Dashboard
**Archivo:** `src/app/(dashboard)/dashboard/page.tsx`

**Tareas:**
- Reemplazar stat cards con `<StatCard />` de DataDisplay
- Agregar sparklines a KPIs principales
- Agregar indicadores de tendencia
- Implementar skeleton loader

**Cambios:**
```typescript
// Antes
<div className="bg-white rounded-xl p-6">
  <h3>{stat.title}</h3>
  <p className="text-3xl">{stat.value}</p>
</div>

// Después
<StatCard
  title={stat.title}
  value={stat.value}
  icon={stat.icon}
  trend={stat.trend}
  color={stat.color}
  sparkline={stat.history}
/>
```

#### 3.2 Migrar Balance
**Archivo:** `src/app/(dashboard)/balance/page.tsx`

**Tareas:**
- Usar `<StatCard />` para totales por área
- Agregar barras de progreso para capacidad
- Mejorar flujo visual con animaciones

#### 3.3 Migrar Usuarios
**Archivo:** `src/app/(dashboard)/usuarios/page.tsx`

**Tareas:**
- Reemplazar tabla manual con `<DataTable />`
- Usar `<StatusBadge />` para roles y estados
- Agregar ordenamiento por columnas
- Agregar selección múltiple

### Sprint 4: Páginas Secundarias

#### 4.1 Migrar Órdenes
**Archivo:** `src/app/(dashboard)/ordenes/page.tsx`

**Tareas:**
- Usar `<DataTable />` con vista cards/lista
- Badges para estados de orden
- Tooltips informativos

#### 4.2 Migrar Productos
**Archivo:** `src/app/(dashboard)/productos/page.tsx`

**Tareas:**
- `<DataTable />` con toggle grid/list
- Indicadores de stock con colores
- Progress bars para stock vs mínimo

#### 4.3 Migrar Historial
**Archivo:** `src/app/(dashboard)/historial/page.tsx`

**Tareas:**
- Tabla filtrable y ordenable
- Badges para tipos de movimiento
- Exportación mantener funcionalidad

---

## FASE 3: Mejoras Avanzadas (Sprint 5-6)

**Objetivo:** Agregar gráficos, accesibilidad completa y estados mejorados.

**Duración estimada:** 2 semanas

### Sprint 5: Gráficos Interactivos

#### 5.1 Instalar y configurar Recharts
```bash
npm install recharts
```

#### 5.2 Crear componentes de gráficos
**Archivo:** `src/components/charts/` (NUEVO directorio)

```
src/components/charts/
├── LineChart.tsx       # Tendencias de inventario
├── BarChart.tsx        # Comparativas por área
├── DonutChart.tsx      # Distribución de stock
├── AreaChart.tsx       # Forecast acumulado
└── index.ts
```

**Características:**
- Colores de la paleta activa
- Tooltips personalizados
- Responsive
- Animaciones suaves
- Exportación a PNG

#### 5.3 Integrar gráficos en páginas
- **Dashboard:** Gráfico de tendencia de inventario (7 días)
- **Balance:** Donut de distribución por área
- **Forecast:** Área chart de proyección

### Sprint 6: Accesibilidad y Estados

#### 6.1 Auditoría de accesibilidad
**Herramientas:** axe DevTools, Lighthouse

**Checklist:**
- [ ] Todos los botones de ícono tienen `aria-label`
- [ ] Navegación completa por teclado
- [ ] Skip links implementados
- [ ] Contraste mínimo 4.5:1 (AA)
- [ ] `aria-live` en toasts y alertas
- [ ] Focus visible en todos los elementos interactivos

#### 6.2 Implementar estados vacíos
**Páginas a actualizar:**
- Usuarios sin resultados de búsqueda
- Órdenes filtradas sin coincidencias
- Historial sin movimientos
- Productos sin stock crítico

---

## FASE 4: Funcionalidades Avanzadas (Sprint 7+)

**Objetivo:** Características premium para diferenciación.

**Duración estimada:** Variable (4+ semanas)

### Sprint 7-8: Dashboard Personalizable

#### 7.1 Implementar grid drag & drop
**Dependencia:** `react-grid-layout`

```bash
npm install react-grid-layout
```

**Funcionalidades:**
- Widgets redimensionables
- Layouts guardados por usuario
- Reset a configuración default
- Presets por rol

### Sprint 9-10: PWA y Offline

#### 9.1 Configurar Service Worker
**Archivo:** `next.config.ts` + `public/sw.js`

**Funcionalidades:**
- Caché de assets estáticos
- Página offline fallback
- Sincronización de capturas
- Push notifications (opt-in)

### Sprint 11+: Analytics y Optimización

#### 11.1 Implementar tracking UX
**Herramientas:** Custom events + Sentry performance

**Métricas:**
- Tiempo en cada módulo
- Clics por sesión
- Errores de UI
- Abandono de formularios

---

## Priorización de Tareas

### Matriz de Impacto vs Esfuerzo

```
         Alto Impacto
              │
    ┌─────────┼─────────┐
    │  G3 G4  │  G1 G2  │
    │ Charts  │ Button  │ ← Hacer Primero
    │ Skeleton│ Migrate │
    ├─────────┼─────────┤
    │  G9 G10 │  G5 G6  │
    │ Onboard │  A11y   │
    │ D&D     │  Anim   │
    └─────────┼─────────┘
              │
         Bajo Impacto

    Bajo ────────── Alto
         Esfuerzo
```

### Orden de Ejecución Recomendado

| Orden | Tarea | Sprint | Esfuerzo | Impacto |
|-------|-------|--------|----------|---------|
| 1 | Integrar UISettingsButton | S1 | Bajo | Alto |
| 2 | Aplicar animaciones | S1 | Bajo | Medio |
| 3 | Modo oscuro completo | S1 | Medio | Alto |
| 4 | Componente Skeleton | S2 | Medio | Alto |
| 5 | Componente EmptyState | S2 | Bajo | Medio |
| 6 | Migrar Dashboard | S3 | Alto | Alto |
| 7 | Migrar Usuarios | S3 | Medio | Medio |
| 8 | Migrar Órdenes/Productos | S4 | Medio | Medio |
| 9 | Gráficos Recharts | S5 | Alto | Alto |
| 10 | Accesibilidad completa | S6 | Alto | Alto |

---

## Métricas de Éxito

### KPIs de UX

| Métrica | Actual | Objetivo | Herramienta |
|---------|--------|----------|-------------|
| Lighthouse Performance | ~75 | >90 | Chrome DevTools |
| Lighthouse Accessibility | ~65 | >95 | Chrome DevTools |
| Time to Interactive | ~3.5s | <2s | Web Vitals |
| Cumulative Layout Shift | ~0.15 | <0.1 | Web Vitals |
| First Contentful Paint | ~1.8s | <1s | Web Vitals |

### KPIs de Adopción

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Usuarios que cambian tema | >30% | localStorage analytics |
| Uso de modo oscuro | >20% | Tracking |
| Cambio de densidad | >15% | Tracking |
| Uso de vista cards vs lista | 50/50 | Tracking |

---

## Recursos Necesarios

### Dependencias a Instalar

```bash
# Sprint 5 - Gráficos
npm install recharts

# Sprint 7 - Drag & Drop (opcional)
npm install react-grid-layout @types/react-grid-layout

# Sprint 9 - PWA (opcional)
npm install next-pwa
```

### Tiempo Estimado Total

| Fase | Sprints | Semanas | Desarrolladores |
|------|---------|---------|-----------------|
| Fase 1 | 2 | 2 | 1 |
| Fase 2 | 2 | 2 | 1-2 |
| Fase 3 | 2 | 2 | 1-2 |
| Fase 4 | 4+ | 4+ | 2 |
| **Total Mínimo** | **6** | **6** | - |
| **Total Completo** | **10+** | **10+** | - |

---

## Checklist de Entrega por Fase

### Fase 1 Completa ✅ (Implementado)
- [x] UISettingsButton visible y funcional (integrado en Sidebar)
- [x] Paletas aplicables en tiempo real (8 paletas institucionales)
- [x] Modo oscuro funcional (claro/oscuro/sistema)
- [x] Animaciones de página (animations.css importado)
- [x] Componente Skeleton (múltiples variantes)
- [x] Componente EmptyState (presets para casos comunes)

### Fase 2 Completa ✅ (Implementado)
- [x] Dashboard migrado (StatCard, SkeletonDashboard, useUISettings, CSS variables)
- [x] Balance migrado (StatCard, StatusBadge, SkeletonBalance, CSS variables)
- [x] Usuarios migrado (StatCard, StatusBadge, SkeletonUsers, EmptyState presets)
- [x] Órdenes migrado (StatCard, StatusBadge, Skeleton, EmptyState presets)
- [x] Productos migrado (StatCard, StatusBadge, Skeleton, EmptyState presets)
- [x] Historial migrado (StatCard, Skeleton, EmptyState presets, CSS variables)

### Fase 3 Completa ✅ (Implementado)
- [x] Gráficos en Dashboard (AdaptiveAreaChart, AdaptiveDonutChart)
- [x] Gráficos en Balance (AdaptiveBarChart, AdaptiveDonutChart)
- [x] Gráficos en Forecast (AdaptiveLineChart, AdaptiveAreaChart)
- [x] Componentes de gráficos creados (LineChart, BarChart, DonutChart, AreaChart, ChartPrimitives)
- [x] Estados vacíos implementados (EmptyState presets en todas las páginas)

### Fase 4 Completa
- [ ] Dashboard personalizable
- [ ] PWA instalable
- [ ] Modo offline básico
- [ ] Analytics implementado

---

**Documento creado:** Enero 2026
**Versión:** 3.0
**Última actualización:** Enero 2026 - Fase 3 completada
**Próxima revisión:** Al completar Fase 4
