'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Warehouse,
  ShoppingCart,
  CreditCard,
  Users,
  History,
  Download,
  Palette,
  Building2,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import {
  calcularResumenGlobal,
  calcularMetricasForecast,
  calcularEstadisticasOrdenes,
  PRODUCTOS,
  USUARIOS,
  HISTORIAL,
  ORDENES,
} from '@/data/mockData';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlights: string[];
  route?: string;
}

// Función que genera los pasos del tour con datos dinámicos
function generateTourSteps(): TourStep[] {
  // Calcular métricas desde datos centralizados
  const resumen = calcularResumenGlobal();
  const forecastMetrics = calcularMetricasForecast();
  const ordenesStats = calcularEstadisticasOrdenes();
  const costoTotalOrdenes = ORDENES.reduce((sum, o) => sum + o.costoTotal, 0);

  return [
    {
      id: 'welcome',
      title: 'Bienvenido a CardSystem',
      description: 'Sistema integral de gestión de inventario de tarjetas bancarias. Este recorrido le mostrará las principales funcionalidades del sistema.',
      icon: Play,
      highlights: [
        'Control total de inventario en tiempo real',
        'Múltiples áreas: Almacén, Logística, Sucursales',
        'Pronósticos inteligentes y alertas automáticas',
        'Exportación a Excel y PDF',
      ],
    },
    {
      id: 'dashboard',
      title: 'Dashboard Ejecutivo',
      description: 'Vista general del estado del inventario con métricas clave y alertas importantes.',
      icon: LayoutDashboard,
      highlights: [
        `Total de inventario: ${formatNumber(resumen.totalInventario)} unidades`,
        `Distribución: Almacén (${formatNumber(resumen.enAlmacen)}), Logística (${formatNumber(resumen.enLogistica)}), Sucursales (${formatNumber(resumen.enSucursales)})`,
        'Alertas de stock bajo',
        `${ordenesStats.pendientes} órdenes pendientes de aprobación`,
      ],
      route: '/dashboard',
    },
    {
      id: 'balance',
      title: 'Balance de Inventario',
      description: 'Vista consolidada del inventario por producto, mostrando el flujo desde almacén hasta sucursales.',
      icon: BarChart3,
      highlights: [
        'Visualización del flujo de inventario',
        'Desglose por área: Almacén, Logística, Sucursales',
        'Bóveda de trabajo y bóveda principal',
        'Exportación detallada del balance',
      ],
      route: '/balance',
    },
    {
      id: 'forecast',
      title: 'Pronóstico y Planeación',
      description: 'Proyecciones de demanda para los próximos 6 meses con alertas de stock bajo.',
      icon: TrendingUp,
      highlights: [
        'Proyección semestral por producto',
        'Tendencias de crecimiento/descenso',
        'Alertas automáticas de stock crítico',
        `${forecastMetrics.enCrecimiento} productos en crecimiento, ${forecastMetrics.conAlertas} con alertas`,
      ],
      route: '/forecast',
    },
    {
      id: 'capturas',
      title: 'Captura de Inventario',
      description: 'Registro de inventario físico por cada área del sistema.',
      icon: Warehouse,
      highlights: [
        'Captura Almacén: Bóveda de trabajo y principal',
        'Captura Logística: Colocación y envíos',
        'Captura Sucursales: Stock en puntos de venta',
        'Validación automática de datos',
      ],
      route: '/capturas/almacen',
    },
    {
      id: 'ordenes',
      title: 'Órdenes de Compra',
      description: 'Gestión completa del ciclo de adquisiciones de productos.',
      icon: ShoppingCart,
      highlights: [
        `${ordenesStats.total} órdenes (${ordenesStats.pendientes} Pendientes, ${ordenesStats.aprobadas} Aprobadas, ${ordenesStats.completadas} Completadas)`,
        'Flujo de aprobación configurable',
        `Costo total: $${formatNumber(costoTotalOrdenes)} en órdenes`,
        'Filtros por estado y búsqueda rápida',
      ],
      route: '/ordenes',
    },
    {
      id: 'productos',
      title: 'Catálogo de Productos',
      description: 'Administración del catálogo de tarjetas y productos relacionados.',
      icon: CreditCard,
      highlights: [
        `${PRODUCTOS.length} productos configurados`,
        'Categorías: Tarjetas, Kits, Etiquetas, Sobres',
        'Control de stock mínimo por producto',
        'Precios y estados configurables',
      ],
      route: '/productos',
    },
    {
      id: 'historial',
      title: 'Historial de Movimientos',
      description: 'Registro completo de todas las entradas, salidas y ajustes de inventario.',
      icon: History,
      highlights: [
        `${HISTORIAL.length} movimientos registrados`,
        'Tipos: Entrada, Salida, Ajuste',
        'Trazabilidad por usuario y documento',
        'Exportación a Excel y PDF',
      ],
      route: '/historial',
    },
    {
      id: 'usuarios',
      title: 'Gestión de Usuarios',
      description: 'Administración de usuarios con roles y permisos por área.',
      icon: Users,
      highlights: [
        `${USUARIOS.length} usuarios configurados`,
        'Roles: Admin, Almacén, Logística, Sucursales, Consulta',
        'Control de acceso por módulo',
        `${USUARIOS.filter(u => u.activo).length} activos, ${USUARIOS.filter(u => !u.activo).length} inactivos`,
      ],
      route: '/usuarios',
    },
    {
      id: 'export',
      title: 'Exportación de Datos',
      description: 'Todas las vistas principales permiten exportar datos.',
      icon: Download,
      highlights: [
        'Exportación a Excel (.xlsx)',
        'Exportación a PDF con formato profesional',
        'Disponible en: Balance, Forecast, Órdenes, Historial',
        'Configurable por tenant',
      ],
    },
    {
      id: 'whitelabel',
      title: 'Sistema White-Label',
      description: 'Completamente personalizable para cada institución financiera.',
      icon: Palette,
      highlights: [
        'Logo y colores personalizables',
        'Nombre del sistema configurable',
        'Features habilitables por cliente',
        'Multi-tenant desde una instalación',
      ],
    },
    {
      id: 'multitenant',
      title: 'Arquitectura Multi-Tenant',
      description: 'Soporte para múltiples clientes desde una única instalación.',
      icon: Building2,
      highlights: [
        'Detección automática por dominio',
        'Configuración independiente por cliente',
        'Tema visual personalizado',
        'API y datos segregados',
      ],
    },
  ];
}

