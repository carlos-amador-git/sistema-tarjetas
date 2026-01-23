'use client';

/**
 * AdaptiveBarChart - Gráfico de Barras Adaptable
 *
 * Ideal para:
 * - Comparativas por área
 * - Distribución de productos
 * - Rankings
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
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

export interface BarChartSeries {
  dataKey: string;
  name: string;
  color?: string;
  stackId?: string;
}

export interface AdaptiveBarChartProps extends Omit<ChartContainerProps, 'children'> {
  data: Record<string, unknown>[];
  series: BarChartSeries[];
  xAxisKey: string;
  xAxisFormatter?: (value: string) => string;
  yAxisFormatter?: (value: number) => string;
  valueType?: 'number' | 'currency' | 'percent';
  showGrid?: boolean;
  showLegend?: boolean;
  layout?: 'vertical' | 'horizontal';
  barSize?: number;
  radius?: number;
  colorByValue?: boolean;
  colorThresholds?: { value: number; color: string }[];
}

// =============================================================================
// COMPONENTE
// =============================================================================

export function AdaptiveBarChart({
  data,
  series,
  xAxisKey,
  xAxisFormatter,
  yAxisFormatter,
  valueType = 'number',
  showGrid = true,
  showLegend = true,
  layout = 'horizontal',
  barSize = 40,
  radius = 6,
  colorByValue = false,
  colorThresholds,
  ...containerProps
}: AdaptiveBarChartProps) {
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

  // Función para obtener color basado en valor
  const getColorByValue = (value: number, defaultColor: string): string => {
    if (!colorByValue || !colorThresholds) return defaultColor;

    for (let i = colorThresholds.length - 1; i >= 0; i--) {
      if (value >= colorThresholds[i].value) {
        return colorThresholds[i].color;
      }
    }
    return defaultColor;
  };

  const isVertical = layout === 'vertical';

  return (
    <ChartContainer {...containerProps}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.border}
              horizontal={!isVertical}
              vertical={isVertical}
            />
          )}
          {isVertical ? (
            <>
              <XAxis
                type="number"
                tickFormatter={yAxisFormatter || defaultYFormatter}
                tick={{ fill: colors.textMuted, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                tickFormatter={xAxisFormatter}
                tick={{ fill: colors.textMuted, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: colors.border }}
                width={100}
              />
            </>
          ) : (
            <>
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
            </>
          )}
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value, name) => formatChartValue(value, valueType)}
                labelFormatter={xAxisFormatter}
              />
            }
            cursor={{ fill: `${colors.primary}10` }}
          />
          {showLegend && series.length > 1 && (
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
          {coloredSeries.map((s) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color}
              stackId={s.stackId}
              maxBarSize={barSize}
              radius={[radius, radius, 0, 0]}
              isAnimationActive={settings.enableAnimations}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {colorByValue && colorThresholds && data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorByValue(entry[s.dataKey] as number, s.color!)}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
