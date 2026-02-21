/**
 * Test Helpers
 * Utility functions for testing
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { CartProvider } from '../../src/contexts/CartContext';
import { NetworkProvider } from '../../src/contexts/NetworkContext';

/**
 * Render component with providers
 */
export const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <NetworkProvider>
        <CartProvider>
          {component}
        </CartProvider>
      </NetworkProvider>
    </NavigationContainer>
  );
};

/**
 * Mock navigation
 */
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

/**
 * Mock route
 */
export const mockRoute = (params: any = {}) => ({
  key: 'test-route',
  name: 'TestScreen',
  params,
});

