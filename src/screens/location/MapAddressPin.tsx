import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { LocationStackNavigationProp } from '../../types/navigation';
import Header from '../../components/layout/Header';
import MapPinIcon from '../../assets/images/map-pin-4.svg';
import { logger } from '@/utils/logger';

// Dummy static data - Replace with API call later
interface LocationData {
  title: string;
  address: string;
}

const DUMMY_LOCATION: LocationData = {
  title: 'T. Nagar',
  address:
    'Pondy Bazaar, Sir Thyagaraya Road, Parthasarathi Puram, T. Nagar, Chennai, Tamil Nadu, India',
};

const MapAddressPin: React.FC = () => {
  const navigation = useNavigation<LocationStackNavigationProp>();
  const route = useRoute();
  const routeLocation = (route.params as { location?: LocationData })?.location || DUMMY_LOCATION;
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(routeLocation);
  const [loading, setLoading] = useState(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    const fetchLocationDetails = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/location/details');
        // const data = await response.json();
        // setSelectedLocation(data.location);

        // Using route param or dummy fallback
        setSelectedLocation(routeLocation);
      } catch (error) {
        logger.error('Error fetching location details', error);
        setSelectedLocation(routeLocation);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationDetails();
  }, [routeLocation]);

  const handleConfirm = () => {
    navigation.navigate('EnterCompleteAddress', { location: selectedLocation });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.headerContainer}>
        <Header title="" />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapContainer}>
          {/* Map placeholder - Replace with actual map component */}
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Map View</Text>
            {/* Location pin would be positioned here */}
            <View style={styles.pinContainer}>
              <MapPinIcon width={45} height={16} />
            </View>
          </View>

          {/* Info card at top */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Order will be Delivered here</Text>
              <Text style={styles.infoCardSubtitle}>
                Place the Pin to your exact Location
              </Text>
            </View>
          </View>

          {/* Location card at bottom */}
          <View style={styles.locationCard}>
            <View style={styles.locationCardContent}>
              <View style={styles.locationIconContainer}>
                <MapPinIcon width={20} height={20} />
              </View>
              <View style={styles.locationTextContainer}>
                <View style={styles.locationTitleContainer}>
                  <Text style={styles.locationTitle}>{selectedLocation.title}</Text>
                </View>
                <View style={styles.locationAddressContainer}>
                  <Text style={styles.locationAddress}>{selectedLocation.address}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm & proceed</Text>
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
  headerContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  mapPlaceholder: {
    width: '100%',
    height: 600,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapPlaceholderText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    color: '#666666',
  },
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -22.5 }, { translateY: -8 }],
  },
  infoCard: {
    position: 'absolute',
    top: 190,
    left: 96,
    width: 190.5,
    backgroundColor: '#007D00',
    borderRadius: 10.5,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  infoCardContent: {
    gap: 8,
    paddingHorizontal: 19,
  },
  infoCardTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24, // 1.5em
    color: '#FFFFFF',
    textAlign: 'center',
  },
  infoCardSubtitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18, // 1.5em
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  locationCard: {
    position: 'absolute',
    bottom: 20,
    left: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 10.5,
    padding: 16,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  locationCardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  locationIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextContainer: {
    flex: 1,
    gap: 8,
    width: 282.5,
  },
  locationTitleContainer: {
    width: '100%',
  },
  locationTitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24, // 1.5em
    color: '#1A1A1A',
    textAlign: 'left',
  },
  locationAddressContainer: {
    width: '100%',
  },
  locationAddress: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20, // 1.4285714285714286em
    color: '#6B6B6B',
    textAlign: 'left',
  },
  confirmButton: {
    backgroundColor: '#034703',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20, // 1.4285714285714286em
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default MapAddressPin;

