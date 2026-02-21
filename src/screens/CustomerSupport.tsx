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
import type { CustomerSupportStackNavigationProp } from '../types/navigation';
import Header from '../components/layout/Header';
import HelpItem from '../components/features/support/HelpItem';
import SupportCard from '../components/features/support/SupportCard';
import { logger } from '@/utils/logger';

// Dummy static data - Replace with API call later
const HELP_ITEMS = [
  'General Inquiry',
  'Feedback & Suggestions',
  'Order / Products Related ',
  'Shipping & Delivery',
  'Payment Related',
  'Returns & Exchanges',
  'Coupons & Offers',
  'Location', // Added Location section
];

const CustomerSupport: React.FC = () => {
  const navigation = useNavigation<CustomerSupportStackNavigationProp>();
  const [helpItems, setHelpItems] = useState<string[]>(HELP_ITEMS);
  const [loading, setLoading] = useState(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    const fetchHelpItems = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/help/categories');
        // const data = await response.json();
        // setHelpItems(data.categories);

        // Using dummy data for now
        setHelpItems(HELP_ITEMS);
      } catch (error) {
        logger.error('Error fetching help items', error);
        // Fallback to dummy data
        setHelpItems(HELP_ITEMS);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpItems();
  }, []);

  const handleHelpItemPress = (item: string) => {
    // Check if this is the Location section
    if (item === 'Location' || item.toLowerCase().includes('location')) {
      // Navigate to Addresses stack (LocationNavigator)
      navigation.getParent()?.navigate('Addresses');
      return;
    }

    // Navigate to HelpSubSection with the section name
    navigation.navigate('HelpSubSection', { sectionName: item });
  };

  const handleChatPress = () => {
    // Handle chat button press
    logger.info('Chat pressed');
    // TODO: Implement chat functionality
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Help & support" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.productListContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Help</Text>
            </View>
            <View style={styles.helpItemsContainer}>
              {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
              ) : (
                helpItems.map((item, index) => (
                  <View key={index} style={styles.helpItemWrapper}>
                    <HelpItem
                      title={item}
                      onPress={() => handleHelpItemPress(item)}
                    />
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Support</Text>
            </View>
            <SupportCard onChatPress={handleChatPress} />
          </View>
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
  productListContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionHeader: {
    width: '100%',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24, // 1.5em = 24px
    color: '#1A1A1A',
    textAlign: 'left',
  },
  helpItemsContainer: {
    width: '100%',
  },
  helpItemWrapper: {
    marginBottom: 5,
  },
  loadingText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default CustomerSupport;

