import { StyleSheet, View } from 'react-native';

import { colors, radii } from '../theme';

interface Props {
  step: number;
  total: number;
}

export function StepDots({ step, total }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i + 1 === step;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              active ? styles.dotActive : styles.dotInactive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 6, borderRadius: radii.pill },
  dotActive: { width: 22, backgroundColor: colors.teal },
  dotInactive: { width: 6, backgroundColor: colors.border },
});
