import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RefundsStackNavigationProp } from '../types/navigation';
import Header from '../components/layout/Header';
import { logger } from '@/utils/logger';

// Dummy static data - Replace with API call later
interface Product {
  id: string;
  name: string;
  weight: string;
  discountedPrice: string;
  originalPrice: string;
  imageUrl?: string;
}

interface RefundDetails {
  orderNumber: string;
  dateTime: string;
  totalItems: string;
  refundAmountRequested: string;
  refundAmountApproved: string;
  status: 'completed' | 'rejected';
  products: Product[];
}

const DUMMY_REFUND_DETAILS: Record<string, RefundDetails> = {
  'Order #123654789': {
    orderNumber: 'Order #123654789',
    dateTime: '09 June 2025, 10:47 PM',
    totalItems: '1 item',
    refundAmountRequested: '₹05',
    refundAmountApproved: '₹05',
    status: 'completed',
    products: [
      {
        id: '1',
        name: 'Shimla Apple',
        weight: '500 g',
        discountedPrice: '₹126',
        originalPrice: '₹189',
      },
      {
        id: '2',
        name: 'Shimla Apple',
        weight: '500 g',
        discountedPrice: '₹126',
        originalPrice: '₹189',
      },
    ],
  },
};

const RefundDetails: React.FC = () => {
  const navigation = useNavigation<RefundsStackNavigationProp>();
  const route = useRoute();
  const orderNumber = (route.params as { orderNumber: string })?.orderNumber || '';
  // State for API integration (ready for future use)
  const [refundDetails, setRefundDetails] = useState<RefundDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    const fetchRefundDetails = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/refunds/${orderNumber}`);
        // const data = await response.json();
        // setRefundDetails(data);

        // Using dummy data for now
        const data = DUMMY_REFUND_DETAILS[orderNumber] || null;
        setRefundDetails(data);
      } catch (error) {
        logger.error('Error fetching refund details', error);
        setRefundDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRefundDetails();
  }, [orderNumber]);


  const getStatusButtonStyle = () => {
    if (!refundDetails) return { backgroundColor: '#034703', text: 'Completed' };
    
    switch (refundDetails.status) {
      case 'completed':
        return { backgroundColor: '#034703', text: 'Completed' };
      case 'rejected':
        return { backgroundColor: '#ED0004', text: 'Rejected' };
      default:
        return { backgroundColor: '#034703', text: 'Completed' };
    }
  };

  const statusButton = getStatusButtonStyle();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header title={orderNumber} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!refundDetails) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header title={orderNumber} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Refund details not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title={orderNumber} onBackPress={handleBackPress} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {refundDetails.products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productImageContainer}>
                  <View style={styles.productImagePlaceholder}>
                    {/* Placeholder for product image - replace with actual Image component when imageUrl is available */}
                    <Text style={styles.productImageText}>Image</Text>
                  </View>
                </View>
                <View style={styles.productInfo}>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productWeight}>{product.weight}</Text>
                  </View>
                  <View style={styles.productPriceContainer}>
                    <Text style={styles.discountedPrice}>{product.discountedPrice}</Text>
                    <Text style={styles.originalPrice}>{product.originalPrice}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelContainer}>
                    <Text style={styles.detailLabel}>Date & Time</Text>
                  </View>
                  <Text style={styles.detailValue}>{refundDetails.dateTime}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelContainer}>
                    <Text style={styles.detailLabel}>Total item</Text>
                  </View>
                  <Text style={styles.detailValue}>{refundDetails.totalItems}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabelFull}>Refund amount requested</Text>
                  <Text style={styles.detailValueAmount}>{refundDetails.refundAmountRequested}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabelFull}>Refund Approved</Text>
                  <Text style={styles.detailValueAmount}>{refundDetails.refundAmountApproved}</Text>
                </View>
              </View>
              <View style={[styles.statusButton, { backgroundColor: statusButton.backgroundColor }]}>
                <Text style={styles.statusButtonText}>{statusButton.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#ED0004',
    textAlign: 'center',
  },
  contentContainer: {
    gap: 12,
    width: '100%',
    alignItems: 'center',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    paddingBottom: 16,
    gap: 12,
    width: '100%',
    alignSelf: 'stretch',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  productImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E0F2F1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
  },
  productImageText: {
    fontSize: 10,
    color: '#6B6B6B',
  },
  productInfo: {
    flex: 1,
    gap: 8,
  },
  productDetails: {
    gap: 4,
  },
  productName: {
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18, // 1.5em
    color: '#1A1A1A',
    textAlign: 'left',
  },
  productWeight: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16, // 1.3333333333333333em
    color: '#6B6B6B',
    textAlign: 'left',
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountedPrice: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20, // 1.4285714285714286em
    color: '#1A1A1A',
    textAlign: 'left',
  },
  originalPrice: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16, // 1.3333333333333333em
    color: '#6B6B6B',
    textAlign: 'left',
    textDecorationLine: 'line-through',
  },
  detailsSection: {
    gap: 4,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#D1D1D1',
    alignSelf: 'stretch',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  detailLabelContainer: {
    width: 107.34,
    height: 16,
  },
  detailLabel: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18, // 1.5em
    color: '#6B6B6B',
    textAlign: 'left',
  },
  detailValue: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18, // 1.5em
    color: '#1A1A1A',
    textAlign: 'right',
    flex: 1,
  },
  detailLabelFull: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 19.2, // 1.6000000635782878em
    color: '#6B6B6B',
    textAlign: 'left',
    flex: 1,
  },
  detailValueAmount: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16, // 1.3333333333333333em
    color: '#1A1A1A',
    textAlign: 'right',
    width: 22,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  statusButtonText: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20, // 1.4285714285714286em
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default RefundDetails;

