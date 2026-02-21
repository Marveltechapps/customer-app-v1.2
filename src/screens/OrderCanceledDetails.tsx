import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { OrdersStackNavigationProp } from '../types/navigation';
import Header from '../components/layout/Header';
import CancelIcon from '../assets/images/cancel-icon.svg';
import ChatIcon from '../assets/images/chat-icon.svg';
import { logger } from '@/utils/logger';

// Product image from assets
const PRODUCT_IMAGE = require('../assets/images/product-image-1.png');

// Dummy static data - Replace with API call later
interface OrderDetails {
  id: string;
  status: 'cancelled';
  orderDate: string;
  orderTime: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: string;
    originalPrice?: string;
    weight?: string;
    image?: string;
  }>;
  itemTotal: string;
  itemTotalOriginal?: string;
  handlingCharge: string;
  deliveryFee: string;
  totalAmount: string;
  savedAmount?: string;
  cancellationReason?: string;
  refundMessage?: string;
  orderId?: string;
  orderPlacedDate?: string;
}

const DUMMY_ORDER_DETAILS: OrderDetails = {
  id: '1',
  status: 'cancelled',
  orderDate: '21st Jun 2024',
  orderTime: '08:50 am',
  products: [
    { id: '1', name: 'Shimla Apple', quantity: 1, price: '₹126', originalPrice: '₹189', weight: '500 g' },
    { id: '2', name: 'Shimla Apple', quantity: 1, price: '₹126', originalPrice: '₹189', weight: '500 g' },
  ],
  itemTotal: '₹126',
  itemTotalOriginal: '₹189',
  handlingCharge: '₹05',
  deliveryFee: 'Free',
  totalAmount: '₹131',
  savedAmount: '₹63',
  cancellationReason: 'Payment not completed',
  refundMessage: 'Your Payment was not completed. Any amount if debited will get refunded within 3-5 days.',
  orderId: '#1CEDGDFLK41662',
  orderPlacedDate: '3 Dec 2024, 02.15 PM',
};

