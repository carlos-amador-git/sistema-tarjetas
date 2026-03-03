'use client';

/**
 * Balance de Inventario
 *
 * Vista consolidada del inventario por producto con flujo visual.
 * Usa los nuevos componentes adaptables que respetan la configuración de UI.
 */

import { useState, useRef, useEffect } from 'react';
import {
  Package,
  Truck,
  Building2,
  Clock,
  TrendingUp,
  ArrowRight,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { MODULE_TITLES } from '@/config';
import { cn, formatNumber } from '@/lib/utils';
import { useExport } from '@/hooks/useExport';
import { BALANCE_DATA } from '@/data/mockData';
import { StatCard, StatusBadge } from '@/components/ui/DataDisplay';
import { useUISettings } from '@/components/ui/UISettings';
import { SkeletonBalance } from '@/components/ui/Skeleton';
import { AdaptiveBarChart, AdaptiveDonutChart } from '@/components/charts';

// =============================================================================
// TIPOS
// =============================================================================

interface BalanceCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'primary' | 'info' | 'warning' | 'success';
  items: { label: string; value: number }[];
  total: number;
  trend?: number;
}

interface FlowStepProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  delay?: number;
}

// =============================================================================
// COLUMNAS PARA EXPORTACIÓN
// =============================================================================

const EXPORT_COLUMNS = [
  { key: 'codigo', header: 'Código' },
  { key: 'producto', header: 'Producto' },
  { key: 'bovedaTrabajo', header: 'Bóveda Trabajo' },
  { key: 'bovedaPrincipal', header: 'Bóveda Principal' },
  { key: 'totalAlmacen', header: 'Total Almacén' },
  { key: 'enProceso', header: 'En Proceso' },
  { key: 'logisticaColocacion', header: 'Logística Colocación' },
  { key: 'logisticaNormal', header: 'Logística Normal' },
  { key: 'totalLogistica', header: 'Total Logística' },
  { key: 'sucursalesColocacion', header: 'Sucursales Colocación' },
  { key: 'sucursalesStock', header: 'Stock Sucursales' },
  { key: 'totalSucursales', header: 'Total Sucursales' },
  { key: 'totalGeneral', header: 'Total General' },
];

// =============================================================================
// COMPONENTES INTERNOS
// =============================================================================

