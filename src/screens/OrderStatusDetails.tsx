/**
 * Order Status Details Screen
 * 
 * This screen shows detailed information about an order's status.
 * Displays different views based on order status:
 * - Getting Packed
 * - On the Way
 * - Arrived
 * 
 * Features:
 * - Status-specific UI based on order state
 * - Delivery partner information
 * - Order summary
 * - Help and support options
 * - Ready for API integration
 * 
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { logger } from '@/utils/logger';
import type {
  OrdersStackNavigationProp,
  OrdersStackRouteProp,
  RootStackNavigationProp,
} from '../types/navigation';
import Header from '../components/layout/Header';
import RouteMap from '../components/features/location/RouteMap';
import PhoneIcon from '../assets/images/phone-icon.svg';
import RupeeIcon from '../assets/images/rupee-icon.svg';
import ChevronRightIcon from '../assets/images/chevron-right.svg';
import ChatIconOrder from '../assets/images/chat-icon-order.svg';

type OrderStatusType = 'getting-packed' | 'on-the-way' | 'arrived';

interface OrderDetails {
  id: string;
  status: OrderStatusType;
  deliveryTimeMinutes: number;
  statusMessage: string;
  itemCount: number;
  savings: number;
  deliveryAddress: string;
  deliveryPartnerName?: string;
  productImage?: string;
  orderItems?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
}

// Dummy static data - Replace with API call later
const getDummyOrderDetails = (
  orderId: string,
  status: OrderStatusType
): OrderDetails => {
  const baseOrder: OrderDetails = {
    id: orderId,
    status,
    deliveryTimeMinutes: status === 'arrived' ? 0 : status === 'on-the-way' ? 8 : 15,
    statusMessage:
      status === 'arrived'
        ? 'Your order has arrived'
        : status === 'on-the-way'
        ? 'Your order is on the way'
        : 'Your order is getting packed',
    itemCount: 2,
    savings: 88.0,
    deliveryAddress: 'Delivering to home: 13, 8/22, Dr Muthu Lakshmi nagger',
    deliveryPartnerName: status !== 'arrived' ? 'Sanjay' : undefined,
    orderItems: [
      {
        id: '1',
        name: 'Product Name 1',
        quantity: 2,
        price: 150,
      },
      {
        id: '2',
        name: 'Product Name 2',
        quantity: 1,
        price: 200,
      },
    ],
  };

  return baseOrder;
};

const OrderStatusDetails: React.FC = () => {
  const route = useRoute<OrdersStackRouteProp<'OrderStatusDetails'>>();
  const navigation = useNavigation<OrdersStackNavigationProp>();
  const rootNavigation = useNavigation<RootStackNavigationProp>();
  const { orderId, status } = route.params;

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/orders/${orderId}`);
        // const data = await response.json();
        // setOrderDetails(data.order);

        // Using dummy data for now
        const dummyData = getDummyOrderDetails(orderId || '1', status);
        setOrderDetails(dummyData);
      } catch (error) {
        logger.error('Error fetching order details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, status]);

  const formatDeliveryTime = (minutes: number): string => {
    if (minutes <= 0) return 'Arrived';
    return `${minutes} mins`;
  };

  const handleSavingsPress = () => {
    logger.info('handleSavingsPress called');
    
    if (!orderDetails) {
      logger.info('orderDetails is null');
      return;
    }
    
    if (!navigation) {
      logger.info('navigation is null');
      Alert.alert('Error', 'Navigation not available');
      return;
    }
    
    // Calculate totals
    const itemTotalOriginal = orderDetails.orderItems?.reduce(
      (sum, item) => sum + item.price * 1.5 * item.quantity,
      0
    ) || 0;
    const itemTotal = orderDetails.orderItems?.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ) || 0;
    const totalSavings = itemTotalOriginal - itemTotal;
    const handlingCharge = 5;
    const deliveryFee = 0;
    const totalBill = itemTotal + handlingCharge + deliveryFee;
    
    const navigationParams = {
      orderId: orderDetails.id,
      status: orderDetails.status,
      deliveryAddress: orderDetails.deliveryAddress,
      items: orderDetails.orderItems?.map((item) => ({
        id: item.id,
        name: item.name,
        weight: '500 g',
        quantity: item.quantity,
        discountedPrice: item.price,
        originalPrice: item.price * 1.5,
        image: item.image,
      })) || [],
      totalSavings,
      itemTotal,
      handlingCharge,
      deliveryFee,
      totalBill,
    };
    
    // Navigate directly to OrderItemsDetails screen, skipping any intermediate screens
    try {
      // Try push first - this will add OrderItemsDetails to the stack
      if ('push' in navigation && typeof (navigation as any).push === 'function') {
        (navigation as any).push('OrderItemsDetails', navigationParams);
      } else {
        // Fallback to navigate
        navigation.navigate('OrderItemsDetails', navigationParams);
      }
    } catch (error) {
      logger.error('Navigation error', error);
      // If navigation fails, try using dispatch
      try {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'OrderItemsDetails',
            params: navigationParams,
          })
        );
      } catch (dispatchError) {
        logger.error('Navigation dispatch error', dispatchError);
        Alert.alert('Error', 'Failed to navigate to order items details');
      }
    }
  };

  const renderStatusCard = () => {
    if (!orderDetails) return null;

    return (
      <View style={styles.statusCard}>
        <View style={styles.statusImageContainer}>
          <Image
            source={require('../assets/images/product-image-order-35125f.png')}
            style={styles.statusImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.statusInfoContainer}>
          <View style={styles.statusTimeContainer}>
            <View style={styles.statusLabelContainer}>
              <Text style={styles.arrivingLabel}>Arriving in</Text>
            </View>
            <Text style={styles.deliveryTime}>
              {formatDeliveryTime(orderDetails.deliveryTimeMinutes)}
            </Text>
          </View>
          <View style={styles.statusMessageContainer}>
            <Text style={styles.statusMessage}>{orderDetails.statusMessage}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDeliveryPartner = () => {
    if (!orderDetails?.deliveryPartnerName) return null;

    return (
      <View style={styles.infoCard}>
        <View style={styles.deliveryPartnerContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../assets/images/delivery-partner-avatar-35125f.png')}
              style={styles.avatar}
            />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              {orderDetails.deliveryPartnerName}
            </Text>
            <Text style={styles.infoSubtitle}>Delivery partner</Text>
          </View>
        </View>
      </View>
    );
  };

  const handleOrderSummaryPress = () => {
    if (!orderDetails) {
      return;
    }
    handleSavingsPress();
  };

  const renderOrderSummary = () => {
    if (!orderDetails) return null;

    return (
      <TouchableOpacity
        style={styles.infoCard}
        onPress={handleOrderSummaryPress}
        activeOpacity={0.7}
        delayPressIn={0}
        delayPressOut={0}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.orderSummaryCardContent}>
          <View style={styles.orderSummaryImageContainer}>
            <Image
              source={require('../assets/images/product-image-order-35125f.png')}
              style={styles.orderSummaryImage}
            />
          </View>
          <View style={styles.orderSummaryInfoContainer}>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.itemCount}>{orderDetails.itemCount} items</Text>
              <View style={styles.savingsContainer}>
                <RupeeIcon width={9} height={12} />
                <Text style={styles.savingsText}>
                  {orderDetails.savings.toFixed(1)} saved
                </Text>
              </View>
              <View style={styles.chevronContainer}>
                <ChevronRightIcon width={14} height={14} />
              </View>
            </View>
            <Text style={styles.deliveryAddress}>
              {orderDetails.deliveryAddress}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderItems = () => {
    if (!orderDetails?.orderItems) return null;

    return (
      <View style={styles.orderItemsContainer}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {orderDetails.orderItems.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.orderItemImageContainer}>
              <Image
                source={require('../assets/images/product-image-order-35125f.png')}
                style={styles.orderItemImage}
              />
            </View>
            <View style={styles.orderItemInfo}>
              <Text style={styles.orderItemName}>{item.name}</Text>
              <Text style={styles.orderItemQuantity}>
                Quantity: {item.quantity}
              </Text>
            </View>
            <Text style={styles.orderItemPrice}>₹{item.price}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderHelpCard = () => {
    return (
      <View style={styles.infoCard}>
        <View style={styles.helpContent}>
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
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Order Details" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderDetails) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Order Details" />
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Order Details" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
      >
        {/* Route Map - Full width on top */}
        {orderDetails && (
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
                deliveryAddress={orderDetails.deliveryAddress}
                height={200}
              />
            </ErrorBoundary>
          </View>
        )}

        {/* Cards Container with proper padding */}
        <View style={styles.cardsContainer}>
          {/* Inner Container with 12px gap */}
          <View style={styles.innerContainer}>
            {/* Status Card */}
            {renderStatusCard()}

            {/* Info Cards Container with 8px gap */}
            <View style={styles.infoCardsContainer}>
              {/* Delivery Partner */}
              {renderDeliveryPartner()}

              {/* Order Summary */}
              {renderOrderSummary()}

              {/* Help Card */}
              {renderHelpCard()}
            </View>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mapContainer: {
    width: '100%',
    borderRadius: 0,
    overflow: 'hidden',
  },
  cardsContainer: {
    paddingTop: 22,
    paddingHorizontal: 16,
    paddingBottom: 22,
    backgroundColor: '#F5F5F5',
  },
  innerContainer: {
    gap: 12, // Exact gap from Figma layout_VC7GFE
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#828282',
  },
  emptyText: {
    fontSize: 16,
    color: '#828282',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F4F4F4',
    padding: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 67, // Exact gap from Figma
  },
  statusImageContainer: {
    width: 137.32,
    height: 119.27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusImage: {
    width: '100%',
    height: '100%',
  },
  statusInfoContainer: {
    flex: 1,
    gap: 12,
  },
  statusTimeContainer: {
    gap: 8,
    alignItems: 'flex-start',
  },
  statusLabelContainer: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#828282',
    textAlign: 'center',
    lineHeight: 20,
  },
  deliveryTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#175FBE',
    textAlign: 'center',
    lineHeight: 32,
  },
  statusMessageContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4C4C4C',
    lineHeight: 20,
  },
  infoCardsContainer: {
    gap: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 0.6,
    borderColor: '#F4F4F4',
  },
  deliveryPartnerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Exact gap from Figma layout_003BQA
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
    color: '#1A1A1A',
  },
  infoSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#828282',
  },
  orderSummaryCardContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12, // Exact gap from Figma layout_BIRHPZ
  },
  orderSummaryImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
    overflow: 'hidden',
  },
  orderSummaryImage: {
    width: '100%',
    height: '100%',
  },
  orderSummaryInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4, // Exact gap from Figma layout_91AERD
  },
  orderSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the left
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4C4C4C',
    lineHeight: 20,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0, // Icon and "saved" text together with NO gap between them - they should be touching
    marginLeft: 8, // 8px gap between "2 items" and the savings container (icon + saved text)
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#034703',
    lineHeight: 20,
    marginLeft: 0, // No gap between icon and text - they should be touching
  },
  chevronContainer: {
    marginLeft: 'auto', // Push chevron to the right side
  },
  deliveryAddress: {
    fontSize: 12,
    fontWeight: '400',
    color: '#828282',
    lineHeight: 16,
    marginTop: 4,
  },
  orderItemsContainer: {
    marginTop: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  orderItemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#DDDDDD',
    overflow: 'hidden',
  },
  orderItemImage: {
    width: '100%',
    height: '100%',
  },
  orderItemInfo: {
    flex: 1,
    gap: 4,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  orderItemQuantity: {
    fontSize: 12,
    fontWeight: '400',
    color: '#828282',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    color: '#1A1A1A',
  },
  helpSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#828282',
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

export default OrderStatusDetails;
