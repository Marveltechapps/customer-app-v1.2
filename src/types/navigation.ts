import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Order } from '../screens/MyOrders';

/**
 * Type definitions
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

import type { RouteProp } from '@react-navigation/native';

export interface NavigationProps<T extends keyof RootStackParamList = keyof RootStackParamList> {
  navigation?: NativeStackNavigationProp<RootStackParamList, T>;
  route?: RouteProp<RootStackParamList, T>;
}

// Main Tab Navigator - Bottom tab navigation
export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: { appliedCoupon?: { code: string; discount: number } } | undefined;
};

// Root Stack - Main navigation from Settings
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  NoInternet: undefined;
  Login: undefined;
  OTPVerification: { phoneNumber: string };
  VerificationSuccess: undefined;
  MainTabs: {
    screen?: 'Home' | 'Categories' | 'Cart';
    params?: {
      appliedCoupon?: { code: string; discount: number };
    };
  } | undefined; // Main tab navigator
  OrderStatus: undefined;
  Settings: undefined;
  Orders: undefined;
  CustomerSupport: undefined;
  Addresses: undefined;
  Refunds: undefined;
  Profile: undefined;
  PaymentManagement: undefined;
  GeneralInfo: {
    screen?: 'GeneralInfo' | 'TermsAndConditions' | 'PrivacyPolicy';
  } | undefined;
  Notifications: undefined;
  Checkout: { appliedCoupon?: { code: string; discount: number } } | undefined;
  Coupons: undefined;
  Home: undefined; // Keep for backward compatibility
  Category: undefined;
  Search: undefined;
  SearchResults: { query: string };
  ProductDetail: { productId: string };
  CategoryProducts: { categoryId: string; categoryName: string };
  BannerDetail: { title: string };
  TinyTimmies: undefined;
  CategoriesExpo: undefined;
};

// Refunds Stack - Nested navigation for refunds
export type RefundsStackParamList = {
  Refunds: undefined;
  RefundDetails: { orderNumber: string };
};

// Orders Stack - Nested navigation for orders flow
export type OrdersStackParamList = {
  MyOrders: undefined;
  OrderCanceledDetails: { orderId?: string };
  OrderSuccessfulDetails: { orderId?: string };
  RateOrder: { orderId?: string };
  RatingSuccess: undefined;
  OrderStatusMain: undefined;
  OrderStatusDetails: { orderId?: string; status: 'getting-packed' | 'on-the-way' | 'arrived' };
  OrderItemsDetails: {
    orderId?: string;
    items?: Array<{
      id: string;
      name: string;
      weight: string;
      quantity: number;
      discountedPrice: number;
      originalPrice: number;
      image?: string;
    }>;
    status?: 'getting-packed' | 'on-the-way' | 'arrived';
    deliveryAddress?: string;
    totalSavings?: number;
    itemTotal?: number;
    handlingCharge?: number;
    deliveryFee?: number;
    totalBill?: number;
  };
};

// Location Stack - Nested navigation for address flow
export type LocationStackParamList = {
  SavedAddressesEmpty: undefined;
  SavedAddressesList: undefined;
  LocationSearch: undefined;
  LocationSearchResults: { searchQuery?: string };
  MapAddressPin: { location?: any };
  EnterCompleteAddress: { location?: any };
  AddressSavedSuccess: undefined;
};

// General Info Stack - Nested navigation for general info
export type GeneralInfoStackParamList = {
  GeneralInfo: undefined;
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
};

// Customer Support Stack - Nested navigation for help & support
export type CustomerSupportStackParamList = {
  CustomerSupport: undefined;
  HelpSubSection: { sectionName: string };
};

// Navigation prop types
// RouteProp is imported above with NavigationProps

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
export type OrdersStackNavigationProp = NativeStackNavigationProp<OrdersStackParamList>;
export type OrdersStackRouteProp<T extends keyof OrdersStackParamList> = RouteProp<OrdersStackParamList, T>;
export type LocationStackNavigationProp = NativeStackNavigationProp<LocationStackParamList>;
export type GeneralInfoStackNavigationProp = NativeStackNavigationProp<GeneralInfoStackParamList>;
export type CustomerSupportStackNavigationProp = NativeStackNavigationProp<CustomerSupportStackParamList>;
export type RefundsStackNavigationProp = NativeStackNavigationProp<RefundsStackParamList>;

