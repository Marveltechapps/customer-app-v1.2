import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { LocationStackNavigationProp } from '../../types/navigation';
import Header from '../../components/layout/Header';
import SearchIcon from '../../assets/images/search-icon.svg';
import CurrentLocationIcon from '../../assets/images/current-location-icon.svg';
import MapPinIcon from '../../assets/images/map-pin.svg';
import { logger } from '@/utils/logger';

// Dummy static data - Replace with API call later
const SAVED_ADDRESSES_HEADING = 'SAVED ADDRESSES';
const NO_SAVED_ADDRESSES = 'No saved addresses';

const LocationSearch: React.FC = () => {
  const navigation = useNavigation<LocationStackNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/addresses/saved');
        // const data = await response.json();
        // setSavedAddresses(data.addresses);

        // Using dummy data for now
        setSavedAddresses([]);
      } catch (error) {
        logger.error('Error fetching saved addresses', error);
        setSavedAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedAddresses();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 0) {
      navigation.navigate('LocationSearchResults', { searchQuery: text });
    }
  };

  const handleCurrentLocation = () => {
    const currentLocation = {
      title: 'Current Location',
      address: 'Using GPS',
    };
    navigation.navigate('MapAddressPin', { location: currentLocation });
  };

  const handleSavedAddressSelect = (address: any) => {
    navigation.navigate('MapAddressPin', { location: address });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Select your location" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.searchSection}>
            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <View style={styles.searchIconContainer}>
                  <SearchIcon width={16} height={16} />
                </View>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search an area or address"
                  placeholderTextColor="#6B6B6B"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={handleCurrentLocation}
                activeOpacity={0.8}
              >
                <View style={styles.currentLocationIconContainer}>
                  <CurrentLocationIcon width={20} height={20} />
                </View>
                <View style={styles.currentLocationTextContainer}>
                  <View style={styles.currentLocationTitleContainer}>
                    <Text style={styles.currentLocationTitle}>Current Location</Text>
                  </View>
                  <View style={styles.currentLocationMethodContainer}>
                    <Text style={styles.currentLocationMethod}>Using GPS</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.savedAddressesSection}>
              <View style={styles.savedAddressesHeadingContainer}>
                <Text style={styles.savedAddressesHeading}>
                  {SAVED_ADDRESSES_HEADING}
                </Text>
              </View>
              {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
              ) : savedAddresses.length > 0 ? (
                <View style={styles.savedAddressesList}>
                  {savedAddresses.map((address, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.savedAddressItem}
                      onPress={() =>
                        handleSavedAddressSelect(address)
                      }
                      activeOpacity={0.7}
                    >
                      <MapPinIcon width={20} height={20} />
                      <View style={styles.savedAddressTextContainer}>
                        <Text style={styles.savedAddressTitle}>{address.title}</Text>
                        <Text style={styles.savedAddressText}>{address.address}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noAddressesContainer}>
                  <Text style={styles.noAddressesText}>{NO_SAVED_ADDRESSES}</Text>
                </View>
              )}
            </View>
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
    gap: 24,
  },
  searchSection: {
    width: '100%',
    gap: 16,
  },
  searchRow: {
    width: '100%',
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 8.5,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  searchIconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20, // 1.4285714285714286em
    color: '#1A1A1A',
  },
  currentLocationButton: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 10.5,
    padding: 12,
    alignItems: 'center',
  },
  currentLocationIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationTextContainer: {
    flex: 1,
    gap: 4,
  },
  currentLocationTitleContainer: {
    width: '100%',
  },
  currentLocationTitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24, // 1.5em
    color: '#00A400',
    textAlign: 'left',
  },
  currentLocationMethodContainer: {
    width: '100%',
  },
  currentLocationMethod: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18, // 1.5em
    color: '#00A400',
    textAlign: 'left',
  },
  savedAddressesSection: {
    width: '100%',
    gap: 12,
  },
  savedAddressesHeadingContainer: {
    width: '100%',
  },
  savedAddressesHeading: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16.8, // 1.4em
    color: '#6B6B6B',
    textAlign: 'left',
  },
  savedAddressesList: {
    width: '100%',
    gap: 12,
  },
  savedAddressItem: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10.5,
    borderWidth: 1,
    borderColor: '#D1D1D1',
  },
  savedAddressTextContainer: {
    flex: 1,
    gap: 4,
  },
  savedAddressTitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24, // 1.5em
    color: '#1A1A1A',
    textAlign: 'left',
  },
  savedAddressText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18, // 1.5em
    color: '#6B6B6B',
    textAlign: 'left',
  },
  noAddressesContainer: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  noAddressesText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 22.4, // 1.6em
    color: '#6B6B6B',
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

export default LocationSearch;

