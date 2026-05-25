import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

const CATEGORY_EMOJI: Record<string, string> = {
  motor: '🏃',
  language: '💬',
  social: '😊',
  cognitive: '🧠',
};

interface Props {
  milestoneName: string;
  categoryKey: string;
  categoryLabel: string;
  ageText: string;
  dateText: string;
  childName: string;
  photoUri?: string;
  childPhotoUri?: string;
  reachedLabel: string;
}

export function MilestoneShareCard({
  milestoneName,
  categoryKey,
  categoryLabel,
  ageText,
  dateText,
  childName,
  photoUri,
  childPhotoUri,
  reachedLabel,
}: Props) {
  return (
    <View style={styles.card}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        {childPhotoUri ? (
          <Image source={{ uri: childPhotoUri }} style={styles.childPhoto} />
        ) : (
          <View style={styles.childPhotoPlaceholder}>
            <Text style={styles.childPhotoInitial}>{childName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.childName} numberOfLines={1}>{childName}</Text>
          <Text style={styles.reachedText}>{reachedLabel}</Text>
        </View>
        <Text style={styles.logo}>🌱</Text>
      </View>

      {/* ── Photo or emoji ──────────────────────────────── */}
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.milestonePhoto} resizeMode="cover" />
      ) : (
        <View style={styles.emojiSection}>
          <Text style={styles.emoji}>{CATEGORY_EMOJI[categoryKey] ?? '✨'}</Text>
        </View>
      )}

      {/* ── Info ───────────────────────────────────────── */}
      <View style={styles.info}>
        <Text style={styles.milestoneName} numberOfLines={2}>{milestoneName}</Text>
        <View style={styles.metaRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{categoryLabel.toUpperCase()}</Text>
          </View>
          <Text style={styles.ageText}>{ageText}</Text>
        </View>
        <Text style={styles.dateText}>{dateText}</Text>
      </View>

      {/* ── Watermark ──────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.watermark}>kartochka.app</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 340,
    backgroundColor: colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.teal,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  childPhoto: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  childPhotoPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childPhotoInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  headerText: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  reachedText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '600',
  },
  logo: {
    fontSize: 22,
  },
  milestonePhoto: {
    width: '100%',
    height: 220,
  },
  emojiSection: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tealSoft,
  },
  emoji: {
    fontSize: 76,
  },
  info: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 6,
  },
  milestoneName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    backgroundColor: colors.tealSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.tealDark,
    letterSpacing: 0.8,
  },
  ageText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink2,
  },
  dateText: {
    fontSize: 12,
    color: colors.ink3,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },
  watermark: {
    fontSize: 11,
    color: colors.tealDark,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
