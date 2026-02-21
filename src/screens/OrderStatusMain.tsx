/**
 * Order Status Main Screen
 * 
 * This is the main Order Status screen showing active orders with map view.
 * Displays order cards with delivery information, status, and map visualization.
 * 
 * Features:
 * - Shows active orders with delivery time
 * - Displays map with home and store locations
 * - Shows phone icon when delivery time < 3 minutes
 * - Navigates to order details when order card is clicked
 * - Ready for API integration
 * 
 * @format
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import type { OrdersStackNavigationProp } from '../types/navigation';
import Header from '../components/layout/Header';
import RouteMap from '../components/features/location/RouteMap';
import ErrorBoundary from '../components/common/ErrorBoundary';
import PhoneIcon from '../assets/images/phone-icon.svg';
import HomeIcon from '../assets/images/home-icon.svg';
import StoreIcon from '../assets/images/store-icon.svg';
import ChevronRightIcon from '../assets/images/chevron-right.svg';
import ChatIconOrder from '../assets/images/chat-icon-order.svg';
import OrderStatusIcon from '../assets/images/order-status-icon.svg';
import { logger } from '@/utils/logger';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// Dummy static data - Replace with API call later
export interface OrderStatus {
  id: string;
  status: 'getting-packed' | 'on-the-way' | 'arrived';
  deliveryTimeMinutes: number; // Time remaining in minutes
  statusMessage: string;
  itemCount: number;
  savings: number;
  deliveryAddress: string;
  deliveryPartnerName?: string;
  productImage?: string;
}

// Dummy static data - Replace with API call later
const DUMMY_ORDER: OrderStatus = {
  id: '1',
  status: 'getting-packed',
  deliveryTimeMinutes: 15,
  statusMessage: 'Your order is getting packed',
  itemCount: 2,
  savings: 80.0,
  deliveryAddress: 'Delivering to home: 13, 8/22, Dr Muthu Lakshmi nagger',
  deliveryPartnerName: 'Sanjay',
};

/**
 * Static destination coordinates for development
 * 
 * In production, this should be replaced with:
 * 1. Geocoding the delivery address from the order
 * 2. Using the deliveryCoordinates from the order if available
 * 3. Fallback to a default location if geocoding fails
 */
const STATIC_DESTINATION: LocationCoordinates = {
  latitude: 12.9716, // Example: Bangalore coordinates
  longitude: 77.5946,
};

