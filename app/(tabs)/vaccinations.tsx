import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function VaccinationsScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('vaccinations.title')}</Text>
      <Text style={styles.empty}>{t('vaccinations.empty')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12, color: '#0f172a' },
  empty: { fontSize: 15, color: '#64748b', textAlign: 'center' },
});
