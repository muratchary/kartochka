import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { colors } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function TabsLayout() {
  const { t } = useTranslation();
  const font = useFont();

  const tabBarLabelStyle = {
    fontFamily: font(700),
    fontSize: 10.5,
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.ink3,
        tabBarLabelStyle,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="vaccines"
        options={{
          title: t('tabs.vaccines'),
          tabBarIcon: ({ color, size }) => <Ionicons name="medkit-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="growth"
        options={{
          title: t('tabs.growth'),
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="milestones"
        options={{
          title: t('tabs.milestones'),
          tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-done-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('tabs.more'),
          tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
