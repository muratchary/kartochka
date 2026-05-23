import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { colors, typography } from '../theme';
import { useFont } from '../theme/useFont';

export type GrowthMetric = 'weight' | 'height' | 'head';

export interface ChartPoint {
  ageMonths: number;
  value: number;
}

interface Props {
  points: ChartPoint[];
  unit: string;
  height?: number;
  metric: GrowthMetric;
}

const PADDING = { top: 12, right: 18, bottom: 30, left: 44 };

export function GrowthChart({ points, unit, height = 220, metric }: Props) {
  const font = useFont();
  const fontFamily = font(600);
  const boldFamily = font(700);

  if (points.length === 0) {
    return <View style={{ height }} />;
  }

  const sorted = [...points].sort((a, b) => a.ageMonths - b.ageMonths);
  const xMin = Math.max(0, Math.floor(sorted[0].ageMonths) - 1);
  const xMax = Math.ceil(sorted[sorted.length - 1].ageMonths) + 1;
  const yValues = sorted.map((p) => p.value);
  const yMin = Math.floor(Math.min(...yValues) * 0.92);
  const yMax = Math.ceil(Math.max(...yValues) * 1.08);
  const yRange = Math.max(yMax - yMin, 1);
  const xRange = Math.max(xMax - xMin, 1);

  return (
    <View style={[styles.wrap, { height }]}>
      <Svg width="100%" height={height} viewBox={`0 0 360 ${height}`} preserveAspectRatio="none">
        <ChartAxes
          height={height}
          xMin={xMin}
          xMax={xMax}
          yMin={yMin}
          yMax={yMax}
          unit={unit}
          fontFamily={fontFamily}
          boldFamily={boldFamily}
        />
        <ChartLine
          sorted={sorted}
          height={height}
          xMin={xMin}
          xRange={xRange}
          yMin={yMin}
          yRange={yRange}
        />
        <ChartPoints
          sorted={sorted}
          height={height}
          xMin={xMin}
          xRange={xRange}
          yMin={yMin}
          yRange={yRange}
          fontFamily={boldFamily}
          metric={metric}
        />
      </Svg>
    </View>
  );
}

function ChartAxes({
  height,
  xMin,
  xMax,
  yMin,
  yMax,
  unit,
  fontFamily,
  boldFamily,
}: {
  height: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  unit: string;
  fontFamily: string;
  boldFamily: string;
}) {
  const width = 360;
  const plotLeft = PADDING.left;
  const plotRight = width - PADDING.right;
  const plotTop = PADDING.top;
  const plotBottom = height - PADDING.bottom;
  const yTicks = 4;
  const xTickCount = Math.min(xMax - xMin, 6);

  return (
    <G>
      <Line
        x1={plotLeft}
        y1={plotBottom}
        x2={plotRight}
        y2={plotBottom}
        stroke={colors.border}
        strokeWidth={1}
      />
      <Line
        x1={plotLeft}
        y1={plotTop}
        x2={plotLeft}
        y2={plotBottom}
        stroke={colors.border}
        strokeWidth={1}
      />
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const fraction = i / yTicks;
        const y = plotBottom - fraction * (plotBottom - plotTop);
        const value = yMin + fraction * (yMax - yMin);
        return (
          <G key={`y-${i}`}>
            <Line
              x1={plotLeft}
              y1={y}
              x2={plotRight}
              y2={y}
              stroke={colors.border2}
              strokeWidth={0.5}
              strokeDasharray="3 3"
            />
            <SvgText
              x={plotLeft - 6}
              y={y + 3}
              fontSize={10}
              fontFamily={fontFamily}
              fill={colors.ink3}
              textAnchor="end">
              {Math.round(value * 10) / 10}
            </SvgText>
          </G>
        );
      })}
      <SvgText
        x={plotLeft - 6}
        y={plotTop - 2}
        fontSize={9}
        fontFamily={boldFamily}
        fill={colors.ink2}
        textAnchor="end">
        {unit}
      </SvgText>
      {Array.from({ length: xTickCount + 1 }).map((_, i) => {
        const fraction = xTickCount === 0 ? 0 : i / xTickCount;
        const x = plotLeft + fraction * (plotRight - plotLeft);
        const months = Math.round(xMin + fraction * (xMax - xMin));
        return (
          <SvgText
            key={`x-${i}`}
            x={x}
            y={plotBottom + 16}
            fontSize={10}
            fontFamily={fontFamily}
            fill={colors.ink3}
            textAnchor="middle">
            {formatXLabel(months)}
          </SvgText>
        );
      })}
    </G>
  );
}

function formatXLabel(months: number): string {
  if (months < 24) return `${months}m`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0 ? `${years}y` : `${years}y${rem}m`;
}

function ChartLine({
  sorted,
  height,
  xMin,
  xRange,
  yMin,
  yRange,
}: {
  sorted: ChartPoint[];
  height: number;
  xMin: number;
  xRange: number;
  yMin: number;
  yRange: number;
}) {
  if (sorted.length < 2) return null;
  const width = 360;
  const plotLeft = PADDING.left;
  const plotRight = width - PADDING.right;
  const plotTop = PADDING.top;
  const plotBottom = height - PADDING.bottom;

  const toX = (m: number) =>
    plotLeft + ((m - xMin) / xRange) * (plotRight - plotLeft);
  const toY = (v: number) =>
    plotBottom - ((v - yMin) / yRange) * (plotBottom - plotTop);

  const d = sorted
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.ageMonths)} ${toY(p.value)}`)
    .join(' ');

  return <Path d={d} fill="none" stroke={colors.amber} strokeWidth={2.5} strokeLinejoin="round" />;
}

function ChartPoints({
  sorted,
  height,
  xMin,
  xRange,
  yMin,
  yRange,
  fontFamily,
  metric,
}: {
  sorted: ChartPoint[];
  height: number;
  xMin: number;
  xRange: number;
  yMin: number;
  yRange: number;
  fontFamily: string;
  metric: GrowthMetric;
}) {
  const width = 360;
  const plotLeft = PADDING.left;
  const plotRight = width - PADDING.right;
  const plotTop = PADDING.top;
  const plotBottom = height - PADDING.bottom;

  const toX = (m: number) =>
    plotLeft + ((m - xMin) / xRange) * (plotRight - plotLeft);
  const toY = (v: number) =>
    plotBottom - ((v - yMin) / yRange) * (plotBottom - plotTop);

  return (
    <G>
      {sorted.map((p, i) => {
        const x = toX(p.ageMonths);
        const y = toY(p.value);
        const showLabel = sorted.length <= 6 || i === sorted.length - 1;
        return (
          <G key={i}>
            <Circle cx={x} cy={y} r={4.5} fill={colors.amber} stroke={colors.surface} strokeWidth={2} />
            {showLabel && (
              <SvgText
                x={x}
                y={y - 8}
                fontSize={10}
                fontFamily={fontFamily}
                fill={colors.ink}
                textAnchor="middle">
                {metric === 'weight' ? `${p.value}` : `${p.value}`}
              </SvgText>
            )}
          </G>
        );
      })}
    </G>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 2,
  },
});
