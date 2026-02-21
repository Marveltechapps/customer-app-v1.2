import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { LocationStackNavigationProp } from '../../types/navigation';
import Header from '../../components/layout/Header';
import LocationIcon from '../../assets/images/location-icon.svg';
import { logger } from '@/utils/logger';

// Dummy static data - Replace with API call later
const EMPTY_STATE_MESSAGE = 'No address Found';

// Shared dummy data for checking - Replace with actual API call later
const DUMMY_ADDRESSES = [
  {
    id: '1',
    title: 'T. Nagar',
    address:
      'Pondy Bazaar, Sir Thyagaraya Road, Parthasarathi Puram, T. Nagar, Chennai, Tamil Nadu, India',
  },
];

const SavedAddressesEmpty: React.FC = () => {
  const navigation = useNavigation<LocationStackNavigationProp>();
  const [loading, setLoading] = useState(true);

  // Check for addresses and navigate to list screen if addresses exist
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/addresses');
        // const data = await response.json();
        // if (data.addresses && data.addresses.length > 0) {
        //   navigation.replace('SavedAddressesList');
        //   return;
        // }

        // Using dummy data for now - if addresses exist, navigate to list
        // Remove this when implementing actual API
        if (DUMMY_ADDRESSES && DUMMY_ADDRESSES.length > 0) {
          navigation.replace('SavedAddressesList');
          return;
        }
      } catch (error) {
        logger.error('Error fetching addresses', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [navigation]);

  const handleAddNewAddress = () => {
    navigation.navigate('LocationSearch');
  };

  // Show loading state while checking for addresses
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header title="Saved Addresses" />
        <View style={styles.contentContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Saved Addresses" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.emptyStateContainer}>
            <View style={styles.iconContainer}>
              <LocationIcon width={100} height={100} />
            </View>
            <View style={styles.messageContainer}>
              <Text style={styles.emptyMessage}>{EMPTY_STATE_MESSAGE}</Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAddNewAddress}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Add New Address</Text>
            </TouchableOpacity>
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
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyMessage: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12.25,
    lineHeight: 17.5, // 1.4285714285714286em
    color: '#666666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#034703',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20, // 1.4285714285714286em
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default SavedAddressesEmpty;

