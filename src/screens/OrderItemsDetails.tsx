/**
 * Order Items Details Screen
 * 
 * Shows detailed information about an order including:
 * - Order status
 * - List of items with images, names, weights, and prices
 * - Bill summary with savings, charges, and total
 * - Order details (Order ID, Delivery Address, etc.)
 * 
 * @format
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type {
  OrdersStackNavigationProp,
  OrdersStackRouteProp,
} from '../types/navigation';
import Header from '../components/layout/Header';
import ChatIconOrder from '../assets/images/chat-icon-order.svg';
import { logger } from '@/utils/logger';
import StatusIconGettingPacked from '../assets/images/status-icon-getting-packed.svg';

interface OrderItem {
  id: string;
  name: string;
  weight: string;
  quantity: number;
  discountedPrice: number;
  originalPrice: number;
  image?: string;
}

interface OrderItemsDetailsParams {
  orderId?: string;
  items?: OrderItem[];
  status?: 'getting-packed' | 'on-the-way' | 'arrived';
  deliveryAddress?: string;
  totalSavings?: number;
  itemTotal?: number;
  handlingCharge?: number;
  deliveryFee?: number;
  totalBill?: number;
}

const OrderItemsDetails: React.FC = () => {
  const route = useRoute<OrdersStackRouteProp<'OrderItemsDetails'>>();
  const navigation = useNavigation<OrdersStackNavigationProp>();
  const params = route.params || {};
  const {
    orderId,
    items,
    status = 'getting-packed',
    deliveryAddress = 'Delivering to home: 13, 8/22, Dr Muthu Lakshmi nagger',
    totalSavings = 63,
    itemTotal = 126,
    handlingCharge = 5,
    deliveryFee = 0,
    totalBill = 131,
  } = params;

  // Default items if not provided
  const orderItems: OrderItem[] = items || [
    {
      id: '1',
      name: 'Shimla Apple',
      weight: '500 g',
      quantity: 2,
      discountedPrice: 126,
      originalPrice: 189,
    },
    {
      id: '2',
      name: 'Shimla Apple',
      weight: '500 g',
      quantity: 1,
      discountedPrice: 126,
      originalPrice: 189,
    },
  ];

  const getStatusText = () => {
    switch (status) {
      case 'getting-packed':
        return 'Getting packed';
      case 'on-the-way':
        return 'On the way';
      case 'arrived':
        return 'Arrived';
      default:
        return 'Getting packed';
    }
  };

  const handleDownloadInvoice = () => {
    // TODO: Implement invoice download functionality
    logger.info('Download invoice pressed');
  };

  const renderStatusCard = () => {
    return (
      <View style={styles.statusCard}>
        <View style={styles.statusImageContainer}>
          <StatusIconGettingPacked width={40} height={40} />
        </View>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
    );
  };

  const renderOrderItem = (item: OrderItem) => {
    return (
      <View key={item.id} style={styles.orderItemCard}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/product-image-item-1.png')}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.itemDetailsContainer}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productWeight}>{item.weight}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.discountedPrice}>₹{item.discountedPrice}</Text>
            <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBillSummary = () => {
    const itemTotalOriginal = orderItems.reduce(
      (sum, item) => sum + item.originalPrice * item.quantity,
      0
    );

    return (
      <View style={styles.billSummaryCard}>
        {/* Header with border bottom */}
        <View style={styles.billSummaryHeader}>
          <Text style={styles.billSummaryTitle}>Bill Summary</Text>
          <View style={styles.savedBadge}>
            <Text style={styles.savedText}>Saved₹{totalSavings}</Text>
          </View>
        </View>

        {/* Bill Items Container with border bottom */}
        <View style={styles.billItemsContainer}>
          <View style={styles.billItem}>
            <View style={styles.billItemLabelContainer}>
              <Text style={styles.billItemLabel}>Item Total & GST</Text>
              <View style={styles.infoBadge}>
                <Text style={styles.infoText}>i</Text>
              </View>
            </View>
            <View style={styles.billItemValueContainer}>
              <Text style={styles.billItemOriginalPrice}>₹{itemTotalOriginal}</Text>
              <Text style={styles.billItemPrice}>₹{itemTotal}</Text>
            </View>
          </View>

          <View style={styles.billItem}>
            <Text style={styles.billItemLabelSecondary}>Handling charge</Text>
            <Text style={styles.billItemPriceSecondary}>₹{handlingCharge.toString().padStart(2, '0')}</Text>
          </View>

          <View style={styles.billItem}>
            <Text style={styles.billItemLabelSecondary}>Delivery Fee</Text>
            <Text style={styles.billItemPriceSecondary}>
              {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
            </Text>
          </View>
        </View>

        {/* Total Bill Container */}
        <View style={styles.totalBillContainer}>
          <Text style={styles.totalBillLabel}>Total bill</Text>
          <Text style={styles.totalBillPrice} numberOfLines={1} ellipsizeMode="clip">
            ₹{totalBill}
          </Text>
        </View>

        {/* Invoice Button Container with border top */}
        <View style={styles.invoiceContainer}>
          <TouchableOpacity
            style={styles.invoiceButton}
            onPress={handleDownloadInvoice}
            activeOpacity={0.7}
          >
            <Text style={styles.invoiceButtonText}>Download Invoice </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOrderDetails = () => {
    // Format date - default to current date if not provided
    const orderPlacedDate = '3 Dec 2024, 02.15 PM'; // Should come from API

    return (
      <View style={styles.orderDetailsCard}>
        <Text style={styles.orderDetailsTitle}>Order Details</Text>
        <View style={styles.orderDetailsContainer}>
          <View style={styles.orderDetailItem}>
            <View style={styles.orderDetailLabelContainer}>
              <Text style={styles.orderDetailLabel}>Order ID</Text>
            </View>
            <View style={styles.orderDetailValueContainer}>
              <Text style={styles.orderDetailValue}>
                {orderId ? `#${orderId}` : '#1CEDGDFLK41662'}
              </Text>
            </View>
          </View>
          <View style={styles.orderDetailItem}>
            <View style={styles.orderDetailLabelContainer}>
              <Text style={styles.orderDetailLabel}>Delivery Address</Text>
            </View>
            <View style={styles.orderDetailValueContainer}>
              <Text style={styles.orderDetailValue}>{deliveryAddress}</Text>
            </View>
          </View>
          <View style={styles.orderDetailItem}>
            <View style={styles.orderDetailLabelContainer}>
              <Text style={styles.orderDetailLabel}>Order Placed</Text>
            </View>
            <View style={styles.orderDetailValueContainer}>
              <Text style={styles.orderDetailValue}>{orderPlacedDate}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderHelpCard = () => {
    return (
      <View style={styles.helpCard}>
        <View style={styles.helpContent}>
          <View style={styles.helpIconContainer}>
            <ChatIconOrder width={40} height={40} style={{ width: 40, height: 40 }} />
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Order Details" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Status Card */}
          {renderStatusCard()}

          {/* Items Section */}
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>
              {orderItems.length} Items in Order
            </Text>
            <View style={styles.itemsList}>
              {orderItems.map((item) => renderOrderItem(item))}
            </View>
          </View>

          {/* Bill Summary */}
          {renderBillSummary()}

          {/* Order Details */}
          {renderOrderDetails()}

          {/* Help Card */}
          {renderHelpCard()}
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
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12, // Exact gap from Figma layout_6V21DH
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Exact gap from Figma layout_JGG3VS
  },
  statusImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#FFE9DA', // Exact color from Figma fill_YALJ0S
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  statusText: {
    fontSize: 18, // Exact from Figma style_38789W
    fontWeight: '500',
    color: '#1A1A1A',
    lineHeight: 26, // 1.4444444444444444em
  },
  itemsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 16,
    gap: 12, // Exact gap from Figma layout_842RFA
  },
  sectionTitle: {
    fontSize: 14, // Exact from Figma style_FTHETL
    fontWeight: '400',
    color: '#1A1A1A', // Exact from Figma fill_C8SL8Z
    lineHeight: 20, // 1.4285714285714286em
  },
  itemsList: {
    gap: 8, // Exact gap from Figma layout_DEU20Q
  },
  orderItemCard: {
    flexDirection: 'row',
    gap: 8, // Exact gap from Figma layout_DEU20Q
    alignItems: 'center',
  },
  imageContainer: {
    width: 56, // Exact from Figma layout_KVV7NL
    height: 56, // Exact from Figma layout_KVV7NL
    borderRadius: 8, // Exact from Figma
    overflow: 'hidden',
    // Gradient background: linear-gradient(180deg, rgba(224, 242, 241, 1) 0%, rgba(245, 245, 245, 1) 100%)
    backgroundColor: '#E0F2F1', // Fallback color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Android shadow
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  itemDetailsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productInfo: {
    flex: 1,
    gap: 0,
  },
  productName: {
    fontSize: 12, // Exact from Figma style_S82YP0
    fontWeight: '500',
    color: '#1A1A1A', // Exact from Figma fill_C8SL8Z
    lineHeight: 18, // 1.5em
  },
  productWeight: {
    fontSize: 12, // Exact from Figma style_6PM8PP
    fontWeight: '400',
    color: '#6B6B6B', // Exact from Figma fill_5S75V0
    lineHeight: 16, // 1.3333333333333333em
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Exact from Figma layout_BA3BLI
    marginLeft: 'auto',
  },
  discountedPrice: {
    fontSize: 14, // Exact from Figma style_UJBVP2
    fontWeight: '500',
    color: '#1A1A1A', // Exact from Figma fill_C8SL8Z
    lineHeight: 20, // 1.4285714285714286em
  },
  originalPrice: {
    fontSize: 12, // Exact from Figma style_6PM8PP
    fontWeight: '400',
    color: '#6B6B6B', // Exact from Figma fill_5S75V0
    textDecorationLine: 'line-through',
    lineHeight: 16, // 1.3333333333333333em
  },
  billSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    gap: 0,
  },
  billSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8, // Exact from Figma layout_ULLVDF
    paddingHorizontal: 16, // Exact from Figma layout_ULLVDF
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D1', // Exact from Figma stroke_W5IWHD
  },
  billSummaryTitle: {
    fontSize: 14, // Exact from Figma style_08NZ63
    fontWeight: '400',
    color: '#1A1A1A', // Exact from Figma fill_UR1F4M
    lineHeight: 20, // 1.4285714285714286em
  },
  savedBadge: {
    backgroundColor: '#D7F1D7', // Exact from Figma fill_I27OZS
    borderRadius: 4,
    paddingHorizontal: 16, // Exact from Figma layout_SVE4LZ
    paddingVertical: 8, // Exact from Figma layout_SVE4LZ
  },
  savedText: {
    fontSize: 12, // Exact from Figma style_Z4HLMA
    fontWeight: '500',
    color: '#2C512C', // Exact from Figma fill_U6IR3Q
    lineHeight: 18, // 1.5em
    textAlignVertical: 'center',
  },
  billItemsContainer: {
    paddingVertical: 12, // Exact from Figma layout_4V63KD
    paddingHorizontal: 16, // Exact from Figma layout_4V63KD
    gap: 4, // Exact from Figma layout_4V63KD
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D1', // Exact from Figma stroke_W5IWHD
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  billItemLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5, // Exact from Figma layout_BUW6MT
  },
  billItemLabel: {
    fontSize: 12, // Exact from Figma style_PPMBZD for Item Total
    fontWeight: '400',
    color: '#6B6B6B', // Exact from Figma fill_JZJRBT
    lineHeight: 18, // 1.5em
  },
  billItemLabelSecondary: {
    fontSize: 12, // Exact from Figma style_GF3PS9 for handling/delivery
    fontWeight: '400',
    color: '#6B6B6B', // Exact from Figma fill_JZJRBT
    lineHeight: 19.2, // 1.6000000635782878em
  },
  infoBadge: {
    width: 9, // Exact from Figma layout_X26KY4
    height: 9, // Exact from Figma layout_X26KY4
    borderRadius: 4.5, // Perfect circle
    backgroundColor: '#E0F2F1', // Exact from Figma fill_0XUKER
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 9,
    minHeight: 9,
  },
  infoText: {
    fontSize: 5.5, // Exact from Figma style_CPKXB1
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 5.5,
    textAlign: 'center',
    includeFontPadding: false,
  },
  billItemValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5, // Exact from Figma layout_V8F0F2
  },
  billItemOriginalPrice: {
    fontSize: 10, // Exact from Figma style_9S2Y94
    fontWeight: '400',
    color: '#6B6B6B', // Exact from Figma fill_JZJRBT
    textDecorationLine: 'line-through',
    lineHeight: 14, // 1.4em
    width: 27, // Exact from Figma layout_HLXVMS
    textAlign: 'right',
  },
  billItemPrice: {
    fontSize: 10, // Exact from Figma style_PPMBZD for item total discounted
    fontWeight: '400',
    color: '#1A1A1A', // Exact from Figma fill_UR1F4M
    lineHeight: 18, // 1.5em
    width: 27, // Exact from Figma layout_HLXVMS
    textAlign: 'right',
  },
  billItemPriceSecondary: {
    fontSize: 12, // Exact from Figma style_WDTFF8 for handling/delivery
    fontWeight: '400',
    color: '#1A1A1A', // Exact from Figma fill_UR1F4M
    lineHeight: 16, // 1.3333333333333333em
    textAlign: 'left',
  },
  totalBillContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8, // Exact from Figma layout_T66AH3
    paddingHorizontal: 16, // Exact from Figma layout_T66AH3
  },
  totalBillLabel: {
    fontSize: 12, // Exact from Figma style_PPMBZD
    fontWeight: '400',
    color: '#1A1A1A', // Exact from Figma fill_UR1F4M
    lineHeight: 18, // 1.5em
  },
  totalBillPrice: {
    fontSize: 14, // Exact from Figma style_813L5N
    fontWeight: '500', // Exact from Figma
    color: '#1A1A1A', // Exact from Figma fill_SQT3HW
    lineHeight: 20, // 1.4285714285714286em
    minWidth: 30, // Exact from Figma layout_BUL4AC (using minWidth to allow single line)
    flexShrink: 0, // Prevent shrinking
  },
  invoiceContainer: {
    paddingVertical: 8, // Exact from Figma layout_GO2OPM
    paddingHorizontal: 16, // Exact from Figma layout_GO2OPM
    borderTopWidth: 1,
    borderTopColor: '#D1D1D1', // Exact from Figma stroke_L4FTFV
    alignItems: 'flex-end', // Exact from Figma layout_GO2OPM
  },
  invoiceButton: {
    backgroundColor: '#CDE19A', // Exact from Figma fill_RZQI5Z
    borderRadius: 4,
    paddingVertical: 0,
    paddingHorizontal: 8, // Exact from Figma layout_MHBJ36
    height: 32, // Exact from Figma layout_MHBJ36
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2, // Exact from Figma layout_MHBJ36
  },
  invoiceButtonText: {
    fontSize: 10, // Exact from Figma style_PY5NOE
    fontWeight: '500',
    color: '#034703', // Exact from Figma primary
    lineHeight: 14, // 1.4em
    textAlignVertical: 'center',
  },
  orderDetailsCard: {
    backgroundColor: '#FFFFFF', // Exact from Figma fill_R8I57C
    borderRadius: 8,
    padding: 12, // Exact from Figma layout_C0267J
    paddingHorizontal: 16, // Exact from Figma layout_C0267J
    gap: 12, // Exact from Figma layout_C0267J
  },
  orderDetailsTitle: {
    fontSize: 16, // Exact from Figma style_LPM5KX
    fontWeight: '400',
    color: '#1A1A1A', // Exact from Figma fill_IOS8PB
    lineHeight: 24, // 1.5em
  },
  orderDetailsContainer: {
    gap: 8, // Exact from Figma layout_ONLZ3P
  },
  orderDetailItem: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: 0,
  },
  orderDetailLabelContainer: {
    width: '100%',
    minHeight: 20, // Exact from Figma layout_IZGRBG
    justifyContent: 'center',
  },
  orderDetailLabel: {
    fontSize: 14, // Exact from Figma style_PHRPL0
    fontWeight: '500',
    color: '#4C4C4C', // Exact from Figma fill_Z66K6L
    lineHeight: 20, // 1.4285714285714286em
    includeFontPadding: false,
  },
  orderDetailValueContainer: {
    width: '100%',
    minHeight: 20, // Exact from Figma layout_IZGRBG
    justifyContent: 'center',
  },
  orderDetailValue: {
    fontSize: 12, // Exact from Figma style_RHUSLL
    fontWeight: '400',
    color: '#4E4E4E', // Exact from Figma fill_5O6DMB
    lineHeight: 18, // 1.5em
    includeFontPadding: false,
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 0.6,
    borderColor: '#F4F4F4',
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
    overflow: 'hidden',
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
});

export default OrderItemsDetails;