const OrderCanceledDetails: React.FC = () => {
  const navigation = useNavigation<OrdersStackNavigationProp>();
  const route = useRoute();
  const orderId = (route.params as { orderId?: string })?.orderId;
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
        setOrderDetails(DUMMY_ORDER_DETAILS);
      } catch (error) {
        logger.error('Error fetching order details', error);
        // Fallback to dummy data
        setOrderDetails(DUMMY_ORDER_DETAILS);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    } else {
      setOrderDetails(DUMMY_ORDER_DETAILS);
    }
  }, [orderId]);

  const handleOrderAgain = () => {
    // TODO: Navigate to order again flow
    logger.info('Order again pressed');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header title="Order Details" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderDetails) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header title="Order Details" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Order Details" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusContainer}>
          <View style={styles.statusHeaderRow}>
            <View style={styles.statusIconContainer}>
              <CancelIcon width={16} height={16} />
            </View>
            <Text style={styles.statusText}>Cancelled</Text>
          </View>
          <Text style={styles.statusMessage}>
            {orderDetails.refundMessage || 'Your Payment was not completed. Any amount if debited will get refunded within 3-5 days.'}
          </Text>
        </View>

        <Text style={styles.actionText}>Please try placing the order again !</Text>

        <View style={styles.orderSummaryContainer}>
          <Text style={styles.orderSummaryTitle}>
            {orderDetails.products.length} Items in Order
          </Text>
          {orderDetails.products.map((product) => (
            <View key={product.id} style={styles.productItem}>
              <View style={styles.productImageWrapper}>
                <Image
                  source={PRODUCT_IMAGE}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                {product.weight && (
                  <Text style={styles.productWeight}>{product.weight}</Text>
                )}
                <View style={styles.productPriceRow}>
                  <Text style={styles.productPrice}>{product.price}</Text>
                  {product.originalPrice && (
                    <Text style={styles.productOriginalPrice}>{product.originalPrice}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.billSummaryContainer}>
          <View style={styles.billSummaryHeader}>
            <Text style={styles.billSummaryTitle}>Bill Summary</Text>
            {orderDetails.savedAmount && (
              <View style={styles.savedBadge}>
                <Text style={styles.savedText}>Saved{orderDetails.savedAmount}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.billSummaryRow}>
            <View style={styles.billSummaryLabelRow}>
              <Text style={styles.billSummaryLabel}>Item Total & GST</Text>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>i</Text>
              </View>
            </View>
            <View style={styles.billSummaryValueRow}>
              {orderDetails.itemTotalOriginal && (
                <Text style={styles.billSummaryOriginalValue}>{orderDetails.itemTotalOriginal}</Text>
              )}
              <Text style={styles.billSummaryValue}>{orderDetails.itemTotal}</Text>
            </View>
          </View>

          <View style={styles.billSummaryRow}>
            <Text style={styles.billSummaryLabel}>Handling charge</Text>
            <Text style={styles.billSummaryValue}>{orderDetails.handlingCharge}</Text>
          </View>

          <View style={styles.billSummaryRow}>
            <Text style={styles.billSummaryLabel}>Delivery Fee</Text>
            <Text style={styles.billSummaryValue}>{orderDetails.deliveryFee}</Text>
          </View>

          <View style={styles.totalBillRow}>
            <Text style={styles.totalBillLabel}>Total bill</Text>
            <Text style={styles.totalBillValue}>{orderDetails.totalAmount}</Text>
          </View>
        </View>

        <View style={styles.orderDetailsCard}>
          <Text style={styles.orderDetailsTitle}>Order Details</Text>
          <View style={styles.orderDetailsRow}>
            <Text style={styles.orderDetailsLabel}>Order ID</Text>
            <Text style={styles.orderDetailsValue}>{orderDetails.orderId || 'N/A'}</Text>
          </View>
          <View style={styles.orderDetailsRow}>
            <Text style={styles.orderDetailsLabel}>Delivery Address</Text>
            <Text style={styles.orderDetailsValue}>3th, floor, Vasatha bhavan, Adyar, Chennai. 600 021</Text>
          </View>
          <View style={styles.orderDetailsRow}>
            <Text style={styles.orderDetailsLabel}>Order Placed</Text>
            <Text style={styles.orderDetailsValue}>{orderDetails.orderPlacedDate || orderDetails.orderDate || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.helpCard}>
          <View style={styles.helpCardContent}>
            <View style={styles.helpIconContainer}>
              <ChatIcon width={40} height={40} />
            </View>
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpTitle}>Need help with this order?</Text>
              <Text style={styles.helpMessage}>Chat with us now — we're just a tap away</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedActionsContainer}>
        <TouchableOpacity
          style={styles.orderAgainButton}
          onPress={handleOrderAgain}
          activeOpacity={0.7}
        >
          <Text style={styles.orderAgainButtonText}>Order Again</Text>
        </TouchableOpacity>
      </View>
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
  orderDetailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
  },
  orderDetailsTitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  orderDetailsRow: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  orderDetailsLabel: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#4C4C4C',
  },
  orderDetailsValue: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: '#4E4E4E',
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 0.6,
    borderColor: '#F4F4F4',
  },
  helpCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helpIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#1A1A1A',
  },
  helpMessage: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#828282',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#828282',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#828282',
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIconContainer: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22.4,
    color: '#1A1A1A',
  },
  statusMessage: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#828282',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22.4,
    color: '#FA7500',
    marginHorizontal: 16,
    marginTop: 12,
  },
  orderSummaryContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
  },
  orderSummaryTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#1A1A1A',
  },
  productItem: {
    flexDirection: 'row',
    marginTop: 12,
  },
  productImageWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 60,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productWeight: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#828282',
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#1A1A1A',
  },
  productOriginalPrice: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#828282',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  billSummaryContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
  },
  billSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F4',
    marginBottom: 12,
  },
  billSummaryTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#1A1A1A',
  },
  savedBadge: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  savedText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#00A85A',
  },
  billSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billSummaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billSummaryLabel: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#828282',
  },
  infoIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  infoIconText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  billSummaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billSummaryOriginalValue: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#828282',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  billSummaryValue: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#1A1A1A',
  },
  totalBillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F4',
  },
  totalBillLabel: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#1A1A1A',
  },
  totalBillValue: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22.4,
    color: '#1A1A1A',
  },
  fixedActionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  orderAgainButton: {
    backgroundColor: '#034703',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderAgainButtonText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#FFFFFF',
  },
});

export default OrderCanceledDetails;