function BalanceCard({ title, icon: Icon, color, items, total, trend }: BalanceCardProps) {
  const { settings } = useUISettings();

  const colorClasses = {
    primary: {
      icon: 'bg-[var(--color-primary,#3b82f6)]',
      text: 'text-[var(--color-primary,#3b82f6)]',
      bg: 'bg-[var(--color-primary,#3b82f6)]/5',
      border: 'border-[var(--color-primary,#3b82f6)]/20',
    },
    info: {
      icon: 'bg-[var(--color-info,#0284c7)]',
      text: 'text-[var(--color-info,#0284c7)]',
      bg: 'bg-[var(--color-info,#0284c7)]/5',
      border: 'border-[var(--color-info,#0284c7)]/20',
    },
    warning: {
      icon: 'bg-[var(--color-warning,#ca8a04)]',
      text: 'text-[var(--color-warning,#ca8a04)]',
      bg: 'bg-[var(--color-warning,#ca8a04)]/5',
      border: 'border-[var(--color-warning,#ca8a04)]/20',
    },
    success: {
      icon: 'bg-[var(--color-success,#16a34a)]',
      text: 'text-[var(--color-success,#16a34a)]',
      bg: 'bg-[var(--color-success,#16a34a)]/5',
      border: 'border-[var(--color-success,#16a34a)]/20',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        'rounded-2xl p-6 border-2 transition-all duration-200',
        'bg-[var(--color-surface,#ffffff)]',
        colors.border,
        settings.enableAnimations && 'hover:scale-[1.02] hover:shadow-lg'
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('p-2.5 rounded-xl', colors.icon)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-semibold text-[var(--color-text,#1e293b)]">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-text-muted,#64748b)]">{item.label}</span>
            <span className="font-medium text-[var(--color-text,#1e293b)]">
              {formatNumber(item.value)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border,#e2e8f0)]">
        <div className="flex justify-between items-center">
          <span className="font-medium text-[var(--color-text-muted,#64748b)]">Total</span>
          <div className="flex items-center gap-2">
            <span className={cn('text-xl font-bold', colors.text)}>
              {formatNumber(total)}
            </span>
            {trend !== undefined && (
              <StatusBadge
                text={`${trend > 0 ? '+' : ''}${trend}%`}
                variant={trend >= 0 ? 'success' : 'error'}
                size="sm"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ icon: Icon, label, value, color, bgColor, delay = 0 }: FlowStepProps) {
  const { settings } = useUISettings();

  return (
    <div
      className={cn(
        'flex-1 text-center',
        settings.enableAnimations && 'animate-fade-in-up'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          'inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3',
          bgColor,
          settings.enableAnimations && 'hover:scale-110 transition-transform'
        )}
      >
        <Icon className={cn('h-8 w-8', color)} />
      </div>
      <p className="font-semibold text-[var(--color-text,#1e293b)]">{label}</p>
      <p className={cn('text-2xl font-bold', color)}>{formatNumber(value)}</p>
    </div>
  );
}

function FlowArrow() {
  const { settings } = useUISettings();

  return (
    <div
      className={cn(
        'text-[var(--color-border,#cbd5e1)]',
        settings.enableAnimations && 'animate-pulse'
      )}
    >
      <ArrowRight className="h-8 w-8 rotate-90 lg:rotate-0" />
    </div>
  );
}

// =============================================================================
// PÁGINA PRINCIPAL
// =============================================================================

export default function BalancePage() {
  const { settings } = useUISettings();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('TC-001');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const products = Object.entries(BALANCE_DATA);
  const currentProduct = BALANCE_DATA[selectedProduct as keyof typeof BALANCE_DATA];

  const { exportExcel, exportPDF, canExportExcel, canExportPDF, isExporting } = useExport({
    baseFilename: 'balance-inventario',
    title: 'Balance General de Inventario',
    columns: EXPORT_COLUMNS,
  });

  // Simular carga inicial
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cálculos
  const almacenTotal =
    currentProduct.almacen.bovedaTrabajo + currentProduct.almacen.bovedaPrincipal;
  const logisticaTotal =
    currentProduct.logistica.colocacion +
    currentProduct.logistica.normal +
    currentProduct.logistica.devoluciones;
  const sucursalesTotal =
    currentProduct.sucursales.colocacion + currentProduct.sucursales.stock;
  const totalGeneral =
    almacenTotal + currentProduct.enProceso.cantidad + logisticaTotal + sucursalesTotal;

  // Tendencias simuladas (en producción vendrían del backend)
  const trends = {
    almacen: 3.2,
    enProceso: -1.5,
    logistica: 5.8,
    sucursales: 2.1,
  };

  // Datos para gráficos
  const distribucionData = [
    { name: 'Almacén', value: almacenTotal },
    { name: 'En Proceso', value: currentProduct.enProceso.cantidad },
    { name: 'Logística', value: logisticaTotal },
    { name: 'Sucursales', value: sucursalesTotal },
  ];

  const comparativoProductos = Object.entries(BALANCE_DATA).map(([codigo, data]) => {
    const alm = data.almacen.bovedaTrabajo + data.almacen.bovedaPrincipal;
    const log = data.logistica.colocacion + data.logistica.normal + data.logistica.devoluciones;
    const suc = data.sucursales.colocacion + data.sucursales.stock;
    return {
      producto: codigo,
      almacen: alm,
      logistica: log,
      sucursales: suc,
    };
  });

  // Preparar datos para exportación (todos los productos)
  const getExportData = () => {
    return Object.entries(BALANCE_DATA).map(([codigo, data]) => {
      const almTotal = data.almacen.bovedaTrabajo + data.almacen.bovedaPrincipal;
      const logTotal =
        data.logistica.colocacion + data.logistica.normal + data.logistica.devoluciones;
      const sucTotal = data.sucursales.colocacion + data.sucursales.stock;
      const total = almTotal + data.enProceso.cantidad + logTotal + sucTotal;

      return {
        codigo,
        producto: data.nombre,
        bovedaTrabajo: data.almacen.bovedaTrabajo,
        bovedaPrincipal: data.almacen.bovedaPrincipal,
        totalAlmacen: almTotal,
        enProceso: data.enProceso.cantidad,
        logisticaColocacion: data.logistica.colocacion,
        logisticaNormal: data.logistica.normal,
        totalLogistica: logTotal,
        sucursalesColocacion: data.sucursales.colocacion,
        sucursalesStock: data.sucursales.stock,
        totalSucursales: sucTotal,
        totalGeneral: total,
      };
    });
  };

  const handleExportExcel = () => {
    exportExcel(getExportData());
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    exportPDF(getExportData());
    setShowExportMenu(false);
  };

  if (isLoading) {
    return <SkeletonBalance />;
  }

  return (
    <div className={cn('space-y-6', settings.enableAnimations && 'animate-fade-in')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text,#1e293b)]">
            {MODULE_TITLES['balance']}
          </h1>
          <p className="text-[var(--color-text-muted,#64748b)] mt-1">
            Vista consolidada del inventario por producto
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de Producto */}
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className={cn(
              'px-4 py-2.5 rounded-xl border transition-all duration-200',
              'border-[var(--color-border,#e2e8f0)]',
              'bg-[var(--color-surface,#ffffff)]',
              'text-[var(--color-text,#1e293b)] font-medium',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]'
            )}
          >
            {products.map(([id, data]) => (
              <option key={id} value={id}>
                {id} - {data.nombre}
              </option>
            ))}
          </select>

          {/* Dropdown de Exportación */}
          {(canExportExcel || canExportPDF) && (
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200',
                  'bg-[var(--color-primary,#3b82f6)] text-white',
                  'hover:bg-[var(--color-primary-dark,#2563eb)]',
                  'disabled:opacity-50',
                  settings.enableAnimations && 'hover:scale-[1.02]'
                )}
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exportando...' : 'Exportar'}
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', showExportMenu && 'rotate-180')}
                />
              </button>

              {showExportMenu && (
                <div
                  className={cn(
                    'absolute right-0 mt-2 w-48 py-1 z-10 rounded-xl shadow-lg',
                    'bg-[var(--color-surface,#ffffff)]',
                    'border border-[var(--color-border,#e2e8f0)]',
                    settings.enableAnimations && 'animate-scale-in'
                  )}
                >
                  {canExportExcel && (
                    <button
                      onClick={handleExportExcel}
                      className={cn(
                        'flex items-center gap-3 w-full px-4 py-2 text-left transition-colors',
                        'text-[var(--color-text,#1e293b)]',
                        'hover:bg-[var(--color-surface-hover,#f8fafc)]'
                      )}
                    >
                      <FileSpreadsheet className="h-4 w-4 text-[var(--color-success,#16a34a)]" />
                      Exportar a Excel
                    </button>
                  )}
                  {canExportPDF && (
                    <button
                      onClick={handleExportPDF}
                      className={cn(
                        'flex items-center gap-3 w-full px-4 py-2 text-left transition-colors',
                        'text-[var(--color-text,#1e293b)]',
                        'hover:bg-[var(--color-surface-hover,#f8fafc)]'
                      )}
                    >
                      <FileText className="h-4 w-4 text-[var(--color-error,#dc2626)]" />
                      Exportar a PDF
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Total General - Hero Card */}
      <div
        className={cn(
          'rounded-2xl p-8 text-white overflow-hidden relative',
          settings.enableGradients
            ? 'bg-gradient-to-r from-[var(--color-primary,#3b82f6)] to-[var(--color-secondary,#1e40af)]'
            : 'bg-[var(--color-primary,#3b82f6)]',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm mb-1">Inventario Total</p>
            <p className="text-5xl font-bold mb-2">{formatNumber(totalGeneral)}</p>
            <div className="flex items-center gap-2">
              <StatusBadge text={currentProduct.nombre} variant="info" size="md" />
              <span className="text-white/60 text-sm">
                {products.length} productos disponibles
              </span>
            </div>
          </div>
          <div
            className="p-4 rounded-2xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <TrendingUp className="h-16 w-16 text-white/80" />
          </div>
        </div>
      </div>

      {/* Flow Diagram */}
      <div
        className={cn(
          'rounded-2xl p-6',
          'bg-[var(--color-surface,#ffffff)]',
          'border border-[var(--color-border,#e2e8f0)]',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
        style={{ animationDelay: '100ms' }}
      >
        <h2 className="text-lg font-semibold text-[var(--color-text,#1e293b)] mb-6">
          Flujo de Inventario
        </h2>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <FlowStep
            icon={Package}
            label="Almacén"
            value={almacenTotal}
            color="text-[var(--color-primary,#3b82f6)]"
            bgColor="bg-[var(--color-primary,#3b82f6)]/10"
            delay={0}
          />

          <FlowArrow />

          <FlowStep
            icon={Clock}
            label="En Proceso"
            value={currentProduct.enProceso.cantidad}
            color="text-[var(--color-info,#0284c7)]"
            bgColor="bg-[var(--color-info,#0284c7)]/10"
            delay={100}
          />

          <FlowArrow />

          <FlowStep
            icon={Truck}
            label="Logística"
            value={logisticaTotal}
            color="text-[var(--color-warning,#ca8a04)]"
            bgColor="bg-[var(--color-warning,#ca8a04)]/10"
            delay={200}
          />

          <FlowArrow />

          <FlowStep
            icon={Building2}
            label="Sucursales"
            value={sucursalesTotal}
            color="text-[var(--color-success,#16a34a)]"
            bgColor="bg-[var(--color-success,#16a34a)]/10"
            delay={300}
          />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={cn(
            'lg:col-span-2',
            settings.enableAnimations && 'animate-fade-in-up'
          )}
          style={{ animationDelay: '150ms' }}
        >
          <AdaptiveBarChart
            title="Comparativo por Producto"
            subtitle="Distribución de inventario"
            data={comparativoProductos}
            series={[
              { dataKey: 'almacen', name: 'Almacén', color: 'var(--color-primary, #3b82f6)' },
              { dataKey: 'logistica', name: 'Logística', color: 'var(--color-warning, #ca8a04)' },
              { dataKey: 'sucursales', name: 'Sucursales', color: 'var(--color-success, #16a34a)' },
            ]}
            xAxisKey="producto"
            height={280}
            showLegend
          />
        </div>
        <div
          className={cn(settings.enableAnimations && 'animate-fade-in-up')}
          style={{ animationDelay: '200ms' }}
        >
          <AdaptiveDonutChart
            title="Distribución Actual"
            subtitle={currentProduct.nombre}
            data={distribucionData}
            height={280}
            centerLabel={{
              title: 'Total',
              value: formatNumber(totalGeneral),
            }}
          />
        </div>
      </div>

      {/* Detalles por Área */}
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
        style={{ animationDelay: '250ms' }}
      >
        <BalanceCard
          title="Almacén Central"
          icon={Package}
          color="primary"
          items={[
            { label: 'Bóveda de Trabajo', value: currentProduct.almacen.bovedaTrabajo },
            { label: 'Bóveda Principal', value: currentProduct.almacen.bovedaPrincipal },
          ]}
          total={almacenTotal}
          trend={trends.almacen}
        />

        <BalanceCard
          title="En Proceso"
          icon={Clock}
          color="info"
          items={[
            { label: 'Cantidad', value: currentProduct.enProceso.cantidad },
            { label: 'Órdenes Activas', value: currentProduct.enProceso.ordenesActivas },
          ]}
          total={currentProduct.enProceso.cantidad}
          trend={trends.enProceso}
        />

        <BalanceCard
          title="Logística"
          icon={Truck}
          color="warning"
          items={[
            { label: 'Colocación', value: currentProduct.logistica.colocacion },
            { label: 'Normal', value: currentProduct.logistica.normal },
            { label: 'Devoluciones', value: currentProduct.logistica.devoluciones },
          ]}
          total={logisticaTotal}
          trend={trends.logistica}
        />

        <BalanceCard
          title="Sucursales"
          icon={Building2}
          color="success"
          items={[
            { label: 'Colocación', value: currentProduct.sucursales.colocacion },
            { label: 'Stock Seguridad', value: currentProduct.sucursales.stock },
          ]}
          total={sucursalesTotal}
          trend={trends.sucursales}
        />
      </div>

      {/* Stats Rápidos */}
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
        style={{ animationDelay: '300ms' }}
      >
        <StatCard
          title="Capacidad Almacén"
          value="78%"
          subtitle="Del máximo"
          icon={<Package className="h-5 w-5" />}
          color="primary"
          progress={{ value: 78, max: 100, label: 'Ocupación' }}
        />
        <StatCard
          title="Tiempo Promedio"
          value="2.3 días"
          subtitle="En proceso"
          icon={<Clock className="h-5 w-5" />}
          color="info"
        />
        <StatCard
          title="Entregas Pendientes"
          value="24"
          subtitle="En ruta"
          icon={<Truck className="h-5 w-5" />}
          color="warning"
          trend={{ value: -12, label: 'vs semana anterior' }}
        />
        <StatCard
          title="Sucursales Activas"
          value="156"
          subtitle="Con stock"
          icon={<Building2 className="h-5 w-5" />}
          color="success"
          trend={{ value: 3, label: 'nuevas este mes' }}
        />
      </div>
    </div>
  );
}
