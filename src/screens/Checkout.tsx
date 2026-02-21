/**
 * Checkout Screen
 * 
 * Recreated to match Figma design node-id=12626-15711
 * Shows full checkout flow with address, tip, coupons, bill summary, delivery instructions
 * 
 * Features:
 * - Header with item count and Add More button
 * - View Coupons & Offers expandable section
 * - Cart items with discount badges
 * - Delivery Partner Tip with inline tip buttons
 * - Bill Summary with savings badge
 * - Delivery Instructions with toggle buttons
 * - Additional Instructions text input
 * - Bottom payment section with address
 * 
 * @format
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute, useIsFocused } from '@react-navigation/native';
import Header from '../components/layout/Header';
import CartItem, { CartItemData } from '../components/features/cart/CartItem';
import { logger } from '@/utils/logger';
import BillSummary, { BillSummaryData } from '../components/features/cart/BillSummary';
import DeliveryAddressCard from '../components/features/order/DeliveryAddressCard';
import { useCart, CartItem as CartContextItem } from '../contexts/CartContext';
import ShopIcon from '../components/icons/ShopIcon';
import ChevronDownIcon from '../assets/images/chevron-down.svg';
import ChevronUpIcon from '../assets/images/chevron-up.svg';
import MapPinIcon from '../assets/images/map-pin.svg';
import CouponIcon from '../assets/images/coupon-icon.svg';
import TipIcon from '../assets/images/tip-icon.svg';
import RupeeIcon from '../assets/images/rupee-sign.svg';
import NoContactDeliveryIcon from '../assets/images/no-contact-delivery-icon.svg';
import DontRingBellIcon from '../assets/images/dont-ring-bell-icon.svg';
import PetAtHomeIcon from '../assets/images/pet-at-home-icon.svg';
import type { RootStackNavigationProp } from '../types/navigation';

// Dummy static data - Replace with API call later
const DUMMY_DELIVERY_ADDRESS = {
  title: 'Home',
  address: '13, 8/22,Dr Muthu  Lakshmi Rd, D....',
};

interface CheckoutScreenProps {
  initialCartItems?: CartItemData[];
  initialDeliveryAddress?: string;
  initialDeliveryTip?: number;
}

const Checkout: React.FC<CheckoutScreenProps> = ({
  initialCartItems,
  initialDeliveryAddress,
  initialDeliveryTip,
}) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  // Use CartContext instead of local state
  const { cartItems: contextCartItems, updateQuantity, removeFromCart } = useCart();
  
  // Detect if this is the Cart tab (in tab navigator) or Checkout screen (in stack navigator)
  const isCartTab = route.name === 'Cart';
  const isCheckoutScreen = route.name === 'Checkout';
  
  // Always show back button for "My Cart" screen
  const showBackButton = true;
  
  // Handle back navigation - navigate to previous screen
  const handleBackPress = () => {
    if (isCartTab) {
      // We're in tab navigator (Cart tab)
      // Check parent navigator to see if we're in MainTabs
      const parentNavigation = navigation.getParent();
      if (parentNavigation) {
        const parentState = (parentNavigation as any).getState();
        const parentRoutes = parentState?.routes || [];
        const currentIndex = parentState?.index || 0;
        const currentRoute = parentRoutes[currentIndex];
        const isInMainTabs = currentRoute?.name === 'MainTabs';
        
        if (isInMainTabs) {
          // We're in MainTabs - check which tab was active before Cart
          const mainTabsState = currentRoute?.state;
          const mainTabsRoutes = mainTabsState?.routes || [];
          const mainTabsIndex = mainTabsState?.index || 0;
          
          // If Cart is at index 2, previous tabs would be Home (0) or Categories (1)
          // Check the history to see which tab was active before
          const tabHistory = mainTabsState?.history || [];
          
          // If there's history and the last tab before Cart was Home, go to Home
          // Otherwise, default to Home tab
          // For now, always navigate to Home tab when back is pressed from Cart
          navigation.navigate('Home');
        } else {
          // Not in MainTabs - check if previous route in parent stack
          // If previous route exists and is not a login/auth screen, go back
          // Otherwise, navigate to MainTabs with Home
          if (currentIndex > 0) {
            const previousRoute = parentRoutes[currentIndex - 1];
            const previousRouteName = previousRoute?.name;
            
            // Skip auth screens (Login, OTPVerification, Onboarding) - navigate to Home instead
            const authScreens = ['Login', 'OTPVerification', 'Onboarding', 'NoInternet'];
            if (authScreens.includes(previousRouteName)) {
              // Previous screen is auth, navigate to MainTabs with Home
              (parentNavigation as any).navigate('MainTabs', {
                screen: 'Home',
              });
            } else if (previousRouteName === 'Home' || previousRouteName === 'MainTabs') {
              // Previous route is Home/MainTabs, navigate to Home tab
              navigation.navigate('Home');
            } else {
              // Previous route is a product/other screen, go back to it
              (parentNavigation as any).goBack();
            }
          } else {
            // No previous route, navigate to Home tab
            navigation.navigate('Home');
          }
        }
      } else {
        // No parent navigator, navigate to Home tab
        navigation.navigate('Home');
      }
    } else {
      // We're in stack navigator (Checkout screen)
      // Check what the previous route was
      const navState = navigation.getState();
      const routes = navState?.routes || [];
      const currentIndex = navState?.index || 0;
      
      if (currentIndex > 0) {
        const previousRoute = routes[currentIndex - 1];
        const previousRouteName = previousRoute?.name;
        
        // Skip auth screens - navigate to MainTabs with Home instead
        const authScreens = ['Login', 'OTPVerification', 'Onboarding', 'NoInternet'];
        if (authScreens.includes(previousRouteName)) {
          navigation.navigate('MainTabs', {
            screen: 'Home',
          });
        } else if (previousRouteName === 'Home' || previousRouteName === 'MainTabs') {
          // Previous route is Home/MainTabs, navigate to MainTabs with Home
          navigation.navigate('MainTabs', {
            screen: 'Home',
          });
        } else {
          // Otherwise, go back to previous screen
          navigation.goBack();
        }
      } else {
        // No previous screen, navigate to MainTabs with Home as fallback
        navigation.navigate('MainTabs', {
          screen: 'Home',
        });
      }
    }
  };
  
  // Convert CartContext items to CartItemData format for display
  const cartItems: CartItemData[] = useMemo(() => {
    return contextCartItems.map((item: CartContextItem) => ({
      id: item.variantId, // Use variantId as id
      name: item.productName,
      weight: item.variantSize || '1 unit', // Use variantSize as weight, fallback to '1 unit'
      quantity: item.quantity,
      discountedPrice: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
    }));
  }, [contextCartItems]);
  
  // Delivery address state
  const [deliveryAddress, setDeliveryAddress] = useState<string | undefined>(
    initialDeliveryAddress !== undefined ? initialDeliveryAddress : DUMMY_DELIVERY_ADDRESS.address
  );
  const [deliveryAddressTitle, setDeliveryAddressTitle] = useState<string | undefined>(
    initialDeliveryAddress !== undefined 
      ? (initialDeliveryAddress ? DUMMY_DELIVERY_ADDRESS.title : undefined)
      : DUMMY_DELIVERY_ADDRESS.title
  );
  
  // Delivery tip state
  const [deliveryTip, setDeliveryTip] = useState<number | undefined>(
    initialDeliveryTip
  );
  const [showCustomTipModal, setShowCustomTipModal] = useState(false);
  const [customTipAmount, setCustomTipAmount] = useState('');
  
  // Delivery instructions state
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Applied coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  // Button press animations
  const paymentButtonScale = useRef(new Animated.Value(1)).current;
  const tipButtonScales = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(1))
  ).current;
  const instructionButtonScales = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(1))
  ).current;

  // Expandable section animations
  const deliveryInstructionsHeight = useRef(new Animated.Value(0)).current;
  const deliveryInstructionsOpacity = useRef(new Animated.Value(0)).current;
  const [isDeliveryInstructionsExpanded, setIsDeliveryInstructionsExpanded] = useState(true);

  // Empty cart animation
  const emptyCartOpacity = useRef(new Animated.Value(0)).current;
  const emptyCartScale = useRef(new Animated.Value(0.9)).current;

  // Animation refs for cart items - create max 20 items to handle dynamic cart
  const MAX_CART_ITEMS = 20;
  const cartItemAnimations = useRef(
    Array.from({ length: MAX_CART_ITEMS }, () => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(30),
    }))
  ).current;
  
  // Initialize delivery address - Placeholder for API integration
  useEffect(() => {
    if (initialDeliveryAddress === undefined) {
      setDeliveryAddress(DUMMY_DELIVERY_ADDRESS.address);
      setDeliveryAddressTitle(DUMMY_DELIVERY_ADDRESS.title);
    } else if (initialDeliveryAddress) {
      setDeliveryAddress(initialDeliveryAddress);
      setDeliveryAddressTitle(DUMMY_DELIVERY_ADDRESS.title);
    }
  }, [initialDeliveryAddress]);

  // Animate cart items when screen is focused or when items change
  useFocusEffect(
    useCallback(() => {
      if (cartItems.length > 0) {
        // Staggered animation for cart items
        cartItems.forEach((_, index) => {
          const anim = cartItemAnimations[index];
          if (anim) {
            // Reset animation values
            anim.opacity.setValue(0);
            anim.translateX.setValue(30);
            
            // Start animation
            Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 400,
                delay: index * 80, // 80ms delay between items
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateX, {
                toValue: 0,
                duration: 400,
                delay: index * 80,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]).start();
          }
        });

        // Hide empty cart animation
        emptyCartOpacity.setValue(0);
        emptyCartScale.setValue(0.9);
      } else {
        // Show empty cart animation
        Animated.parallel([
          Animated.timing(emptyCartOpacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(emptyCartScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
        ]).start();
      }
    }, [cartItems.length])
  );

  // Handle coupon applied from Coupons screen
  // This works for both stack navigation (Checkout screen) and tab navigation (Cart tab)
  useFocusEffect(
    useCallback(() => {
      const params = route.params as { appliedCoupon?: { code: string; discount: number } } | undefined;
      if (params?.appliedCoupon) {
        setAppliedCoupon(params.appliedCoupon);
        // Clear params after applying to prevent re-applying on subsequent focuses
        // Only clear if we can set params (works for both stack and tab navigation)
        try {
          navigation.setParams({ appliedCoupon: undefined } as any);
        } catch (error) {
          // If setParams fails (e.g., in tab navigator), that's okay
          // The params will be cleared on next navigation anyway
        }
      }
    }, [route.params, navigation])
  );

  // Calculate bill summary
  const calculateBillSummary = (): BillSummaryData => {
    const itemTotal = cartItems.reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity,
      0
    );
    const itemTotalOriginal = cartItems.reduce(
      (sum, item) => sum + item.originalPrice * item.quantity,
      0
    );
    const totalSavings = itemTotalOriginal - itemTotal;
    const handlingCharge = 5.0;
    const deliveryFee = 0; // Free delivery
    const tipAmount = deliveryTip || 0;
    
    const totalBill = itemTotal + handlingCharge + deliveryFee + tipAmount;

    return {
      itemTotal,
      itemTotalOriginal,
      deliveryFee,
      handlingCharge,
      totalSavings,
      deliveryTip: tipAmount > 0 ? tipAmount : undefined,
      totalBill: Math.max(0, totalBill),
    };
  };

  // Handle cart item quantity change - uses CartContext
  const handleQuantityChange = (id: string, newQuantity: number) => {
    // id is variantId in CartContext
    updateQuantity(id, newQuantity);
    // TODO: Update cart via API
  };

  // Handle cart item removal - uses CartContext
  const handleRemoveItem = (id: string) => {
    // id is variantId in CartContext
    removeFromCart(id);
    // TODO: Remove item via API
  };

  // Handle delivery address selection
  const handleAddressPress = () => {
    navigation.navigate('Addresses');
  };

  // Handle change address press
  const handleChangeAddressPress = () => {
    navigation.navigate('Addresses');
  };

  // Handle custom tip
  const handleCustomTip = () => {
    setCustomTipAmount(deliveryTip && deliveryTip !== 10 && deliveryTip !== 20 && deliveryTip !== 30 ? deliveryTip.toString() : '');
    setShowCustomTipModal(true);
  };

  // Handle apply custom tip
  const handleApplyCustomTip = () => {
    const tipAmount = parseFloat(customTipAmount);
    if (!isNaN(tipAmount) && tipAmount >= 0) {
      setDeliveryTip(tipAmount);
      setShowCustomTipModal(false);
      setCustomTipAmount('');
    }
  };

  // Handle cancel custom tip
  const handleCancelCustomTip = () => {
    setShowCustomTipModal(false);
    setCustomTipAmount('');
  };

  // Handle delivery instruction toggle with animation
  const handleInstructionToggle = (instruction: string) => {
    const index = instruction === 'no-contact' ? 0 : instruction === 'no-bell' ? 1 : 2;
    // Animate button press
    Animated.sequence([
      Animated.timing(instructionButtonScales[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(instructionButtonScales[index], {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();

    setSelectedInstructions((prev) => {
      if (prev.includes(instruction)) {
        return prev.filter((i) => i !== instruction);
      } else {
        return [...prev, instruction];
      }
    });
  };

  // Handle proceed to payment with animation
  const handleProceedToPayment = () => {
    Animated.sequence([
      Animated.timing(paymentButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(paymentButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start(() => {
      logger.info('Proceed to payment');
      // navigation.navigate('Payment');
    });
  };

  // Handle tip button select with animation
  const handleTipSelect = (amount: number) => {
    const index = amount === 10 ? 0 : amount === 20 ? 1 : amount === 30 ? 2 : 3;
    // Animate button press
    Animated.sequence([
      Animated.timing(tipButtonScales[index], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(tipButtonScales[index], {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
    
    setDeliveryTip(amount);
    // TODO: Update tip via API
  };

  // Handle add more press - navigate to home page
  const handleAddMorePress = () => {
    // Navigate to Home tab in MainTabs
    if (isCartTab) {
      // We're in tab navigator, switch to Home tab
      navigation.navigate('Home');
    } else {
      // We're in stack navigator, navigate to MainTabs with Home tab
      navigation.navigate('MainTabs', {
        screen: 'Home',
      });
    }
  };

  const billSummary = calculateBillSummary();
  const itemCount = `${cartItems.reduce((sum, item) => sum + item.quantity, 0)} ${cartItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header 
        title="My Cart" 
        itemCount={cartItems.length > 0 ? itemCount : undefined}
        onAddMorePress={cartItems.length > 0 ? handleAddMorePress : undefined}
        showBackButton={showBackButton}
        onBackPress={showBackButton ? handleBackPress : undefined}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Product list container */}
        <View style={styles.productListContainer}>
          {/* View Coupons & Offers Section - Only show when cart has items */}
          {cartItems.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.couponsSection}
                onPress={() => navigation.navigate('Coupons')}
                activeOpacity={0.7}
              >
                <View style={styles.couponsContent}>
                  <View style={styles.couponsLeft}>
                    <CouponIcon width={20} height={20} />
                    <Text style={styles.couponsText}>View Coupons & Offers</Text>
                  </View>
                  <ChevronDownIcon width={20} height={20} />
                </View>
              </TouchableOpacity>

              {/* Applied Coupon Section */}
              {appliedCoupon && (
            <View style={styles.appliedCouponSection}>
              <View style={styles.appliedCouponContent}>
                <View style={styles.appliedCouponLeft}>
                  <CouponIcon width={20} height={20} />
                  <View style={styles.appliedCouponTextContainer}>
                    <Text style={styles.appliedCouponSavingsText}>
                      Saved {appliedCoupon.discount} rs using this coupn
                    </Text>
                    <Text style={styles.appliedCouponCodeText}>
                      {appliedCoupon.code} applied
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeCouponButton}
                  onPress={() => setAppliedCoupon(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeCouponButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
              )}
            </>
          )}

          {/* Cart Items - Animated */}
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => {
              const anim = cartItemAnimations[index];
              if (!anim) return null; // Safety check
              
              return (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.cartItemWrapper,
                    {
                      opacity: anim.opacity,
                      transform: [{ translateX: anim.translateX }],
                    },
                  ]}
                >
                  <CartItem
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                </Animated.View>
              );
            })
          ) : (
            <Animated.View
              style={[
                styles.emptyCartContainer,
                {
                  opacity: emptyCartOpacity,
                  transform: [{ scale: emptyCartScale }],
                },
              ]}
            >
              {/* Empty Cart Image */}
              <View style={styles.emptyCartImageContainer}>
                <Image
                  source={require('../assets/images/empty-cart-image.png')}
                  style={styles.emptyCartImage}
                  resizeMode="contain"
                />
              </View>

              {/* Title */}
              <Text style={styles.emptyCartTitle}>Your cart is empty</Text>

              {/* Subtitle */}
              <Text style={styles.emptyCartSubtitle}>Add fresh organic items to get started</Text>

              {/* Warning Card */}
              <View style={styles.emptyCartWarningCard}>
                <View style={styles.emptyCartWarningContent}>
                  <View style={styles.emptyCartWarningIconContainer}>
                    <View style={styles.emptyCartWarningIconCircle}>
                      <Text style={styles.emptyCartWarningIcon}>⚠</Text>
                    </View>
                  </View>
                  <View style={styles.emptyCartWarningTextContainer}>
                    <Text style={styles.emptyCartWarningTitle}>Don't Risk Your Health</Text>
                    <Text style={styles.emptyCartWarningDescription}>
                      Avoid poison on your plate. Fill your cart with lab-tested, toxin-free groceries now.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Browse Button */}
              <TouchableOpacity
                style={styles.emptyCartButton}
                onPress={handleAddMorePress}
                activeOpacity={0.8}
              >
                <ShopIcon color="#FFFFFF" size={14} />
                <Text style={styles.emptyCartButtonText} numberOfLines={1}>
                  Browse healthy products
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Only show checkout sections when cart has items */}
          {cartItems.length > 0 && (
            <>
              {/* Delivery Partner Tip Section */}
              <View style={styles.tipSection}>
            <View style={styles.tipContent}>
              <View style={styles.tipInfo}>
                <View style={styles.tipTextContainer}>
                  <Text style={styles.tipTitle}>Delivery Partner Tip</Text>
                  <Text style={styles.tipDescription}>This amount goes to your delivery partner.</Text>
                </View>
                <View style={styles.tipOptionsContainer}>
                  <View style={styles.tipButtonsRow}>
                    <Animated.View style={{ transform: [{ scale: tipButtonScales[0] }] }}>
                      <TouchableOpacity
                        style={[
                          styles.tipButton,
                          deliveryTip === 10 && styles.tipButtonSelected
                        ]}
                        onPress={() => handleTipSelect(10)}
                        activeOpacity={1}
                      >
                        <View style={styles.tipButtonContent}>
                          <TipIcon width={12} height={12} />
                          <Text style={styles.tipButtonText}>₹10</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                    <Animated.View style={{ transform: [{ scale: tipButtonScales[1] }] }}>
                      <TouchableOpacity
                        style={[
                          styles.tipButton,
                          styles.tipButtonMedium,
                          deliveryTip === 20 && styles.tipButtonSelected
                        ]}
                        onPress={() => handleTipSelect(20)}
                        activeOpacity={1}
                      >
                        <View style={styles.tipButtonContentMedium}>
                          <TipIcon width={12} height={12} />
                          <Text style={styles.tipButtonText}>₹20</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                    <Animated.View style={{ transform: [{ scale: tipButtonScales[2] }] }}>
                      <TouchableOpacity
                        style={[
                          styles.tipButton,
                          styles.tipButtonMedium,
                          deliveryTip === 30 && styles.tipButtonSelected
                        ]}
                        onPress={() => handleTipSelect(30)}
                        activeOpacity={1}
                      >
                        <View style={styles.tipButtonContentMedium}>
                          <TipIcon width={12} height={12} />
                          <Text style={styles.tipButtonText}>₹30</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                  <Animated.View style={{ transform: [{ scale: tipButtonScales[3] }] }}>
                    <TouchableOpacity
                      style={[
                        styles.tipButton,
                        styles.tipButtonCustom,
                        (deliveryTip && deliveryTip !== 10 && deliveryTip !== 20 && deliveryTip !== 30) ? styles.tipButtonSelected : undefined
                      ]}
                      onPress={handleCustomTip}
                      activeOpacity={1}
                    >
                      <View style={styles.tipButtonCustomContainer}>
                        <Text style={styles.tipButtonText} numberOfLines={1}>Custom</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
              <View style={styles.tipImageContainer}>
                <Image 
                  source={require('../assets/images/tip-image.png')} 
                  style={styles.tipImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          {/* Bill Summary */}
          <View style={styles.billSummaryWrapper}>
            <BillSummary data={billSummary} />
          </View>

          {/* Delivery Instructions Section */}
          <View style={styles.deliveryInstructionsSection}>
            <View style={styles.deliveryInstructionsContent}>
              <View style={styles.deliveryInstructionsTextContainer}>
                <Text style={styles.deliveryInstructionsTitle}>Delivery Instructions</Text>
                <Text style={styles.deliveryInstructionsDescription}>Delivery partner will be notified</Text>
              </View>
              <View style={styles.deliveryInstructionsButtons}>
                <Animated.View style={{ transform: [{ scale: instructionButtonScales[0] }] }}>
                  <TouchableOpacity
                    style={[
                      styles.deliveryInstructionButton,
                      selectedInstructions.includes('no-contact') 
                        ? styles.deliveryInstructionButtonEnabled 
                        : styles.deliveryInstructionButtonDisabled
                    ]}
                    onPress={() => handleInstructionToggle('no-contact')}
                    activeOpacity={1}
                  >
                    <View style={styles.deliveryInstructionIconContainerNoContact}>
                      <NoContactDeliveryIcon width={77} height={14} />
                      {selectedInstructions.includes('no-contact') && (
                        <View style={styles.deliveryInstructionCheckmark}>
                          <Text style={styles.deliveryInstructionCheckmarkText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.deliveryInstructionButtonText}>No Contact Delivery</Text>
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: instructionButtonScales[1] }] }}>
                  <TouchableOpacity
                    style={[
                      styles.deliveryInstructionButton,
                      selectedInstructions.includes('no-bell') 
                        ? styles.deliveryInstructionButtonEnabled 
                        : styles.deliveryInstructionButtonDisabled
                    ]}
                    onPress={() => handleInstructionToggle('no-bell')}
                    activeOpacity={1}
                  >
                    <View style={styles.deliveryInstructionIconContainer}>
                      <DontRingBellIcon width={14} height={14} />
                      {selectedInstructions.includes('no-bell') && (
                        <View style={styles.deliveryInstructionCheckmark}>
                          <Text style={styles.deliveryInstructionCheckmarkText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.deliveryInstructionButtonText}>Don't ring the bell</Text>
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: instructionButtonScales[2] }] }}>
                  <TouchableOpacity
                    style={[
                      styles.deliveryInstructionButton,
                      selectedInstructions.includes('pet') 
                        ? styles.deliveryInstructionButtonEnabled 
                        : styles.deliveryInstructionButtonDisabled
                    ]}
                    onPress={() => handleInstructionToggle('pet')}
                    activeOpacity={1}
                  >
                    <View style={styles.deliveryInstructionIconContainer}>
                      <PetAtHomeIcon width={14} height={14} />
                      {selectedInstructions.includes('pet') && (
                        <View style={styles.deliveryInstructionCheckmark}>
                          <Text style={styles.deliveryInstructionCheckmarkText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.deliveryInstructionButtonText}>Pet at home</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          </View>

          {/* Additional Instructions Section */}
          <View style={styles.additionalInstructionsSection}>
            <View style={styles.additionalInstructionsContent}>
              <View style={styles.additionalInstructionsTextContainer}>
                <Text style={styles.additionalInstructionsTitle}>Additional Instructions (Optional)</Text>
                <Text style={styles.additionalInstructionsDescription}>
                  Add special delivery instructions for your order.
                </Text>
              </View>
              <TextInput
                style={styles.additionalInstructionsInput}
                placeholder="E.g., Leave at door, Call upon arrival..."
                placeholderTextColor="rgba(107, 107, 107, 0.5)"
                value={additionalInstructions}
                onChangeText={setAdditionalInstructions}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Payment Section - Only show when cart has items */}
      {cartItems.length > 0 && (
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom }]}>
        <View style={styles.addressCard}>
          <View style={styles.addressCardContent}>
            <View style={styles.addressCardLeft}>
              <MapPinIcon width={17} height={17} />
              <View style={styles.addressCardText}>
                <View style={styles.addressTypeContainer}>
                  <Text style={styles.addressType}>{deliveryAddressTitle || 'Home'}</Text>
                </View>
                <Text style={styles.addressText} numberOfLines={1}>
                  {deliveryAddress || 'Select delivery address'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleChangeAddressPress}
              activeOpacity={0.7}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>TO PAY :</Text>
            <Text style={styles.paymentAmount}>₹{billSummary.totalBill.toFixed(0)}</Text>
          </View>
          <Animated.View style={{ transform: [{ scale: paymentButtonScale }] }}>
            <TouchableOpacity
              style={styles.paymentButton}
              onPress={handleProceedToPayment}
              activeOpacity={1}
            >
              <Text style={styles.paymentButtonText}>Continue to Payment</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
      )}

      {/* Custom Tip Modal */}
      <Modal
        visible={showCustomTipModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelCustomTip}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCancelCustomTip}
          >
            <TouchableOpacity
              style={styles.customTipModal}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.customTipModalContent}>
                <View style={styles.customTipModalTextContainer}>
                  <Text style={styles.customTipModalTitle}>Delivery Partner Tip</Text>
                  <Text style={styles.customTipModalDescription}>
                    This amount goes to your delivery partner.
                  </Text>
                </View>

                <View style={styles.customTipInputContainer}>
                  <Text style={styles.customTipInputLabel}>Enter the amount</Text>
                  <View style={styles.customTipInputWrapper}>
                    <RupeeIcon width={9} height={12} />
                    <TextInput
                      style={styles.customTipInput}
                      placeholder="50"
                      placeholderTextColor="#666666"
                      value={customTipAmount}
                      onChangeText={setCustomTipAmount}
                      keyboardType="numeric"
                      autoFocus
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.customTipApplyButton}
                  onPress={handleApplyCustomTip}
                  activeOpacity={0.7}
                  disabled={!customTipAmount || isNaN(parseFloat(customTipAmount)) || parseFloat(customTipAmount) < 0}
                >
                  <Text style={styles.customTipApplyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingBottom: 200, // Extra padding for bottom payment section
  },
  productListContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  couponsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  couponsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  couponsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4C4C4C',
    lineHeight: 20,
  },
  appliedCouponSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  appliedCouponContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appliedCouponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  appliedCouponTextContainer: {
    flexDirection: 'column',
    gap: 0,
    flex: 1,
  },
  appliedCouponSavingsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4C4C4C',
    lineHeight: 20, // 1.4285714285714286em
  },
  appliedCouponCodeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3F723F',
    lineHeight: 18, // 1.5em
    fontFamily: 'Poppins', // Note: Poppins may not be available, will use system default
  },
  removeCouponButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeCouponButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D7263D',
    lineHeight: 20, // 1.6666666666666667em
  },
  cartItemWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  emptyCartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    alignSelf: 'stretch',
  },
  emptyCartImageContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartImage: {
    width: 224,
    height: 224,
    opacity: 0.9,
  },
  emptyCartTitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#1A1A1A',
    textAlign: 'center',
    paddingHorizontal: 0,
  },
  emptyCartSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    width: 325,
  },
  emptyCartWarningCard: {
    width: 325,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFC9C9',
    backgroundColor: '#FEF2F2', // Light gradient approximation
  },
  emptyCartWarningContent: {
    flexDirection: 'row',
    gap: 10.5,
    alignItems: 'flex-start',
  },
  emptyCartWarningIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartWarningIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartWarningIcon: {
    fontSize: 14,
    color: '#E7000B',
  },
  emptyCartWarningTextContainer: {
    flex: 1,
    gap: 3.5,
  },
  emptyCartWarningTitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: '#1A1A1A',
    marginBottom: 3.5,
  },
  emptyCartWarningDescription: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: '#6B6B6B',
  },
  emptyCartButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 16, // Reduced padding to allow text in one line
    backgroundColor: '#034703',
    borderRadius: 8,
    minHeight: 48,
  },
  emptyCartButtonText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22.4,
    color: '#FFFFFF',
    textAlign: 'center',
    flexShrink: 0, // Prevent text wrapping
  },
  tipSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    alignSelf: 'stretch',
  },
  tipContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  tipInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
  },
  tipTextContainer: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    gap: 0,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 20, // 1.4285714285714286em
  },
  tipDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B6B6B',
    lineHeight: 18, // 1.5em
  },
  tipOptionsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
  },
  tipButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tipButtonMedium: {
    width: 61,
  },
  tipButtonSelected: {
    borderColor: '#034703',
    backgroundColor: '#F5F5F5',
  },
  tipButtonCustom: {
    width: 72,
    flexDirection: 'column',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tipButtonCustomContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    gap: 4,
  },
  tipButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 37,
  },
  tipButtonContentMedium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 39,
  },
  tipButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
    lineHeight: 16, // 1.3333333333333333em
    flexShrink: 0,
    textAlign: 'left',
  },
  tipImageContainer: {
    width: 76,
    height: 122,
    borderRadius: 10.5,
    overflow: 'hidden',
  },
  tipImage: {
    width: '100%',
    height: '100%',
  },
  billSummaryWrapper: {
    width: '100%',
  },
  deliveryInstructionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  deliveryInstructionsContent: {
    flexDirection: 'column',
    gap: 12,
  },
  deliveryInstructionsTextContainer: {
    flexDirection: 'column',
    gap: 0,
  },
  deliveryInstructionsTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 20, // 1.4285714285714286em
  },
  deliveryInstructionsDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B6B6B',
    lineHeight: 18, // 1.5em
  },
  deliveryInstructionsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 11,
  },
  deliveryInstructionButton: {
    width: 100.67,
    height: 104,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'column',
    alignItems: 'center',
  },
  deliveryInstructionButtonEnabled: {
    backgroundColor: '#E0F2F1',
    gap: 16,
  },
  deliveryInstructionButtonDisabled: {
    backgroundColor: '#F5F5F5',
    gap: 20,
  },
  deliveryInstructionIconContainer: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  deliveryInstructionIconContainerNoContact: {
    width: 77,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  deliveryInstructionCheckmark: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#034703',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryInstructionCheckmarkText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#034703',
    lineHeight: 14,
  },
  deliveryInstructionButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B6B6B',
    lineHeight: 19.2, // 1.6000000635782878em
    textAlign: 'center',
  },
  additionalInstructionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  additionalInstructionsContent: {
    flexDirection: 'column',
    gap: 8,
  },
  additionalInstructionsTextContainer: {
    flexDirection: 'column',
    gap: 0,
  },
  additionalInstructionsTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  additionalInstructionsDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B6B6B',
    lineHeight: 18,
  },
  additionalInstructionsInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 3.5,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 22.4, // 1.5999999727521623em
    minHeight: 44,
    textAlignVertical: 'top',
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 27,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  addressCard: {
    marginBottom: 12,
  },
  addressCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 69,
  },
  addressCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  addressCardText: {
    flex: 1,
    gap: 0,
  },
  addressTypeContainer: {
    marginBottom: 0,
  },
  addressType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4C4C4C',
    lineHeight: 20,
  },
  addressText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#4C4C4C',
    lineHeight: 18,
  },
  changeButton: {
    paddingVertical: 0,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3F723F',
    lineHeight: 20,
  },
  paymentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 35,
  },
  paymentInfo: {
    gap: 10,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4C4C4C',
    lineHeight: 20,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3F723F',
    lineHeight: 28,
    textAlign: 'center',
  },
  paymentButton: {
    backgroundColor: '#034703',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  customTipModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: 349,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  customTipModalContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  customTipModalTextContainer: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    gap: 0,
  },
  customTipModalTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 20, // 1.4285714285714286em
  },
  customTipModalDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B6B6B',
    lineHeight: 18, // 1.5em
  },
  customTipInputContainer: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    gap: 4,
  },
  customTipInputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
    lineHeight: 18, // 1.5em
  },
  customTipInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 4,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 3.5,
    paddingTop: 11,
    paddingBottom: 11,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  customTipInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 16, // 1.3333333333333333em
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  customTipApplyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#034703',
    borderRadius: 8,
  },
  customTipApplyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 24, // 1.7142857142857142em
  },
  bottomNavigationContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 0,
    backgroundColor: '#F5F5F5',
  },
});

export default Checkout;
