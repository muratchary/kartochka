import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '../../theme';

interface Props {
  size?: number;
  background?: string;
  leaf?: string;
  bud?: string;
  radius?: number;
}

export function SeedlingMark({
  size = 48,
  background = colors.teal,
  leaf = '#FFFFFF',
  bud = colors.amber,
  radius,
}: Props) {
  const r = radius == null ? size * 0.22 : radius;
  return (
    <Svg width={size} height={size} viewBox="0 0 232 232">
      <Rect width={232} height={232} rx={r * (232 / size)} fill={background} />
      <Path d="M116 178 L116 110" stroke={leaf} strokeWidth={14} strokeLinecap="round" fill="none" />
      <Path d="M116 124 C100 110 78 110 70 96 C84 88 108 90 116 110 Z" fill={leaf} />
      <Path d="M116 118 C132 100 156 102 168 88 C162 74 134 70 116 102 Z" fill={leaf} />
      <Circle cx={116} cy={90} r={11} fill={bud} />
    </Svg>
  );
}
