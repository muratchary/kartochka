import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.title')}</Text>
      <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#475569', textAlign: 'center' },
});
