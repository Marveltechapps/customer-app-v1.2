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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { LocationStackNavigationProp } from '../../types/navigation';
import Header from '../../components/layout/Header';
import AddressSavedSuccess from './AddressSavedSuccess';
import MapPinIcon from '../../assets/images/map-pin-4-alt.svg';
import { logger } from '@/utils/logger';

// Dummy static data - Replace with API call later
interface AddressFormData {
  houseNo: string;
  building: string;
  landmark: string;
  label: 'Home' | 'Work' | 'Other';
}

const ADDRESS_LABELS: ('Home' | 'Work' | 'Other')[] = ['Home', 'Work', 'Other'];

const EnterCompleteAddress: React.FC = () => {
  const navigation = useNavigation<LocationStackNavigationProp>();
  const route = useRoute();
  const location = (route.params as { location?: { title: string; address: string } })?.location || {
    title: 'T. Nagar',
    address:
      'Pondy Bazaar, Sir Thyagaraya Road, Parthasarathi Puram, T. Nagar, Chennai, Tamil Nadu, India',
  };
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    houseNo: '',
    building: '',
    landmark: '',
    label: 'Home',
  });
  const [loading, setLoading] = useState(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/address/form');
        // const data = await response.json();
        // setFormData(data.formData);
      } catch (error) {
        logger.error('Error fetching form data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, []);

  const handleInputChange = (field: keyof AddressFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLabelSelect = (label: 'Home' | 'Work' | 'Other') => {
    setFormData((prev) => ({ ...prev, label }));
  };

  const handleSave = () => {
    // TODO: Replace with actual API call
    // await fetch('/api/addresses', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ ...formData, location }),
    // });
    setShowSuccess(true);
  };

  const handleChangeLocation = () => {
    navigation.navigate('LocationSearch');
  };

  const handleSuccessDone = () => {
    setShowSuccess(false);
    navigation.navigate('SavedAddressesList');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Enter complete address" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Location Card */}
          <View style={styles.locationCard}>
            <View style={styles.locationCardContent}>
              <View style={styles.locationIconContainer}>
                <MapPinIcon width={20} height={20} />
              </View>
              <View style={styles.locationTextContainer}>
                <View style={styles.locationTitleContainer}>
                  <Text style={styles.locationTitle}>{location.title}</Text>
                </View>
                <View style={styles.locationAddressContainer}>
                  <Text style={styles.locationAddress}>{location.address}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleChangeLocation}
              activeOpacity={0.7}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>House No. & Floor</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter Details"
                placeholderTextColor="#6B6B6B"
                value={formData.houseNo}
                onChangeText={(value) => handleInputChange('houseNo', value)}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Building & Block No.</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter Details"
                placeholderTextColor="#6B6B6B"
                value={formData.building}
                onChangeText={(value) => handleInputChange('building', value)}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Landmark & Area name (Optional)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter Details"
                placeholderTextColor="#6B6B6B"
                value={formData.landmark}
                onChangeText={(value) => handleInputChange('landmark', value)}
              />
            </View>
          </View>

          {/* Address Label Selection */}
          <View style={styles.labelCard}>
            <View style={styles.labelSectionHeader}>
              <Text style={styles.labelSectionTitle}>Add Address Label</Text>
            </View>
            <View style={styles.labelButtonsContainer}>
              {ADDRESS_LABELS.map((label) => (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.labelButton,
                    formData.label === label && styles.labelButtonActive,
                  ]}
                  onPress={() => handleLabelSelect(label)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.labelButtonText,
                      formData.label === label && styles.labelButtonTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Address</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AddressSavedSuccess visible={showSuccess} onDone={handleSuccessDone} />
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
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10.5,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
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
    gap: 4,
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
    fontSize: 12,
    lineHeight: 18, // 1.5em
    color: '#6B6B6B',
    textAlign: 'left',
  },
  changeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(3, 71, 3, 0.3)',
    borderRadius: 3.5,
  },
  changeButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 19.2, // 1.6em
    color: '#034703',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10.5,
    padding: 16,
    gap: 16,
  },
  inputContainer: {
    width: '100%',
    gap: 4,
  },
  labelContainer: {
    width: '100%',
    paddingBottom: 4,
  },
  label: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18, // 1.5em
    color: '#1A1A1A',
    textAlign: 'left',
  },
  input: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 3.5,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18, // 1.5em
    color: '#1A1A1A',
  },
  labelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10.5,
    padding: 16,
    gap: 12,
  },
  labelSectionHeader: {
    width: '100%',
  },
  labelSectionTitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20, // 1.4285714285714286em
    color: '#1A1A1A',
    textAlign: 'left',
  },
  labelButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  labelButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  labelButtonActive: {
    backgroundColor: 'rgba(3, 71, 3, 0.1)',
    borderColor: '#034703',
  },
  labelButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 19.2, // 1.6em
    color: '#1A1A1A',
    textAlign: 'center',
  },
  labelButtonTextActive: {
    color: '#034703',
  },
  saveButton: {
    backgroundColor: '#034703',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20, // 1.4285714285714286em
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default EnterCompleteAddress;

