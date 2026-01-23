'use client';

/**
 * AdaptiveAreaChart - Gráfico de Área Adaptable
 *
 * Ideal para:
 * - Forecast acumulado
 * - Tendencias con énfasis en volumen
 * - Comparación de rangos
 */

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useUISettings } from '@/components/ui/UISettings';
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  useChartColors,
  formatChartValue,
  type ChartContainerProps,
} from './ChartPrimitives';

// =============================================================================
// TIPOS
// =============================================================================

export interface AreaChartSeries {
  dataKey: string;
  name: string;
  color?: string;
  fillOpacity?: number;
  type?: 'monotone' | 'linear' | 'step' | 'basis';
  stackId?: string;
}

export interface AdaptiveAreaChartProps extends Omit<ChartContainerProps, 'children'> {
  data: Record<string, unknown>[];
  series: AreaChartSeries[];
  xAxisKey: string;
  xAxisFormatter?: (value: string) => string;
  yAxisFormatter?: (value: number) => string;
  valueType?: 'number' | 'currency' | 'percent';
  showGrid?: boolean;
  showLegend?: boolean;
  showDots?: boolean;
  gradient?: boolean;
}

// =============================================================================
// COMPONENTE
// =============================================================================

export function AdaptiveAreaChart({
  data,
  series,
  xAxisKey,
  xAxisFormatter,
  yAxisFormatter,
  valueType = 'number',
  showGrid = true,
  showLegend = true,
  showDots = false,
  gradient = true,
  ...containerProps
}: AdaptiveAreaChartProps) {
  const { settings } = useUISettings();
  const colors = useChartColors();

  // Asignar colores a las series
  const coloredSeries = useMemo(() => {
    return series.map((s, index) => ({
      ...s,
      color: s.color || colors.series[index % colors.series.length],
      fillOpacity: s.fillOpacity ?? 0.3,
    }));
  }, [series, colors.series]);

  const defaultYFormatter = (value: number) => formatChartValue(value, valueType);

  // Generar IDs únicos para gradientes
  const gradientIds = useMemo(() => {
    return coloredSeries.map((_, index) => `gradient-${index}-${Math.random().toString(36).substr(2, 9)}`);
  }, [coloredSeries]);

  return (
    <ChartContainer {...containerProps}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          {/* Definir gradientes */}
          {gradient && (
            <defs>
              {coloredSeries.map((s, index) => (
                <linearGradient
                  key={gradientIds[index]}
                  id={gradientIds[index]}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
          )}

          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.border}
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={xAxisFormatter}
            tick={{ fill: colors.textMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
          />
          <YAxis
            tickFormatter={yAxisFormatter || defaultYFormatter}
            tick={{ fill: colors.textMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value, name) => formatChartValue(value, valueType)}
                labelFormatter={xAxisFormatter}
              />
            }
          />
          {showLegend && (
            <Legend
              content={({ payload }) => (
                <ChartLegend
                  payload={payload?.map((p) => ({
                    value: p.value as string,
                    color: p.color as string,
                    type: 'square',
                  }))}
                />
              )}
            />
          )}
          {coloredSeries.map((s, index) => (
            <Area
              key={s.dataKey}
              type={s.type || 'monotone'}
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fill={gradient ? `url(#${gradientIds[index]})` : s.color}
              fillOpacity={gradient ? 1 : s.fillOpacity}
              stackId={s.stackId}
              dot={showDots ? { fill: s.color, strokeWidth: 2, r: 4 } : false}
              activeDot={{ r: 6, strokeWidth: 2 }}
              isAnimationActive={settings.enableAnimations}
              animationDuration={800}
              animationEasing="ease-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
