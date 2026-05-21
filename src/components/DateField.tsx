import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { SupportedLanguage } from '../i18n';
import { colors, radii, spacing, typography } from '../theme';
import { useFont } from '../theme/useFont';
import { Button } from './Button';

interface Props {
  value: string | null;
  onChange: (iso: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

function formatDate(date: Date, lang: SupportedLanguage): string {
  try {
    const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : 'en';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function DateField({ value, onChange, placeholder, minimumDate, maximumDate }: Props) {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const [open, setOpen] = useState(false);

  const date = value ? new Date(value) : null;
  const lang = (i18n.language || 'en') as SupportedLanguage;

  return (
    <View>
      <Pressable onPress={() => setOpen(true)} style={styles.field}>
        <Text
          style={{
            fontFamily: font(600),
            color: date ? colors.ink : colors.ink3,
            fontSize: typography.body.fontSize,
          }}>
          {date ? formatDate(date, lang) : (placeholder ?? '')}
        </Text>
      </Pressable>
      {open && (
        <DateTimePicker
          value={date ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate ?? new Date()}
          onChange={(_, selected) => {
            if (Platform.OS !== 'ios') setOpen(false);
            if (selected) {
              onChange(selected.toISOString().slice(0, 10));
            }
          }}
        />
      )}
      {open && Platform.OS === 'ios' && (
        <Button
          label={t('more.ok')}
          variant="ghost"
          size="sm"
          onPress={() => setOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
});