// Generar pasos del tour (se cachea en el primer render)
const TOUR_STEPS: TourStep[] = generateTourSteps();

interface DemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (route: string) => void;
}

export function DemoTour({ isOpen, onClose, onNavigate }: DemoTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  // Navegar automáticamente cuando cambia el paso
  useEffect(() => {
    if (isOpen && step.route && onNavigate) {
      onNavigate(step.route);
    }
  }, [currentStep, isOpen, step.route, onNavigate]);

  const goToStep = useCallback((index: number) => {
    if (index < 0 || index >= TOUR_STEPS.length || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(index);
      setIsAnimating(false);
    }, 150);
  }, [isAnimating]);

  const goNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      goToStep(currentStep + 1);
    } else {
      onClose();
    }
  }, [currentStep, goToStep, onClose]);

  const goPrev = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const handleNavigate = useCallback(() => {
    if (step.route && onNavigate) {
      onNavigate(step.route);
    }
  }, [step.route, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goNext, goPrev, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex items-center p-4">
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl w-96 max-h-[90vh] overflow-hidden transition-opacity duration-150",
          "border border-slate-200",
          isAnimating ? "opacity-50" : "opacity-100"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-blue-200 text-xs">
                  Paso {currentStep + 1} de {TOUR_STEPS.length}
                </p>
                <h2 className="text-lg font-bold">{step.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <p className="text-slate-600 text-sm mb-4">{step.description}</p>

          {/* Highlights */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[var(--brand-primary,#3b82f6)] rounded-full"></span>
              Características
            </h3>
            <ul className="space-y-1.5">
              {step.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-600 text-sm">
                  <span className="w-4 h-4 bg-[var(--brand-primary,#3b82f6)]/20 text-[var(--brand-primary,#3b82f6)] rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-4">
            {TOUR_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  index === currentStep
                    ? "w-4 bg-[var(--brand-primary,#3b82f6)]"
                    : "bg-slate-300 hover:bg-slate-400"
                )}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-3 flex items-center justify-between bg-slate-50">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              currentStep === 0
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-600 hover:bg-slate-200"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          <button
            onClick={goNext}
            className="flex items-center gap-1 px-4 py-1.5 bg-[var(--brand-primary,#3b82f6)] text-white rounded-lg text-sm font-medium hover:bg-[var(--brand-secondary,#1e40af)] transition-colors"
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
            {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook para usar el tour
export function useDemoTour() {
  const [isOpen, setIsOpen] = useState(false);

  const openTour = useCallback(() => setIsOpen(true), []);
  const closeTour = useCallback(() => setIsOpen(false), []);

  return { isOpen, openTour, closeTour };
}

export { TOUR_STEPS };
export default DemoTour;
