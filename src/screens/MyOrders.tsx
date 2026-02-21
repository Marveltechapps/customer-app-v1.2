import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { OrdersStackNavigationProp } from '../types/navigation';
import Header from '../components/layout/Header';
import { logger } from '@/utils/logger';
import CheckmarkIcon from '../assets/images/checkmark-icon.svg';
import CancelIcon from '../assets/images/cancel-icon.svg';
import ChevronRightIcon from '../assets/images/chevron-right.svg';

// Dummy static data - Replace with API call later
export interface Order {
  id: string;
  status: 'delivered' | 'cancelled';
  orderDate: string;
  price: string;
  productImages: string[];
  hasRating?: boolean;
  rating?: number;
  refundStatus?: 'completed' | null;
}

// Product images from assets
const PRODUCT_IMAGE_1 = require('../assets/images/product-image-1.png');
const PRODUCT_IMAGE_2 = require('../assets/images/product-image-1.png'); // Using same image for now

const DUMMY_ORDERS: Order[] = [
  {
    id: '1',
    status: 'delivered',
    orderDate: '21st Jun 2024, 08:50 am',
    price: '₹126',
    productImages: ['product-image-1.png', 'product-image-1.png'],
    hasRating: false,
  },
  {
    id: '2',
    status: 'cancelled',
    orderDate: '21st Jun 2024, 08:50 am',
    price: '₹126',
    productImages: ['product-image-1.png', 'product-image-1.png'],
  },
  {
    id: '3',
    status: 'delivered',
    orderDate: '20th Jun 2024, 10:30 am',
    price: '₹250',
    productImages: ['product-image-1.png', 'product-image-1.png'],
    hasRating: true,
    rating: 4,
    refundStatus: 'completed',
  },
];

type FilterType = 'all' | 'delivered' | 'cancelled';

const MyOrders: React.FC = () => {
  const navigation = useNavigation<OrdersStackNavigationProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/orders');
        // const data = await response.json();
        // setOrders(data.orders);

        // Using dummy data for now
        setOrders(DUMMY_ORDERS);
      } catch (error) {
        logger.error('Error fetching orders', error);
        // Fallback to dummy data
        setOrders(DUMMY_ORDERS);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderPress = useCallback((order: Order) => {
    try {
      if (order.status === 'cancelled') {
        navigation.navigate('OrderCanceledDetails', { orderId: order.id });
      } else if (order.status === 'delivered') {
        navigation.navigate('OrderSuccessfulDetails', { orderId: order.id });
      }
    } catch (error) {
      logger.error('Navigation error', error);
    }
  }, [navigation]);

  const handleRateOrder = useCallback((order: Order) => {
    navigation.navigate('RateOrder', { orderId: order.id });
  }, [navigation]);

  const handleOrderAgain = useCallback((order: Order) => {
    // TODO: Navigate to order again flow or refresh orders
    logger.info('Order again', { orderId: order.id });
  }, []);

  const filteredOrders = useMemo(() => {
    return filter === 'all' 
      ? orders 
      : orders.filter(order => order.status === filter);
  }, [orders, filter]);

  const handleFilterAll = useCallback(() => setFilter('all'), []);
  const handleFilterDelivered = useCallback(() => setFilter('delivered'), []);
  const handleFilterCancelled = useCallback(() => setFilter('cancelled'), []);
  const keyExtractor = useCallback((item: Order) => item.id, []);

  const renderOrderCard = useCallback(({ item }: { item: Order }) => (
    <View style={styles.orderCardContainer}>
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={styles.orderCard}
          onPress={() => handleOrderPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.orderContent}>
            <View style={styles.topSectionContainer}>
              <View style={styles.productImagesContainer}>
                {item.productImages.map((image, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.productImageWrapper,
                      index > 0 && { marginLeft: 8 }
                    ]}
                  >
                    <Image
                      source={PRODUCT_IMAGE_1}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </View>
              <View style={styles.deliveryInfoContainer}>
              <View style={styles.orderInfoTop}>
                <View style={styles.orderTitleRow}>
                  <Text style={styles.orderTitle}>
                    {item.status === 'delivered' ? 'Order Delivered' : 'Order Cancelled'}
                  </Text>
                  <View style={styles.statusIcon}>
                    {item.status === 'delivered' ? (
                      <CheckmarkIcon width={16} height={16} />
                    ) : (
                      <CancelIcon width={16} height={16} />
                    )}
                  </View>
                </View>
                <Text style={styles.orderDate}>Placed at {item.orderDate}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{item.price}</Text>
                <View style={styles.chevronContainer}>
                  <ChevronRightIcon width={16} height={16} />
                </View>
              </View>
            </View>
            </View>
            {item.refundStatus === 'completed' && (
              <View style={styles.refundBadge}>
                <Text style={styles.refundText}>Refund completed</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.orderAction}>
          {item.status === 'delivered' && item.hasRating && item.rating ? (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratedText}>You rated  : </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <View key={star} style={styles.starContainer}>
                    <Text style={styles.star}>
                      {star <= item.rating! ? '★' : '☆'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : item.status === 'delivered' && !item.hasRating ? (
            <TouchableOpacity
              onPress={() => handleRateOrder(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.rateOrderText}>Rate Order</Text>
            </TouchableOpacity>
          ) : item.status === 'cancelled' ? (
            <TouchableOpacity
              onPress={() => handleOrderAgain(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.orderAgainText}>Order Again</Text>
            </TouchableOpacity>
          ) : item.refundStatus === 'completed' && !item.hasRating ? (
            <TouchableOpacity
              onPress={() => handleOrderAgain(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.orderAgainText}>Order Again</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  ), [handleOrderPress, handleRateOrder, handleOrderAgain]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="My Orders" />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={handleFilterAll}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'delivered' && styles.filterButtonActive]}
          onPress={handleFilterDelivered}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'delivered' && styles.filterTextActive]}>
            Delivered
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'cancelled' && styles.filterButtonActive]}
          onPress={handleFilterCancelled}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'cancelled' && styles.filterTextActive]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 21,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#034703',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#6B6B6B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderCardContainer: {
    width: '100%',
    marginBottom: 16,
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.6,
    borderColor: '#F4F4F4',
    overflow: 'hidden',
    width: '100%',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  orderContent: {
    flexDirection: 'column',
  },
  topSectionContainer: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  productImagesContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  productImageWrapper: {
    width: 40,
    height: 40,
    backgroundColor: '#E0F2F1',
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 40,
    height: 40,
  },
  deliveryInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  orderInfoTop: {
    flex: 1,
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#1A1A1A',
  },
  statusIcon: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#828282',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    justifyContent: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#1A1A1A',
  },
  chevronContainer: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refundBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D7F1D7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 12,
  },
  refundText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    color: '#2C512C',
  },
  orderAction: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D1D1D1',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  rateOrderText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    color: '#FA7500',
  },
  orderAgainText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    color: '#FA7500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratedText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    color: '#1A1A1A',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  starContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    fontSize: 16,
    color: '#FA7500',
    lineHeight: 18,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#828282',
  },
});

export default MyOrders;

