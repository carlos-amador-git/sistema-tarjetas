'use client';

/**
 * AdaptiveDonutChart - Gráfico de Dona Adaptable
 *
 * Ideal para:
 * - Distribución de stock por categoría
 * - Porcentajes de áreas
 * - Métricas de composición
 */

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
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

export interface DonutChartData {
  name: string;
  value: number;
  color?: string;
}

export interface AdaptiveDonutChartProps extends Omit<ChartContainerProps, 'children'> {
  data: DonutChartData[];
  dataKey?: string;
  nameKey?: string;
  valueType?: 'number' | 'currency' | 'percent';
  innerRadius?: number | string;
  outerRadius?: number | string;
  showLegend?: boolean;
  showLabels?: boolean;
  centerLabel?: {
    title: string;
    value: string | number;
  };
}

// =============================================================================
// COMPONENTE
// =============================================================================

export function AdaptiveDonutChart({
  data,
  valueType = 'number',
  innerRadius = '60%',
  outerRadius = '80%',
  showLegend = true,
  showLabels = false,
  centerLabel,
  ...containerProps
}: AdaptiveDonutChartProps) {
  const { settings } = useUISettings();
  const colors = useChartColors();

  // Asignar colores a los datos
  const coloredData = useMemo(() => {
    return data.map((d, index) => ({
      ...d,
      color: d.color || colors.series[index % colors.series.length],
    }));
  }, [data, colors.series]);

  return (
    <ChartContainer {...containerProps}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={coloredData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            nameKey="name"
            isAnimationActive={settings.enableAnimations}
            animationDuration={800}
            animationEasing="ease-out"
            label={showLabels}
            labelLine={showLabels}
          >
            {coloredData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={colors.surface}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value, name) => formatChartValue(value, valueType)}
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
                    type: 'circle',
                  }))}
                />
              )}
            />
          )}
          {/* Centro de la dona */}
          {centerLabel && (
            <>
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={colors.textMuted}
                fontSize={14}
              >
                {centerLabel.title}
              </text>
              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={colors.text}
                fontSize={24}
                fontWeight={700}
              >
                {centerLabel.value}
              </text>
            </>
          )}
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
