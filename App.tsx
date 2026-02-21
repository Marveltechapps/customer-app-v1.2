/**
 * React Native App - Main Entry Point
 * 
 * This is the main entry point of the application.
 * Default screen: NoInternet (checks connectivity on startup)
 * 
 * Navigation Structure:
 * - NoInternet (main/default screen)
 *   - Shows when there's no internet connection
 *   - Reload button to check connectivity
 * - Login
 *   - Mobile number input
 *   - OTP verification flow
 * - Checkout
 *   - Empty cart state
 *   - Cart with products (no address)
 *   - Cart with products and address
 * - Order Status
 *   - Order Status Main
 *   - Order Status Details
 * - Settings
 *   - Orders
 *   - Customer Support & FAQ
 *   - Addresses
 *   - Refunds
 *   - Profile
 *   - Payment management
 *   - General Info
 *   - Notifications
 *
 * @format
 */

import React, { useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { RootStackParamList } from './src/types/navigation';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/contexts/CartContext';
import { NetworkProvider, useNetwork } from './src/contexts/NetworkContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { setupGlobalErrorHandler } from './src/utils/errorHandler';
import { analytics } from './src/utils/analytics';

// Sentry Error Tracking
// To enable Sentry error tracking:
// 1. Install: npm install @sentry/react-native
// 2. Add SENTRY_DSN to your .env file
// 3. Uncomment and configure the initialization below
//
// import * as Sentry from '@sentry/react-native';
// import { getEnvConfigSafe } from './src/config/env';
//
// const envConfig = getEnvConfigSafe();
// const sentryDsn = process.env.SENTRY_DSN;
//
// if (sentryDsn) {
//   Sentry.init({
//     dsn: sentryDsn,
//     environment: envConfig.env,
//     enableAutoSessionTracking: true,
//     tracesSampleRate: envConfig.env === 'production' ? 0.2 : 1.0,
//   });
// }

// Inner component that has access to NetworkContext
const AppContent: React.FC = () => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList> | null>(null);
  const { setNavigationRef } = useNetwork();

  return (
    <ErrorBoundary
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1A1A1A', marginBottom: 12, textAlign: 'center' }}>
            Navigation Error
          </Text>
          <Text style={{ fontSize: 14, color: '#6B6B6B', textAlign: 'center', marginBottom: 24 }}>
            The app encountered an error in navigation. Please restart the app.
          </Text>
        </View>
      }
      onError={(error, errorInfo) => {
        console.error('Navigation error:', error, errorInfo);
      }}
    >
      <NavigationContainer
        ref={(ref) => {
          navigationRef.current = ref;
          setNavigationRef(ref);
        }}
      >
        <ErrorBoundary
          fallback={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#1A1A1A', marginBottom: 12, textAlign: 'center' }}>
                App Navigator Error
              </Text>
              <Text style={{ fontSize: 14, color: '#6B6B6B', textAlign: 'center' }}>
                An error occurred in the app navigator. Please restart the app.
              </Text>
            </View>
          }
        >
          <AppNavigator />
        </ErrorBoundary>
      </NavigationContainer>
    </ErrorBoundary>
  );
};

function App() {
  useEffect(() => {
    // Setup global error handler
    setupGlobalErrorHandler();
    
    // Track app launch
    analytics.trackScreenView('App');
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NetworkProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
