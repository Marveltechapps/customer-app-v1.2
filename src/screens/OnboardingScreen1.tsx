import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logger } from '@/utils/logger';

// Dummy static data - Replace with API call later
const ONBOARDING_DATA = {
  title: 'Clean, Healthy Food for Your Family',
  description: 'You want clean, healthy food for your family. We deliver it.',
  image: require('../assets/images/onboarding-screen-1.png'),
  currentPage: 1,
  totalPages: 3,
};

interface OnboardingScreen1Props {
  onSkip?: () => void;
  onNext?: () => void;
}

/**
 * OnboardingScreen1 Component
 * First screen of the onboarding flow
 * Displays information about clean, healthy food delivery
 */
const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({
  onSkip,
  onNext,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [loading, setLoading] = useState<boolean>(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    // TODO: Track onboarding view analytics
    // const trackOnboardingView = async () => {
    //   try {
    //     await analytics.track('onboarding_screen_viewed', {
    //       screen: 'onboarding_1',
    //       timestamp: new Date().toISOString(),
    //     });
    //   } catch (error) {
    //     console.error('Error tracking onboarding view:', error);
    //   }
    // };
    // trackOnboardingView();
  }, []);

  // Placeholder function for navigation - Replace with actual navigation later
  const handleSkip = async () => {
    try {
      // TODO: Mark onboarding as completed
      // await AsyncStorage.setItem('onboarding_completed', 'true');
      
      if (onSkip) {
        onSkip();
      } else {
        // Default navigation behavior - Skip to Login
        navigation.replace('Login');
      }
    } catch (error) {
      logger.error('Error handling skip', error);
    }
  };

  // Placeholder function for navigation - Replace with actual navigation later
  const handleNext = async () => {
    setLoading(true);
    try {
      // TODO: Track onboarding progression
      // await analytics.track('onboarding_next_clicked', {
      //   from_screen: 'onboarding_1',
      //   to_screen: 'onboarding_2',
      // });

      if (onNext) {
        onNext();
      } else {
        // Default navigation behavior - Navigate to OnboardingScreen2
        navigation.navigate('OnboardingScreen2');
      }
    } catch (error) {
      logger.error('Error handling next', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {/* Skip Button */}
      <View style={styles.skipButtonContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Header Section with Image and Text */}
      <View style={styles.headerContainer}>
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={ONBOARDING_DATA.image}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Text Container */}
        <View style={styles.textContainer}>
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>{ONBOARDING_DATA.title}</Text>
          </View>
          <View style={styles.paragraphContainer}>
            <Text style={styles.paragraph}>{ONBOARDING_DATA.description}</Text>
          </View>
        </View>
      </View>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        <View style={[styles.paginationDot, styles.paginationDotActive]} />
        <View style={styles.paginationDot} />
        <View style={styles.paginationDot} />
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, loading && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <View style={styles.nextButtonIcon}>
          <Text style={styles.nextButtonIconText}>›</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Reusable Sub-components (for easy componentization)
const PaginationDot: React.FC<{ active: boolean }> = ({ active }) => (
  <View
    style={[styles.paginationDot, active && styles.paginationDotActive]}
  />
);

const OnboardingButton: React.FC<{
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}> = ({ text, onPress, variant = 'primary', loading = false }) => (
  <TouchableOpacity
    style={[
      styles.nextButton,
      variant === 'secondary' && styles.skipButton,
      loading && styles.nextButtonDisabled,
    ]}
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
  >
    <Text
      style={[
        styles.nextButtonText,
        variant === 'secondary' && styles.skipButtonText,
      ]}
    >
      {text}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  skipButtonContainer: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  skipButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#696969',
    borderRadius: 8.5,
    minWidth: 57.06,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 22.4,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  headerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  imageContainer: {
    width: '100%',
    paddingHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 425,
    borderRadius: 8,
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 20,
  },
  headingContainer: {
    width: '100%',
  },
  heading: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  paragraphContainer: {
    width: '100%',
  },
  paragraph: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 20,
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E8E8E8',
  },
  paginationDotActive: {
    width: 28,
    backgroundColor: '#034703',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#034703',
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 143,
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 22.4,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  nextButtonIcon: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen1;

