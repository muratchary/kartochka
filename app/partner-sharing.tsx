import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../src/components/Button';
import { ScreenTitle } from '../src/components/ScreenTitle';
import {
  acceptShareCode,
  generateShareCode,
  getActiveShareCode,
} from '../src/lib/partnerSharing';
import { fullSync, syncDown } from '../src/lib/sync';
import { useAuthStore } from '../src/stores/authStore';
import { selectActiveChild, useChildrenStore } from '../src/stores/childrenStore';
import { usePurchasesStore } from '../src/stores/purchasesStore';
import { colors, radii, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';

export default function PartnerSharingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();

  const user = useAuthStore((s) => s.user);
  const isPremium = usePurchasesStore((s) => s.isPremium);
  const child = useChildrenStore(selectActiveChild);

  const [shareCode, setShareCode] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  // Defense-in-depth: if a free-tier user somehow lands here (deep link,
  // back-stack, expired subscription mid-session), bounce them to the
  // paywall instead of letting them generate/use share codes.
  useEffect(() => {
    if (!isPremium) {
      router.replace('/paywall');
    }
  }, [isPremium, router]);

  // Load any existing active code on mount
  useEffect(() => {
    if (!user || !child || !isPremium) return;
    getActiveShareCode(child.id, user.id)
      .then((code) => setShareCode(code))
      .catch(() => {});
  }, [user, child, isPremium]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.signedOutScroll}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backRowPadded}>
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <ScreenTitle
            title={t('partnerSharing.title')}
            subtitle={t('partnerSharing.signInRequired')}
          />
          <Button
            label={t('partnerSharing.signInCta')}
            variant="primary"
            size="lg"
            full
            onPress={() => router.push('/sign-in')}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!child) {
    return null;
  }

  const handleGenerateCode = async () => {
    setLoadingCode(true);
    try {
      const code = await generateShareCode(child.id, user.id);
      setShareCode(code);
    } catch {
      Alert.alert(t('partnerSharing.errorTitle'), t('partnerSharing.errorBody'));
    } finally {
      setLoadingCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (!shareCode) return;
    await Clipboard.setStringAsync(shareCode);
    Alert.alert('', t('partnerSharing.codeCopied'));
  };

  const handleJoin = async () => {
    const clean = joinCode.trim().toUpperCase();
    if (clean.length !== 6) {
      Alert.alert(t('partnerSharing.invalidCode'));
      return;
    }
    setJoining(true);
    try {
      const result = await acceptShareCode(clean, user.id);
      // Pull the owner's data into our store
      await syncDown(result.ownerUserId);
      // Then push our own data too
      await fullSync(user.id);
      Alert.alert(t('partnerSharing.joinedTitle'), t('partnerSharing.joinedBody'), [
        { text: t('common.close'), onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'invalid_code') {
        Alert.alert(t('partnerSharing.invalidCode'));
      } else if (msg === 'own_code') {
        Alert.alert(t('partnerSharing.ownCodeError'));
      } else {
        Alert.alert(t('partnerSharing.errorTitle'), t('partnerSharing.errorBody'));
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.backRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          </View>

          <ScreenTitle
            title={t('partnerSharing.title')}
            subtitle={t('partnerSharing.subtitle', { name: child.name })}
          />

          {/* ── SHARE section ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontFamily: font(700) }]}>
              {t('partnerSharing.shareSection')}
            </Text>
            <Text style={[styles.sectionBody, { fontFamily: font(400) }]}>
              {t('partnerSharing.shareBody')}
            </Text>

            {shareCode ? (
              <Pressable onPress={handleCopyCode} style={styles.codeBox}>
                <Text style={[styles.codeText, { fontFamily: font(800) }]}>
                  {shareCode}
                </Text>
                <Ionicons name="copy-outline" size={18} color={colors.ink2} />
              </Pressable>
            ) : null}

            <Button
              label={
                loadingCode
                  ? t('partnerSharing.generating')
                  : shareCode
                    ? t('partnerSharing.regenerate')
                    : t('partnerSharing.generateCta')
              }
              variant={shareCode ? 'ghost' : 'primary'}
              size="lg"
              full
              disabled={loadingCode}
              onPress={handleGenerateCode}
            />
            {shareCode ? (
              <Text style={[styles.expireNote, { fontFamily: font(400) }]}>
                {t('partnerSharing.expireNote')}
              </Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* ── JOIN section ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontFamily: font(700) }]}>
              {t('partnerSharing.joinSection')}
            </Text>
            <Text style={[styles.sectionBody, { fontFamily: font(400) }]}>
              {t('partnerSharing.joinBody')}
            </Text>

            <TextInput
              value={joinCode}
              onChangeText={(v) => setJoinCode(v.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder={t('partnerSharing.codePlaceholder')}
              placeholderTextColor={colors.ink3}
              autoCapitalize="characters"
              maxLength={6}
              style={[styles.codeInput, { fontFamily: font(700) }]}
            />

            <Button
              label={joining ? t('partnerSharing.joining') : t('partnerSharing.joinCta')}
              variant="primary"
              size="lg"
              full
              disabled={joining || joinCode.trim().length !== 6}
              onPress={handleJoin}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  backRow: { marginBottom: spacing.md },
  backRowPadded: { marginBottom: spacing.md },
  signedOutScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  section: { gap: spacing.md },
  sectionTitle: {
    fontSize: typography.h2.fontSize,
    color: colors.ink,
  },
  sectionBody: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    lineHeight: 22,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.tealSoft,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.tealLine,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  codeText: {
    fontSize: 36,
    letterSpacing: 8,
    color: colors.tealDark,
  },
  expireNote: {
    fontSize: typography.caption.fontSize,
    color: colors.ink3,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },
  codeInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 4,
    fontSize: 28,
    letterSpacing: 6,
    textAlign: 'center',
    color: colors.ink,
    backgroundColor: colors.surface,
  },
});
