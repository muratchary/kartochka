import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme';
import { useFont } from '../../theme/useFont';
import { SeedlingMark } from './SeedlingMark';

interface Props {
  size?: number;
  color?: string;
  mark?: boolean;
}

export function Wordmark({ size = 24, color = colors.ink, mark = true }: Props) {
  const { t } = useTranslation();
  const font = useFont();

  return (
    <View style={[styles.row, { gap: size * 0.4 }]}>
      {mark && <SeedlingMark size={size * 1.15} />}
      <Text
        style={{
          fontFamily: font(800),
          fontSize: size,
          letterSpacing: -0.4,
          color,
        }}>
        {t('brand.name')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