const OrderStatusMain: React.FC = () => {
  const navigation = useNavigation<OrdersStackNavigationProp>();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Location permission and coordinates state
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'not_requested' | 'requesting' | 'granted' | 'denied'>('not_requested');
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/order-status/active');
        // const data = await response.json();
        // setOrder(data.order);

        // Using dummy data for now
        setOrder(DUMMY_ORDER);
      } catch (error) {
        logger.error('Error fetching order status', error);
        // Fallback to dummy data
        setOrder(DUMMY_ORDER);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  // Request location permission
  const requestLocationPermission = async () => {
    setLocationPermissionStatus('requesting');
    setLocationError(null);
    setLocationLoading(true);

    try {
      // Request location permission using expo-location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setHasLocationPermission(true);
        setLocationPermissionStatus('granted');
        // Fetch location - errors will be handled by fetchCurrentLocation
        try {
          await fetchCurrentLocation();
        } catch (error) {
          logger.error('Error fetching location after permission grant', error);
          // Error will be handled by fetchCurrentLocation's error handler
        }
      } else {
        setHasLocationPermission(false);
        setLocationPermissionStatus('denied');
        setLocationError('Location permission denied. Please enable it in Settings.');
        setLocationLoading(false);
      }
    } catch (error: any) {
      logger.error('Error in requestLocationPermission', error);
      logger.error('Error details', { error: JSON.stringify(error, null, 2) });
      
      // Check if this is a Geolocation error (has code property)
      // If it is, fetchCurrentLocation will handle it, so don't set error here
      const isGeolocationError = error && typeof error === 'object' && ('code' in error);
      
      if (!isGeolocationError) {
        // This is a permission request error, not a location fetch error
        setHasLocationPermission(false);
        setLocationPermissionStatus('denied');
        setLocationError('Failed to request location permission. Please try again.');
        setLocationLoading(false);
      }
      // If it's a Geolocation error (code 1, 2, or 3), fetchCurrentLocation will handle it
    }
  };

  // Fetch current location using expo-location API
  const fetchCurrentLocation = async (): Promise<void> => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData: LocationCoordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(locationData);
      setHasLocationPermission(true);
      setLocationPermissionStatus('granted');
      setLocationLoading(false);
    } catch (error: any) {
      logger.error('Error getting location', error);
      
      let errorMessage = 'Failed to get current location';
      
      if (error.code === 'E_LOCATION_PERMISSION_DENIED') {
        errorMessage = 'Location permission denied. Please enable location access in Settings.';
        setLocationPermissionStatus('denied');
        setHasLocationPermission(false);
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage = 'Location information is unavailable. Please check your device settings.';
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage = 'Location request timed out. Please try again.';
      } else {
        errorMessage = `Failed to get location: ${error.message || 'Unknown error'}`;
      }

      setLocationError(errorMessage);
      setLocationLoading(false);
      throw error;
    }
  };

  const handleOrderPress = useCallback((order: OrderStatus) => {
    // Prepare order items data - using dummy data structure similar to OrderStatusDetails
    const orderItems = [
      {
        id: '1',
        name: 'Product Name 1',
        weight: '500 g',
        quantity: 2,
        discountedPrice: 150,
        originalPrice: 225, // 150 * 1.5
        image: order.productImage,
      },
      {
        id: '2',
        name: 'Product Name 2',
        weight: '500 g',
        quantity: 1,
        discountedPrice: 200,
        originalPrice: 300, // 200 * 1.5
        image: order.productImage,
      },
    ];

    // Calculate totals
    const itemTotalOriginal = orderItems.reduce(
      (sum, item) => sum + item.originalPrice * item.quantity,
      0
    );
    const itemTotal = orderItems.reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity,
      0
    );
    const totalSavings = itemTotalOriginal - itemTotal;
    const handlingCharge = 5;
    const deliveryFee = 0;
    const totalBill = itemTotal + handlingCharge + deliveryFee;

    // Navigate directly to OrderItemsDetails (skipping OrderStatusDetails)
    navigation.navigate('OrderItemsDetails', {
      orderId: order.id,
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      items: orderItems,
      totalSavings,
      itemTotal,
      handlingCharge,
      deliveryFee,
      totalBill,
    });
  }, [navigation]);


  const formatDeliveryTime = (minutes: number): string => {
    if (minutes <= 0) return 'Arrived';
    return `${minutes} mins`;
  };

  // Open device settings
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Render location permission request UI
  const renderLocationPermissionRequest = () => {
    // Don't show if permission is granted and location is available
    if (locationPermissionStatus === 'granted' && currentLocation) {
      return null;
    }

    const isPermissionDenied = locationPermissionStatus === 'denied';

    return (
      <View style={styles.locationPermissionContainer}>
        <View style={styles.locationPermissionContent}>
          <Text style={styles.locationPermissionTitle}>Location Access Required</Text>
          <Text style={styles.locationPermissionMessage}>
            We need your location to show the route to your delivery address.
          </Text>
          {locationError && (
            <Text style={styles.locationErrorText}>{locationError}</Text>
          )}
          {locationLoading ? (
            <View style={styles.locationLoadingContainer}>
              <ActivityIndicator size="small" color="#034703" />
              <Text style={styles.locationLoadingText}>Requesting location...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              {isPermissionDenied && (
                <TouchableOpacity
                  style={styles.openSettingsButton}
                  onPress={openSettings}
                  activeOpacity={0.7}
                >
                  <Text style={styles.openSettingsButtonText}>Open Settings</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.enableLocationButton}
                onPress={requestLocationPermission}
                activeOpacity={0.7}
              >
                <Text style={styles.enableLocationButtonText}>
                  {isPermissionDenied ? 'Try Again' : 'Enable Location'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render map view - only show when permission is granted and location is available
  const renderMapView = () => {
    if (!order) return null;
    
    // Show permission request UI if permission is not granted or location is not available
    if (locationPermissionStatus !== 'granted' || !currentLocation) {
      return renderLocationPermissionRequest();
    }
    
    // Once permission is granted and location is available, show the map directly
    // Pass the current location to RouteMap so it doesn't request permission again
    return (
      <View style={styles.mapContainer}>
        <ErrorBoundary
          fallback={
            <View style={styles.mapErrorContainer}>
              <Text style={styles.mapErrorText}>Unable to load map</Text>
              <Text style={styles.mapErrorSubtext}>Please check your location permissions</Text>
            </View>
          }
        >
          <RouteMap
            deliveryAddress={order.deliveryAddress}
            deliveryCoordinates={STATIC_DESTINATION}
            currentLocation={currentLocation}
            height={200}
          />
        </ErrorBoundary>
      </View>
    );
  };

  const renderOrderCard = () => {
    if (!order) return null;

    const showPhoneIcon = order.deliveryTimeMinutes > 0 && order.deliveryTimeMinutes < 3;

    return (
      <View style={styles.orderCardContainer}>
        {/* Main Status Card */}
        <View style={styles.statusCard}>
          {/* Image Container - order status icon */}
          <View style={styles.statusImageContainer}>
            <OrderStatusIcon width={137.32} height={119.27} />
          </View>
          
          {/* Status Info Container */}
          <View style={styles.statusInfoContainer}>
            <View style={styles.statusInfo}>
              <View style={styles.statusLabelContainer}>
                <Text style={styles.arrivingLabel}>Arriving in</Text>
              </View>
              <Text style={styles.deliveryTime}>
                {formatDeliveryTime(order.deliveryTimeMinutes)}
              </Text>
            </View>
            <Text style={styles.statusMessage}>{order.statusMessage}</Text>
          </View>
        </View>

        {/* Order Info Cards */}
        <View style={styles.infoCardsContainer}>
          {/* Delivery Partner Card */}
          {order.deliveryPartnerName && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardContent}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={require('../assets/images/delivery-partner-avatar-main.png')}
                    style={styles.avatar}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>{order.deliveryPartnerName}</Text>
                  <Text style={styles.infoSubtitle}>Delivery partner</Text>
                </View>
              </View>
            </View>
          )}

          {/* Order Summary Card */}
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => handleOrderPress(order)}
            activeOpacity={0.7}
          >
            <View style={styles.orderSummaryCardContent}>
              <View style={styles.productImageContainer}>
                <Image
                  source={require('../assets/images/product-image-main.png')}
                  style={styles.productImage}
                />
              </View>
              <View style={styles.orderInfoContainer}>
                <View style={styles.orderSummaryRow}>
                  <View style={styles.itemsAndSavingsContainer}>
                    <Text style={styles.itemCount}>{order.itemCount} items</Text>
                    <View style={styles.savingsContainer}>
                      <Text style={styles.savingsText}>₹{order.savings.toFixed(1)} saved</Text>
                    </View>
                    <View style={styles.chevronContainer}>
                      <ChevronRightIcon width={14} height={14} />
                    </View>
                  </View>
                </View>
                <View style={styles.deliveryAddressContainer}>
                  <Text style={styles.deliveryAddress}>{order.deliveryAddress}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Help Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardContent}>
              <View style={styles.helpIconContainer}>
                <ChatIconOrder width={28} height={28} />
              </View>
              <View style={styles.helpTextContainer}>
                <Text style={styles.helpTitle}>Need help with this order?</Text>
                <Text style={styles.helpSubtitle}>
                  Chat with us now — we're just a tap away
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Order status" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map View */}
        {renderMapView()}

        {/* Order Card */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading order...</Text>
          </View>
        ) : !order ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active order</Text>
          </View>
        ) : (
          renderOrderCard()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 0,
    overflow: 'hidden',
  },
  locationPermissionContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  locationPermissionContent: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  locationPermissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  locationPermissionMessage: {
    fontSize: 14,
    color: '#4C4C4C',
    textAlign: 'center',
    lineHeight: 20,
  },
  locationErrorText: {
    fontSize: 13,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 4,
  },
  locationLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  locationLoadingText: {
    fontSize: 14,
    color: '#828282',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  openSettingsButton: {
    backgroundColor: '#034703',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 140,
  },
  openSettingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  enableLocationButton: {
    backgroundColor: '#034703',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 140,
  },
  enableLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  orderCardContainer: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 22,
    paddingHorizontal: 16,
    paddingBottom: 0,
    gap: 10,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F4F4F4',
    padding: 20,
    paddingHorizontal: 16,
    gap: 67,
  },
  statusImageContainer: {
    width: 137.32,
    height: 119.27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfoContainer: {
    flex: 1,
    gap: 12,
  },
  statusInfo: {
    gap: 8,
    alignItems: 'flex-start',
  },
  statusLabelContainer: {
    width: 72,
    alignItems: 'center',
  },
  arrivingLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#828282',
    textAlign: 'center',
  },
  deliveryTime: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: '#175FBE',
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: '#4C4C4C',
  },
  infoCardsContainer: {
    gap: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.6,
    borderColor: '#F4F4F4',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#1A1A1A',
  },
  infoSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#828282',
  },
  orderSummaryCardContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    gap: 12,
  },
  productImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  orderInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  itemsAndSavingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#4C4C4C',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronContainer: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#034703',
  },
  deliveryAddressContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
  },
  deliveryAddress: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#828282',
    flex: 1,
  },
  helpIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTextContainer: {
    flex: 1,
    gap: 4,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#1A1A1A',
  },
  helpSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#828282',
  },
  loadingText: {
    textAlign: 'center',
    color: '#828282',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#828282',
    fontSize: 16,
  },
  mapErrorContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  mapErrorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  mapErrorSubtext: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
  },
});

export default OrderStatusMain;
