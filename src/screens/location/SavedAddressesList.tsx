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
import MapPinIcon from '../../assets/images/map-pin.svg';
import { logger } from '@/utils/logger';

// Dummy static data - Replace with API call later
interface Address {
  id: string;
  title: string;
  address: string;
}

const DUMMY_ADDRESSES: Address[] = [
  {
    id: '1',
    title: 'T. Nagar',
    address:
      'Pondy Bazaar, Sir Thyagaraya Road, Parthasarathi Puram, T. Nagar, Chennai, Tamil Nadu, India',
  },
];

const SavedAddressesList: React.FC = () => {
  const navigation = useNavigation<LocationStackNavigationProp>();
  const [addresses, setAddresses] = useState<Address[]>(DUMMY_ADDRESSES);
  const [loading, setLoading] = useState(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/addresses');
        // const data = await response.json();
        // setAddresses(data.addresses);

        // Using dummy data for now
        setAddresses(DUMMY_ADDRESSES);
      } catch (error) {
        logger.error('Error fetching addresses', error);
        setAddresses(DUMMY_ADDRESSES);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleAddNewAddress = () => {
    navigation.navigate('LocationSearch');
  };

  const handleAddressPress = (address: Address) => {
    // TODO: Handle address selection/editing
    logger.info('Address selected', { address });
  };

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
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : addresses.length > 0 ? (
            <View style={styles.addressesListContainer}>
              {addresses.map((address) => (
                <View key={address.id} style={styles.addressCard}>
                  <View style={styles.addressContent}>
                    <View style={styles.iconContainer}>
                      <MapPinIcon width={20} height={20} />
                    </View>
                    <View style={styles.addressTextContainer}>
                      <View style={styles.titleContainer}>
                        <Text style={styles.addressTitle}>{address.title}</Text>
                      </View>
                      <View style={styles.addressContainer}>
                        <Text style={styles.addressText}>{address.address}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.editButtonContainer}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleAddressPress(address)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
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
    flex: 1,
  },
  addressesListContainer: {
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10.5,
    padding: 20,
    marginBottom: 8,
  },
  addressContent: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressTextContainer: {
    flex: 1,
    gap: 4,
  },
  titleContainer: {
    width: '100%',
  },
  addressTitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24, // 1.5em
    color: '#1A1A1A',
    textAlign: 'left',
  },
  addressContainer: {
    width: '100%',
  },
  addressText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18, // 1.5em
    color: '#6B6B6B',
    textAlign: 'left',
  },
  editButtonContainer: {
    alignItems: 'flex-end',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(3, 71, 3, 0.3)',
    borderRadius: 3.5,
  },
  editButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 19.2, // 1.6em
    color: '#034703',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 8,
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

export default SavedAddressesList;

