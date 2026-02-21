import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../types/navigation';
import Text from '../components/common/Text';
import VerificationCheckIcon from '../components/icons/VerificationCheckIcon';

const VerificationSuccess: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  // Animation values
  const containerScale = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Container animation - scale and fade in (0-400ms)
    const containerAnimation = Animated.parallel([
      Animated.timing(containerScale, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    // Icon animation - scale and fade in (starts at 200ms, completes at 600ms)
    const iconAnimation = Animated.parallel([
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 400,
        delay: 200,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    // Text animation - fade in and slide up (starts at 400ms, completes at 800ms)
    const textAnimation = Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 400,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    // Start all animations
    containerAnimation.start();
    iconAnimation.start();
    textAnimation.start();

    // Navigate to MainTabs after 1 second (1000ms)
    const navigationTimer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 1000);

    return () => {
      clearTimeout(navigationTimer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Container with checkmark icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: containerOpacity,
                transform: [{ scale: containerScale }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  opacity: iconOpacity,
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <VerificationCheckIcon width={28} height={28} />
            </Animated.View>
          </Animated.View>

          {/* Text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <Text style={styles.text}>Verification Successful</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 11,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(3, 71, 3, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24, // 1.5em
    color: '#101828',
    textAlign: 'center',
  },
});

export default VerificationSuccess;

