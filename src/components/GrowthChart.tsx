import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { colors, typography } from '../theme';
import { useFont } from '../theme/useFont';
import { WHO_GROWTH, interpolateGrowthPoint } from '../data/whoGrowthStandards';

export type GrowthMetric = 'weight' | 'height' | 'head';

export interface ChartPoint {
  ageMonths: number;
  value: number;
}

interface Props {
  points: ChartPoint[];
  height?: number;
  metric: GrowthMetric;
  sex?: 'male' | 'female' | 'unspecified';
  isPremium?: boolean;
  onUnlockPress?: () => void;
}

const PADDING = { top: 12, right: 28, bottom: 30, left: 44 };

// Map chart metric to WHO data key
function whoSeriesFor(metric: GrowthMetric, sex: 'male' | 'female' | 'unspecified') {
  const metricKey = metric === 'weight' ? 'weight' : metric === 'height' ? 'length' : 'headcirc';
  const sexKey = sex === 'female' ? 'girls' : 'boys'; // default boys for unspecified
  return WHO_GROWTH[metricKey][sexKey];
}

export function GrowthChart({ points, height = 220, metric, sex = 'unspecified', isPremium = true, onUnlockPress }: Props) {
  const { t } = useTranslation();
  const font = useFont();
  const fontFamily = font(600);
  const boldFamily = font(700);

  if (points.length === 0) {
    return <View style={{ height }} />;
  }

  const sorted = [...points].sort((a, b) => a.ageMonths - b.ageMonths);
  const xMin = Math.max(0, Math.floor(sorted[0].ageMonths) - 1);
  const xMax = Math.ceil(sorted[sorted.length - 1].ageMonths) + 1;

  // Compute reference curve points within this age range
  const whoSeries = whoSeriesFor(metric, sex);
  const refAgeKeys = Object.keys(whoSeries).map(Number).filter(a => a >= xMin && a <= xMax);
  // Always include boundary ages for smooth line extensions
  const allRefAges = Array.from(
    new Set([xMin, ...refAgeKeys, xMax].filter(a => a >= 0 && a <= 60))
  ).sort((a, b) => a - b);
  const refPoints = allRefAges.map(age => ({ age, ...interpolateGrowthPoint(whoSeries, age) }));

  // Y range = union of child data and WHO reference within the age range
  const yValues = sorted.map(p => p.value);
  const refYValues = refPoints.flatMap(p => [p.neg2, p.med, p.pos2]);
  const allY = [...yValues, ...refYValues];
  const yMin = Math.floor(Math.min(...allY) * 0.97);
  const yMax = Math.ceil(Math.max(...allY) * 1.03);
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
          fontFamily={fontFamily}
        />
        {/* WHO reference curves — premium only. */}
        {isPremium && (
          <ChartReferenceCurves
            refPoints={refPoints}
            height={height}
            xMin={xMin}
            xRange={xRange}
            yMin={yMin}
            yRange={yRange}
            fontFamily={fontFamily}
          />
        )}
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
      {/* Free-tier upgrade CTA — clean banner below the chart instead of an overlay. */}
      {!isPremium && (
        <TouchableOpacity
          onPress={onUnlockPress}
          activeOpacity={onUnlockPress ? 0.7 : 1}
          style={styles.upgradeCta}>
          <Text style={[styles.upgradeText, { fontFamily }]}>
            {t('home.growth.unlockBands')}
          </Text>
          {onUnlockPress && (
            <Text style={[styles.upgradeLink, { fontFamily: boldFamily }]}>
              {t('home.growth.unlockCta')}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

function ChartAxes({
  height,
  xMin,
  xMax,
  yMin,
  yMax,
  fontFamily,
}: {
  height: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  fontFamily: string;
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

type RefPoint = { age: number; neg2: number; med: number; pos2: number };

function ChartReferenceCurves({
  refPoints,
  height,
  xMin,
  xRange,
  yMin,
  yRange,
  fontFamily,
}: {
  refPoints: RefPoint[];
  height: number;
  xMin: number;
  xRange: number;
  yMin: number;
  yRange: number;
  fontFamily: string;
}) {
  if (refPoints.length < 2) return null;

  const width = 360;
  const plotLeft = PADDING.left;
  const plotRight = width - PADDING.right;
  const plotTop = PADDING.top;
  const plotBottom = height - PADDING.bottom;

  const toX = (m: number) =>
    plotLeft + ((m - xMin) / xRange) * (plotRight - plotLeft);
  const toY = (v: number) =>
    plotBottom - ((v - yMin) / yRange) * (plotBottom - plotTop);

  const buildPath = (key: 'neg2' | 'med' | 'pos2') =>
    refPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.age)} ${toY(p[key])}`)
      .join(' ');

  const dNeg2 = buildPath('neg2');
  const dMed = buildPath('med');
  const dPos2 = buildPath('pos2');

  // Label y positions at the right edge
  const lastRef = refPoints[refPoints.length - 1];
  const labelX = plotRight + 3;

  return (
    <G>
      {/* ±2 SD bands (approx 3rd and 97th percentile) */}
      <Path d={dNeg2} fill="none" stroke={colors.tealLine} strokeWidth={1} strokeDasharray="4 3" />
      <Path d={dPos2} fill="none" stroke={colors.tealLine} strokeWidth={1} strokeDasharray="4 3" />
      {/* Median (50th percentile) */}
      <Path d={dMed} fill="none" stroke={colors.teal} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
      {/* Labels */}
      <SvgText x={labelX} y={toY(lastRef.pos2) + 3} fontSize={8} fontFamily={fontFamily} fill={colors.ink3} textAnchor="start">97%</SvgText>
      <SvgText x={labelX} y={toY(lastRef.med) + 3} fontSize={8} fontFamily={fontFamily} fill={colors.ink3} textAnchor="start">50%</SvgText>
      <SvgText x={labelX} y={toY(lastRef.neg2) + 3} fontSize={8} fontFamily={fontFamily} fill={colors.ink3} textAnchor="start">3%</SvgText>
    </G>
  );
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
                {`${p.value}`}
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
    overflow: 'hidden',
  },
  upgradeCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.tealSoft,
  },
  upgradeText: {
    fontSize: 12,
    color: colors.ink2,
  },
  upgradeLink: {
    fontSize: 12,
    color: colors.teal,
  },
});
