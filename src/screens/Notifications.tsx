import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../types/navigation';
import Header from '../components/layout/Header';
import NotificationItem from '../components/features/notification/NotificationItem';
import { logger } from '@/utils/logger';

// Dummy static data - Replace with API call later
interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const DUMMY_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: '1',
    title: 'WhatsApp  Messages',
    description: 'Get updates from us on WhatsApp',
    enabled: false,
  },
  {
    id: '2',
    title: 'Push notification',
    description: 'Turn on to get live order updates & offers',
    enabled: true,
  },
];

const Notifications: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  // State for API integration (ready for future use)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/notification-settings');
        // const data = await response.json();
        // setNotificationSettings(data.settings);

        // Using dummy data for now
        setNotificationSettings(DUMMY_NOTIFICATION_SETTINGS);
      } catch (error) {
        logger.error('Error fetching notification settings', error);
        // Fallback to dummy data
        setNotificationSettings(DUMMY_NOTIFICATION_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSettings();
  }, []);


  const handleToggleChange = async (id: string, enabled: boolean) => {
    // Update local state
    setNotificationSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled } : setting
      )
    );

    // TODO: Replace with actual API call
    // await fetch(`/api/notification-settings/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ enabled }),
    // });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header 
        title="Notifications" 
        titleStyle={{ fontSize: 18, color: '#4C4C4C' }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.itemsContainer}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : notificationSettings.length > 0 ? (
            notificationSettings.map((setting) => (
              <View key={setting.id} style={styles.itemWrapper}>
                <NotificationItem
                  title={setting.title}
                  description={setting.description}
                  enabled={setting.enabled}
                  onToggle={(enabled) => handleToggleChange(setting.id, enabled)}
                />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No notification settings available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  itemsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  itemWrapper: {
    width: '100%',
  },
  loadingText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default Notifications;

