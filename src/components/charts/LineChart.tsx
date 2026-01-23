'use client';

/**
 * AdaptiveLineChart - Gráfico de Líneas Adaptable
 *
 * Ideal para:
 * - Tendencias de inventario
 * - Series temporales
 * - Comparación de múltiples métricas
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
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

export interface LineChartSeries {
  dataKey: string;
  name: string;
  color?: string;
  strokeWidth?: number;
  type?: 'monotone' | 'linear' | 'step' | 'basis';
  dashed?: boolean;
}

export interface AdaptiveLineChartProps extends Omit<ChartContainerProps, 'children'> {
  data: Record<string, unknown>[];
  series: LineChartSeries[];
  xAxisKey: string;
  xAxisFormatter?: (value: string) => string;
  yAxisFormatter?: (value: number) => string;
  valueType?: 'number' | 'currency' | 'percent';
  showGrid?: boolean;
  showLegend?: boolean;
  showDots?: boolean;
  areaFill?: boolean;
}

// =============================================================================
// COMPONENTE
// =============================================================================

export function AdaptiveLineChart({
  data,
  series,
  xAxisKey,
  xAxisFormatter,
  yAxisFormatter,
  valueType = 'number',
  showGrid = true,
  showLegend = true,
  showDots = true,
  areaFill = false,
  ...containerProps
}: AdaptiveLineChartProps) {
  const { settings } = useUISettings();
  const colors = useChartColors();

  // Asignar colores a las series
  const coloredSeries = useMemo(() => {
    return series.map((s, index) => ({
      ...s,
      color: s.color || colors.series[index % colors.series.length],
    }));
  }, [series, colors.series]);

  const defaultYFormatter = (value: number) => formatChartValue(value, valueType);

  return (
    <ChartContainer {...containerProps}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
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
                    type: 'line',
                  }))}
                />
              )}
            />
          )}
          {coloredSeries.map((s) => (
            <Line
              key={s.dataKey}
              type={s.type || 'monotone'}
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.strokeWidth || 2}
              strokeDasharray={s.dashed ? '5 5' : undefined}
              dot={showDots ? { fill: s.color, strokeWidth: 2, r: 4 } : false}
              activeDot={{ r: 6, strokeWidth: 2 }}
              isAnimationActive={settings.enableAnimations}
              animationDuration={800}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
