import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePurchasesStore, type RedeemResult } from '../src/stores/purchasesStore';
import { colors, radii, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';

export default function RedeemScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const redeemCode = usePurchasesStore((s) => s.redeemCode);
  const promoGranted = usePurchasesStore((s) => s.promoGranted);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already redeemed on this device (and not a fresh redemption this session)
  // → show a confirmation state instead of the input form.
  const showAlready = promoGranted && !success;

  const onRedeem = async () => {
    setError(null);
    setLoading(true);
    const res: RedeemResult = await redeemCode(code);
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      return;
    }
    const map: Record<string, string> = {
      invalid: t('redeem.errorInvalid'),
      exhausted: t('redeem.errorExhausted'),
      network: t('redeem.errorNetwork'),
    };
    setError(map[res.reason] ?? t('redeem.errorInvalid'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
          {t('redeem.title')}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.body}>
        {success || showAlready ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={64} color={colors.teal} />
            <Text style={[styles.successTitle, { fontFamily: font(700) }]}>
              {success ? t('redeem.successTitle') : t('redeem.alreadyTitle')}
            </Text>
            <Text style={[styles.successBody, { fontFamily: font(500) }]}>
              {success ? t('redeem.successBody') : t('redeem.alreadyBody')}
            </Text>
            <Pressable style={styles.button} onPress={() => router.back()}>
              <Text style={[styles.buttonText, { fontFamily: font(700) }]}>
                {t('redeem.done')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={[styles.subtitle, { fontFamily: font(500) }]}>
              {t('redeem.subtitle')}
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: font(600) }]}
              value={code}
              onChangeText={(v) => {
                setCode(v);
                if (error) setError(null);
              }}
              placeholder={t('redeem.placeholder')}
              placeholderTextColor={colors.ink3}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={onRedeem}
            />
            {error ? (
              <Text style={[styles.error, { fontFamily: font(500) }]}>{error}</Text>
            ) : null}
            <Pressable
              style={[styles.button, (loading || !code.trim()) && styles.buttonDisabled]}
              onPress={onRedeem}
              disabled={loading || !code.trim()}>
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={[styles.buttonText, { fontFamily: font(700) }]}>
                  {t('redeem.cta')}
                </Text>
              )}
            </Pressable>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  backBtn: { marginLeft: -spacing.xs },
  title: {
    fontSize: typography.title.fontSize,
    letterSpacing: typography.title.letterSpacing,
    color: colors.ink,
  },
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },
  subtitle: { fontSize: typography.body.fontSize, color: colors.ink2, lineHeight: 22 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: 18,
    color: colors.ink,
    letterSpacing: 1,
  },
  error: { color: colors.error, fontSize: 14 },
  button: {
    backgroundColor: colors.teal,
    borderRadius: radii.lg,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.surface, fontSize: typography.body.fontSize },
  successBox: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.xxl },
  successTitle: { fontSize: 22, color: colors.ink, textAlign: 'center' },
  successBody: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
});
