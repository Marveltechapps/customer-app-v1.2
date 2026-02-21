/**
 * Coupons Screen
 * 
 * Recreated to match Figma design node-id=12635-17734
 * Shows available coupons with search and apply functionality
 * 
 * Features:
 * - Search input for coupon codes
 * - Apply button for manual coupon entry
 * - Available coupons list with details
 * - Expandable coupon details
 * - Apply coupon functionality
 * 
 * @format
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../components/layout/Header';
import PlusIcon from '../assets/images/plus.svg';
import type { RootStackNavigationProp } from '../types/navigation';

interface CouponData {
  id: string;
  title: string;
  code: string;
  description: string;
  requirements: string[];
  isExpanded?: boolean;
}

// Dummy static data - Replace with API call later
const DUMMY_COUPONS: CouponData[] = [
  {
    id: '1',
    title: 'Get 10% offer',
    code: 'NAGATAR',
    description: 'Add Products worth ₹299 to avail this deal',
    requirements: [
      "Add Products worth ₹299 to avail this deal",
      "You're just ₹149 away from unlocking free shipping!",
      "Spend ₹499 more to get a surprise gift with your order.",
    ],
  },
  {
    id: '2',
    title: 'Get 10% offer',
    code: 'NAGATAR',
    description: 'Add Products worth ₹299 to avail this deal',
    requirements: [
      "Add Products worth ₹299 to avail this deal",
      "Add Products worth ₹299 to avail this deal",
      "Add Products worth ₹299 to avail this deal",
      "You're just ₹149 away from unlocking free shipping!",
      "You're just ₹149 away from unlocking free shipping!",
      "You're just ₹149 away from unlocking free shipping!",
      "Spend ₹499 more to get a surprise gift with your order.",
      "Spend ₹499 more to get a surprise gift with your order.",
      "Spend ₹499 more to get a surprise gift with your order.",
    ],
  },
];

const Coupons: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const [couponCode, setCouponCode] = useState('');
  const [coupons, setCoupons] = useState<CouponData[]>(DUMMY_COUPONS);

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      // TODO: Apply coupon via API - for now use dummy discount
      const discount = 200; // This should come from API
      // Navigate to Cart tab in MainTabs instead of creating new Checkout screen
      // Get parent navigator (stack navigator) to navigate to MainTabs with nested navigation
      const parentNavigation = navigation.getParent();
      if (parentNavigation) {
        // Navigate to MainTabs and then to Cart tab with params
        // This will update the existing Cart tab instead of creating a new screen
        (parentNavigation as any).navigate('MainTabs', {
          screen: 'Cart',
          params: {
            appliedCoupon: {
              code: couponCode.trim().toUpperCase(),
              discount: discount,
            },
          },
        });
      } else {
        // Fallback: If we can't get parent, try direct navigation to Cart
        // This works if we're already in a tab navigator context
        (navigation as any).navigate('Cart', {
          appliedCoupon: {
            code: couponCode.trim().toUpperCase(),
            discount: discount,
          },
        });
      }
    }
  };

  const handleApplyCouponFromList = (coupon: CouponData) => {
    // TODO: Apply coupon via API - for now use dummy discount
    const discount = 200; // This should come from API based on coupon
    // Navigate to Cart tab in MainTabs instead of creating new Checkout screen
    // Get parent navigator (stack navigator) to navigate to MainTabs with nested navigation
    const parentNavigation = navigation.getParent();
    if (parentNavigation) {
      // Navigate to MainTabs and then to Cart tab with params
      // This will update the existing Cart tab instead of creating a new screen
      (parentNavigation as any).navigate('MainTabs', {
        screen: 'Cart',
        params: {
          appliedCoupon: {
            code: coupon.code,
            discount: discount,
          },
        },
      });
    } else {
      // Fallback: If we can't get parent, try direct navigation to Cart
      // This works if we're already in a tab navigator context
      (navigation as any).navigate('Cart', {
        appliedCoupon: {
          code: coupon.code,
          discount: discount,
        },
      });
    }
  };

  const toggleCouponExpansion = (id: string) => {
    setCoupons((prev) =>
      prev.map((coupon) =>
        coupon.id === id ? { ...coupon, isExpanded: !coupon.isExpanded } : coupon
      )
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Coupons" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Search Input Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter coupon code"
                placeholderTextColor="#6B6B6B"
                value={couponCode}
                onChangeText={setCouponCode}
              />
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyCoupon}
                activeOpacity={0.7}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Available Coupons Section */}
          <View style={styles.couponsListSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Coupons</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.couponsList}>
              {coupons.map((coupon) => (
                <View key={coupon.id} style={styles.couponCard}>
                  <View style={styles.couponHeader}>
                    <View style={styles.couponInfo}>
                      <Text style={styles.couponTitle}>{coupon.title}</Text>
                      <Text style={styles.couponCode}>Use code {coupon.code}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.couponApplyButton}
                      onPress={() => handleApplyCouponFromList(coupon)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.couponApplyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>

                  {coupon.isExpanded && (
                    <View style={styles.couponDetails}>
                      {coupon.requirements.map((requirement, index) => (
                        <View key={index} style={styles.requirementItem}>
                          <Text style={styles.requirementText}>{requirement}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.readMoreButton}
                    onPress={() => toggleCouponExpansion(coupon.id)}
                    activeOpacity={0.7}
                  >
                    <PlusIcon width={12} height={12} />
                    <Text style={styles.readMoreText}>
                      {coupon.isExpanded ? 'Read less' : 'Read more'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
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
    paddingBottom: 24,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 20,
  },
  searchSection: {
    width: '100%',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 8.5,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 20,
    padding: 0,
  },
  applyButton: {
    borderWidth: 1,
    borderColor: '#034703',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.31,
    shadowRadius: 4,
    elevation: 2,
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#034703',
    lineHeight: 18,
  },
  couponsListSection: {
    width: '100%',
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#505050',
    lineHeight: 19.36,
  },
  dividerLine: {
    flex: 1,
    height: 0,
    borderTopWidth: 1,
    borderTopColor: '#797979',
    opacity: 0.5,
  },
  couponsList: {
    gap: 8,
  },
  couponCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    borderStyle: 'dashed',
  },
  couponInfo: {
    flex: 1,
    gap: 4,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4C4C4C',
    lineHeight: 24,
  },
  couponCode: {
    fontSize: 12,
    fontWeight: '400',
    color: '#828282',
    lineHeight: 16,
  },
  couponApplyButton: {
    backgroundColor: '#034703',
    borderWidth: 1,
    borderColor: '#013701',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 3.48, height: 3.48 },
    shadowOpacity: 0.31,
    shadowRadius: 4.64,
    elevation: 3,
  },
  couponApplyButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  couponDetails: {
    gap: 8,
  },
  requirementItem: {
    gap: 0,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 14,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#034703',
    lineHeight: 16,
  },
});

export default Coupons;

