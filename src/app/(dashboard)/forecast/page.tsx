'use client';

/**
 * Forecast de Inventario
 *
 * Proyección de inventario por producto con gráficos de tendencias.
 * Usa los nuevos componentes adaptables que respetan la configuración de UI.
 */

import { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  AlertTriangle,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { MODULE_TITLES } from '@/config';
import { cn, formatNumber } from '@/lib/utils';
import { useExport } from '@/hooks/useExport';
import { FORECAST_PERIODOS, FORECAST_PRODUCTOS, calcularMetricasForecast } from '@/data/mockData';
import { StatCard } from '@/components/ui/DataDisplay';
import { useUISettings } from '@/components/ui/UISettings';
import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton';
import { AdaptiveLineChart, AdaptiveAreaChart } from '@/components/charts';

// Datos de forecast centralizados
const FORECAST_DATA = {
  periodos: FORECAST_PERIODOS,
  productos: FORECAST_PRODUCTOS,
};

interface ForecastRowProps {
  producto: typeof FORECAST_DATA.productos[0];
  periodos: string[];
}

function ForecastRow({ producto, periodos }: ForecastRowProps) {
  const { settings } = useUISettings();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className={cn(
          'transition-colors',
          'hover:bg-[var(--color-surface-hover,#f8fafc)]'
        )}
      >
        <td className="px-4 py-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-left"
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 text-[var(--color-text-muted,#64748b)] transition-transform',
                expanded && 'rotate-180'
              )}
            />
            <div>
              <p className="font-medium text-[var(--color-text,#1e293b)]">{producto.nombre}</p>
              <p className="text-xs text-[var(--color-text-muted,#64748b)]">{producto.id}</p>
            </div>
          </button>
        </td>
        <td className="px-4 py-3 text-right font-medium text-[var(--color-text,#1e293b)]">
          {formatNumber(producto.actual)}
        </td>
        {producto.forecast.map((valor, index) => (
          <td key={index} className="px-4 py-3 text-right text-[var(--color-text-muted,#64748b)]">
            {formatNumber(valor)}
          </td>
        ))}
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {producto.tendencia === 'up' ? (
              <TrendingUp className="h-5 w-5 text-[var(--color-success,#16a34a)]" />
            ) : (
              <TrendingDown className="h-5 w-5 text-[var(--color-error,#dc2626)]" />
            )}
            {producto.alertas > 0 && (
              <span
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                  'bg-[var(--color-warning-bg,#fef9c3)]',
                  'text-[var(--color-warning,#ca8a04)]'
                )}
              >
                <AlertTriangle className="h-3 w-3" />
                {producto.alertas}
              </span>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[var(--color-surface-hover,#f8fafc)]">
          <td colSpan={9} className="px-8 py-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div
                className={cn(
                  'rounded-lg p-3 border',
                  'bg-[var(--color-surface,#ffffff)]',
                  'border-[var(--color-border,#e2e8f0)]'
                )}
              >
                <p className="text-[var(--color-text-muted,#64748b)] mb-1">Stock Mínimo</p>
                <p className="font-semibold text-[var(--color-text,#1e293b)]">5,000 unidades</p>
              </div>
              <div
                className={cn(
                  'rounded-lg p-3 border',
                  'bg-[var(--color-surface,#ffffff)]',
                  'border-[var(--color-border,#e2e8f0)]'
                )}
              >
                <p className="text-[var(--color-text-muted,#64748b)] mb-1">Tiempo de Reposición</p>
                <p className="font-semibold text-[var(--color-text,#1e293b)]">15 días</p>
              </div>
              <div
                className={cn(
                  'rounded-lg p-3 border',
                  'bg-[var(--color-surface,#ffffff)]',
                  'border-[var(--color-border,#e2e8f0)]'
                )}
              >
                <p className="text-[var(--color-text-muted,#64748b)] mb-1">Último Pedido</p>
                <p className="font-semibold text-[var(--color-text,#1e293b)]">15 Ene 2026</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ForecastSkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--color-surface,#ffffff)] rounded-2xl p-5 border border-[var(--color-border,#e2e8f0)]"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[300px] rounded-2xl" />
        <Skeleton className="h-[300px] rounded-2xl" />
      </div>
      <SkeletonTable rows={5} columns={9} />
    </div>
  );
}

// Columnas para exportación
const EXPORT_COLUMNS = [
  { key: 'id', header: 'Código' },
  { key: 'nombre', header: 'Producto' },
  { key: 'actual', header: 'Actual' },
  { key: 'ene', header: 'Ene' },
  { key: 'feb', header: 'Feb' },
  { key: 'mar', header: 'Mar' },
  { key: 'abr', header: 'Abr' },
  { key: 'may', header: 'May' },
  { key: 'jun', header: 'Jun' },
  { key: 'tendencia', header: 'Tendencia' },
  { key: 'alertas', header: 'Alertas' },
];

// Usar métricas centralizadas
const getForecastMetrics = calcularMetricasForecast;

export default function ForecastPage() {
  const { settings } = useUISettings();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filter, setFilter] = useState<'all' | 'up' | 'down' | 'alert'>('all');
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Métricas calculadas
  const metrics = getForecastMetrics();

  const { exportExcel, exportPDF, canExportExcel, canExportPDF, isExporting } = useExport({
    baseFilename: `forecast-${selectedYear}`,
    title: `Pronóstico de Inventario ${selectedYear}`,
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

  // Filtrar productos
  const filteredProducts = FORECAST_DATA.productos.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'up') return p.tendencia === 'up';
    if (filter === 'down') return p.tendencia === 'down';
    if (filter === 'alert') return p.alertas > 0;
    return true;
  });

  // Datos para gráficos (usando productos filtrados)
  const forecastChartData = FORECAST_DATA.periodos.map((periodo, index) => ({
    mes: periodo,
    ...Object.fromEntries(
      filteredProducts.map((p) => [p.nombre, p.forecast[index]])
    ),
  }));

  // Datos agregados para área chart
  const forecastTotales = FORECAST_DATA.periodos.map((periodo, index) => {
    const total = FORECAST_DATA.productos.reduce((sum, p) => sum + p.forecast[index], 0);
    return {
      mes: periodo,
      total,
      crecimiento: FORECAST_DATA.productos
        .filter((p) => p.tendencia === 'up')
        .reduce((sum, p) => sum + p.forecast[index], 0),
      descenso: FORECAST_DATA.productos
        .filter((p) => p.tendencia === 'down')
        .reduce((sum, p) => sum + p.forecast[index], 0),
    };
  });

  // Preparar datos para exportación
  const getExportData = () => {
    return FORECAST_DATA.productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      actual: p.actual,
      ene: p.forecast[0],
      feb: p.forecast[1],
      mar: p.forecast[2],
      abr: p.forecast[3],
      may: p.forecast[4],
      jun: p.forecast[5],
      tendencia: p.tendencia === 'up' ? 'Crecimiento' : 'Descenso',
      alertas: p.alertas,
    }));
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
    return <ForecastSkeletonLoader />;
  }

  return (
    <div className={cn('space-y-6', settings.enableAnimations && 'animate-fade-in')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text,#1e293b)]">
            {MODULE_TITLES['forecast']}
          </h1>
          <p className="text-[var(--color-text-muted,#64748b)] mt-1">
            Proyección de inventario por producto
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={cn(
              'px-4 py-2 rounded-xl border',
              'bg-[var(--color-surface,#ffffff)]',
              'border-[var(--color-border,#e2e8f0)]',
              'text-[var(--color-text,#1e293b)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]'
            )}
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
          {/* Dropdown de Exportación */}
          {(canExportExcel || canExportPDF) && (
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl',
                  'bg-[var(--color-primary,#3b82f6)] text-white',
                  'hover:opacity-90 transition-all duration-200',
                  'disabled:opacity-50'
                )}
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exportando...' : 'Exportar'}
                <ChevronDown className={cn('h-4 w-4 transition-transform', showExportMenu && 'rotate-180')} />
              </button>

              {showExportMenu && (
                <div
                  className={cn(
                    'absolute right-0 mt-2 w-48 py-1 z-10 rounded-xl shadow-lg',
                    'bg-[var(--color-surface,#ffffff)]',
                    'border border-[var(--color-border,#e2e8f0)]'
                  )}
                >
                  {canExportExcel && (
                    <button
                      onClick={handleExportExcel}
                      className={cn(
                        'flex items-center gap-3 w-full px-4 py-2 text-left',
                        'text-[var(--color-text,#1e293b)]',
                        'hover:bg-[var(--color-surface-hover,#f8fafc)] transition-colors'
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
                        'flex items-center gap-3 w-full px-4 py-2 text-left',
                        'text-[var(--color-text,#1e293b)]',
                        'hover:bg-[var(--color-surface-hover,#f8fafc)] transition-colors'
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

      {/* Summary Cards - Métricas dinámicas */}
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-4 gap-4',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
        style={{ animationDelay: '50ms' }}
      >
        <StatCard
          title="Total Productos"
          value={metrics.total.toString()}
          subtitle="En proyección"
          icon={<Package className="h-5 w-5" />}
          color="primary"
          onClick={() => setFilter('all')}
          className={cn(filter === 'all' && 'ring-2 ring-[var(--color-primary,#3b82f6)]')}
        />
        <StatCard
          title="En Crecimiento"
          value={metrics.enCrecimiento.toString()}
          subtitle="Tendencia positiva"
          icon={<TrendingUp className="h-5 w-5" />}
          color="success"
          onClick={() => setFilter('up')}
          className={cn(filter === 'up' && 'ring-2 ring-[var(--color-success,#16a34a)]')}
        />
        <StatCard
          title="En Descenso"
          value={metrics.enDescenso.toString()}
          subtitle="Tendencia negativa"
          icon={<TrendingDown className="h-5 w-5" />}
          color="error"
          onClick={() => setFilter('down')}
          className={cn(filter === 'down' && 'ring-2 ring-[var(--color-error,#dc2626)]')}
        />
        <StatCard
          title="Con Alertas"
          value={metrics.conAlertas.toString()}
          subtitle="Requieren atención"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="warning"
          onClick={() => setFilter('alert')}
          className={cn(filter === 'alert' && 'ring-2 ring-[var(--color-warning,#ca8a04)]')}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={cn(settings.enableAnimations && 'animate-fade-in-up')}
          style={{ animationDelay: '100ms' }}
        >
          <AdaptiveLineChart
            title="Proyección por Producto"
            subtitle={`Semestre ${selectedYear} ${filter !== 'all' ? `(${filter})` : ''}`}
            data={forecastChartData}
            series={filteredProducts.map((p, i) => ({
              dataKey: p.nombre,
              name: p.nombre,
              color: ['var(--color-primary, #3b82f6)', 'var(--color-success, #16a34a)', 'var(--color-warning, #ca8a04)'][i % 3],
            }))}
            xAxisKey="mes"
            height={280}
            showLegend
          />
        </div>
        <div
          className={cn(settings.enableAnimations && 'animate-fade-in-up')}
          style={{ animationDelay: '150ms' }}
        >
          <AdaptiveAreaChart
            title="Proyección Total"
            subtitle="Por tendencia"
            data={forecastTotales}
            series={[
              { dataKey: 'crecimiento', name: 'En crecimiento', color: 'var(--color-success, #16a34a)' },
              { dataKey: 'descenso', name: 'En descenso', color: 'var(--color-error, #dc2626)' },
            ]}
            xAxisKey="mes"
            height={280}
            showLegend
            gradient
          />
        </div>
      </div>

      {/* Forecast Table */}
      <div
        className={cn(
          'rounded-2xl overflow-hidden',
          'bg-[var(--color-surface,#ffffff)]',
          'border border-[var(--color-border,#e2e8f0)]',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
        style={{ animationDelay: '200ms' }}
      >
        <div className="p-4 border-b border-[var(--color-border,#e2e8f0)]">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--color-text-muted,#64748b)]" />
            <h2 className="font-semibold text-[var(--color-text,#1e293b)]">
              Proyección Semestral {selectedYear}
              {filter !== 'all' && <span className="text-sm font-normal text-[var(--color-text-muted,#64748b)] ml-2">(Filtrado)</span>}
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-surface-hover,#f8fafc)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                  Actual
                </th>
                {FORECAST_DATA.periodos.map((periodo) => (
                  <th
                    key={periodo}
                    className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider"
                  >
                    {periodo}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border,#e2e8f0)]">
              {filteredProducts.map((producto) => (
                <ForecastRow
                  key={producto.id}
                  producto={producto}
                  periodos={FORECAST_DATA.periodos}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--color-text-muted,#64748b)]">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--color-success,#16a34a)]" />
          <span>Tendencia positiva</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-[var(--color-error,#dc2626)]" />
          <span>Tendencia negativa</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[var(--color-warning,#ca8a04)]" />
          <span>Stock bajo proyectado</span>
        </div>
      </div>
    </div>
  );
}
