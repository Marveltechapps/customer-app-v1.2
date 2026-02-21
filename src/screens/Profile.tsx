import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../types/navigation';
import Header from '../components/layout/Header';
import ProfileUpdateSuccess from './ProfileUpdateSuccess';
import { logger } from '@/utils/logger';

// Dummy static data - Replace with API call later
interface ProfileData {
  name: string;
  mobileNumber: string;
  emailAddress: string;
}

const DUMMY_PROFILE_DATA: ProfileData = {
  name: '',
  mobileNumber: '',
  emailAddress: '',
};

const Profile: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  // State for form fields
  const [name, setName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/profile');
        // const data = await response.json();
        // setName(data.name);
        // setMobileNumber(data.mobileNumber);
        // setEmailAddress(data.emailAddress);

        // Using dummy data for now
        setName(DUMMY_PROFILE_DATA.name);
        setMobileNumber(DUMMY_PROFILE_DATA.mobileNumber);
        setEmailAddress(DUMMY_PROFILE_DATA.emailAddress);
      } catch (error) {
        logger.error('Error fetching profile data', error);
        // Fallback to dummy data
        setName(DUMMY_PROFILE_DATA.name);
        setMobileNumber(DUMMY_PROFILE_DATA.mobileNumber);
        setEmailAddress(DUMMY_PROFILE_DATA.emailAddress);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);


  const handleUpdate = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, mobileNumber, emailAddress }),
      // });
      // if (response.ok) {
      //   if (onUpdateSuccess) {
      //     onUpdateSuccess();
      //   }
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Show success modal
      setShowSuccessModal(true);
      
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      logger.error('Error updating profile', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Profile" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Name*</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Details"
              placeholderTextColor="#6B6B6B"
              value={name}
              onChangeText={setName}
              editable={!loading}
              textAlignVertical="center"
            />
          </View>

          {/* Mobile Number Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Mobile number*</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Details"
              placeholderTextColor="#6B6B6B"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              editable={!loading}
              textAlignVertical="center"
            />
          </View>

          {/* Email Address Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Email Adress*</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Details"
              placeholderTextColor="#6B6B6B"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              textAlignVertical="center"
            />
          </View>

          {/* Privacy Message */}
          <Text style={styles.privacyText}>We promise not spam you</Text>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.updateButton, loading && styles.updateButtonDisabled]}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>
              {loading ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Success Modal */}
      <ProfileUpdateSuccess
        visible={showSuccessModal}
        onDone={() => setShowSuccessModal(false)}
      />
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
  formContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 16,
  },
  inputContainer: {
    width: '100%',
    gap: 8,
  },
  labelContainer: {
    width: '100%',
  },
  label: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20, // 1.4285714285714286em = ~20px
    color: '#1A1A1A',
    textAlign: 'left',
  },
  textInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 3.5,
    paddingTop: 11,
    paddingBottom: 11,
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '400',
    textAlign: 'left',
    minHeight: 44, // Minimum height to ensure text is not cut off
    includeFontPadding: false, // Removes extra padding on Android for better alignment
    // Remove lineHeight to let React Native calculate it automatically based on fontSize
  },
  privacyText: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 16, // 1.1428571428571428em = ~16px
    color: '#828282',
    textAlign: 'left',
  },
  updateButton: {
    width: '100%',
    backgroundColor: '#034703',
    opacity: 0.8,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.5,
  },
  updateButtonText: {
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 24, // 1.7142857142857142em = ~24px
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default Profile;

