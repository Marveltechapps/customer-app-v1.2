import React, { useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '@/types/navigation';
import Text from '../../common/Text';
import RupeeIcon from '../../icons/RupeeIcon';
import PlusIcon from '../../icons/PlusIcon';
import MinusIcon from '../../icons/MinusIcon';
import DropdownArrowIcon from '../../icons/DropdownArrowIcon';
import { useCart } from '@/contexts/CartContext';
import { logger } from '@/utils/logger';

export interface Product {
  id: string;
  name: string;
  image: ImageSourcePropType;
  price: number;
  originalPrice: number;
  discount: string;
  quantity: string;
}

interface ProductCardProps {
  product: Product;
  onQuantityPress?: (productId: string) => void;
  onAddPress?: (productId: string) => void;
  onCardPress?: (productId: string) => void; // New prop for opening variant modal
  width?: number; // Optional width prop for responsive design
  selectedVariantId?: string; // Currently selected variant ID for this product
  variants?: Array<{ id: string; size: string }>; // Available variants for this product
}

export default function ProductCard({ 
  product, 
  onQuantityPress, 
  onAddPress, 
  onCardPress, 
  width,
  selectedVariantId,
  variants = []
}: ProductCardProps) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { getItemQuantity, updateQuantity, cartItems, addToCart } = useCart();
  
  // Ref to track variants being added to prevent flicker (2→1)
  const addingVariants = React.useRef<Set<string>>(new Set());
  
  // Find variant in cart (if any variant of this product is in cart)
  const variantInCart = variants.find(v => {
    const cartItem = cartItems.find(item => item.variantId === v.id);
    return cartItem && cartItem.quantity > 0;
  });
  
  // Use selected variant first (persists even when quantity is 0), then variant in cart, then first variant
  // This ensures quantity selector shows the selected variant even when quantity becomes 0
  const activeVariantId = selectedVariantId || variantInCart?.id || variants[0]?.id;
  const selectedVariant = variants.find(v => v.id === activeVariantId) || variants[0];
  const variantSize = selectedVariant?.size || product.quantity || '500 g';
  
  // Get quantity from cart for the active variant
  // If variant is being added, show 1 to prevent flicker
  const rawCartQuantity = activeVariantId ? getItemQuantity(activeVariantId) : 0;
  const cartQuantity = (activeVariantId && addingVariants.current.has(activeVariantId) && rawCartQuantity === 2) 
    ? 1 
    : rawCartQuantity;
  const hasQuantity = cartQuantity > 0;
  
  // Calculate proportional sizes based on width
  // Original: maxWidth 126.5, so we'll use that as base for calculations
  const baseWidth = 126.5;
  const scaleFactor = width ? width / baseWidth : 1;
  
  // Calculate proportional heights and sizes
  // Figma: Image container = 139px, Image wrapper = 111px, Quantity selector = 28px
  const imageHeight = 139 * scaleFactor;
  const imageWrapperHeight = 111 * scaleFactor; // 139 - 28 = 111
  const addButtonWidth = 127 * scaleFactor;
  const quantityContainerHeight = 28; // Fixed height from Figma
  const quantityContainerPaddingHorizontal = 8; // Fixed padding from Figma
  const quantityContainerGap = 4; // Fixed gap from Figma
  const iconSize = 16; // Match modal icon size (16x16)
  const handleQuantityPress = useCallback(() => {
    // Always open modal/dropdown when clicking quantity selector
    if (onCardPress) {
      onCardPress(product.id); // Open ProductVariantModal
    } else if (onQuantityPress) {
      onQuantityPress(product.id); // Fallback handler
    } else {
      logger.info('Quantity selector pressed for product', { productId: product.id });
    }
  }, [product.id, onCardPress, onQuantityPress]);

  const handleImagePress = useCallback(() => {
    // Navigate to product detail page when clicking product image
    navigation.navigate('ProductDetail', { productId: product.id });
  }, [navigation, product.id]);

  const handleAddPress = useCallback(() => {
    // Add button adds item to cart with first/active variant
    // Fix both issues: prevent flicker (2→1) and ensure single click works
    if (activeVariantId && variants.length > 0) {
      const selectedVariant = variants.find(v => v.id === activeVariantId) || variants[0];
      if (selectedVariant) {
        // Check if item is already in cart - use cartItems array for more reliable check
        const currentQuantity = getItemQuantity(selectedVariant.id);
        const itemExistsInCart = cartItems.some(item => item.variantId === selectedVariant.id);
        
        // Mark variant as being added to prevent flicker
        addingVariants.current.add(selectedVariant.id);
        
        if (!itemExistsInCart && currentQuantity === 0) {
          // Item definitely not in cart, add it first
          addToCart({
            variantId: selectedVariant.id,
            productId: product.id,
            productName: product.name,
            variantSize: selectedVariant.size,
            image: product.image,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
          });
          
          // Immediately set quantity to 1 to prevent flicker (2→1)
          // Use setTimeout to ensure addToCart completes first, then set to 1
          setTimeout(() => {
            updateQuantity(selectedVariant.id, 1);
            // Clear the flag after updates complete
            setTimeout(() => {
              addingVariants.current.delete(selectedVariant.id);
            }, 100);
          }, 0);
        } else {
          // Item already in cart, set quantity to 1 (not increment)
          updateQuantity(selectedVariant.id, 1);
          // Clear the flag
          setTimeout(() => {
            addingVariants.current.delete(selectedVariant.id);
          }, 100);
        }
      }
    } else if (onAddPress) {
      onAddPress(product.id);
    } else {
      logger.info('Add to cart', { productId: product.id });
    }
  }, [activeVariantId, variants, getItemQuantity, cartItems, addToCart, updateQuantity, product, onAddPress]);

  const handleAddButtonDecrease = useCallback((e: any) => {
    e?.stopPropagation?.();
    if (activeVariantId && cartQuantity > 0) {
      const newQuantity = cartQuantity - 1;
      updateQuantity(activeVariantId, newQuantity);
    }
  }, [activeVariantId, cartQuantity, updateQuantity]);

  const handleAddButtonIncrease = useCallback((e: any) => {
    e?.stopPropagation?.();
    if (activeVariantId && cartQuantity >= 0) {
      const newQuantity = cartQuantity + 1;
      updateQuantity(activeVariantId, newQuantity);
    }
  }, [activeVariantId, cartQuantity, updateQuantity]);

  const handleDecrease = useCallback((e: any) => {
    e?.stopPropagation?.();
    if (activeVariantId && cartQuantity > 0) {
      const newQuantity = cartQuantity - 1;
      updateQuantity(activeVariantId, newQuantity);
    }
  }, [activeVariantId, cartQuantity, updateQuantity]);

  const handleIncrease = useCallback((e: any) => {
    e?.stopPropagation?.();
    if (activeVariantId && cartQuantity >= 0) {
      const newQuantity = cartQuantity + 1;
      updateQuantity(activeVariantId, newQuantity);
    } else {
      // If no variant selected or not in cart, open modal
      handleQuantityPress();
    }
  }, [activeVariantId, cartQuantity, updateQuantity, handleQuantityPress]);

  return (
    <View style={[styles.container, width ? { width, maxWidth: width } : null]}>
      {/* Product Image Container - Fixed 139px height from Figma */}
      <View style={styles.imageContainer}>
        {/* Image - Clickable to navigate to product detail */}
        <TouchableOpacity 
          style={styles.imageWrapper}
          onPress={handleImagePress}
          activeOpacity={0.8}
        >
          <Image source={product.image} style={styles.productImage} resizeMode="cover" />
        </TouchableOpacity>
        {/* Quantity Selector - Always shows variant size with dropdown (quantity selection only) */}
        <TouchableOpacity 
          style={styles.quantityContainer}
          onPress={handleQuantityPress}
          activeOpacity={0.7}
        >
          <View style={styles.quantityTextContainer}>
            <Text 
              style={styles.quantityText} 
              numberOfLines={1}
            >
              {variantSize}
            </Text>
          </View>
          <View style={styles.dropdownIconContainer}>
            <DropdownArrowIcon />
          </View>
        </TouchableOpacity>
      </View>

      {/* Product Info Container - Not clickable */}
      <View style={styles.infoContainer}>
        {/* Product Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
        </View>

        {/* Discount and Price Container */}
        <View style={styles.priceDiscountContainer}>
          {/* Discount Badge */}
          <View style={styles.discountContainer}>
            <Text style={styles.discountText}>{product.discount}</Text>
          </View>

          {/* Price Row */}
          <View style={styles.priceRow}>
            {/* Current Price */}
            <View style={styles.currentPriceContainer}>
              <View style={styles.rupeeIconContainer}>
                <RupeeIcon size={10} color="#222222" />
              </View>
              <View style={styles.priceTextContainer}>
                <Text style={styles.currentPrice}>{product.price}</Text>
              </View>
            </View>

            {/* Original Price with Strikethrough */}
            <View style={styles.originalPriceContainer}>
              <View style={styles.originalPriceContent}>
                <View style={styles.originalPriceRupeeContainer}>
                  <RupeeIcon size={6} color="#777777" />
                </View>
                <View style={styles.originalPriceTextContainer}>
                  <Text style={styles.originalPrice}>{product.originalPrice}</Text>
                  <View style={styles.strikethroughLine} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Add Button or Quantity Selector - ONLY Add Button Section */}
        {hasQuantity ? (
          <View style={[styles.addButton, styles.addButtonQuantityLayout, width ? { width: addButtonWidth } : null]}>
            <TouchableOpacity 
              style={styles.addButtonQuantityButton}
              onPress={handleAddButtonDecrease}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MinusIcon width={20} height={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.addButtonQuantityDisplay}>
              <Text style={styles.addButtonQuantityText} numberOfLines={1} adjustsFontSizeToFit={true} minimumFontScale={0.8}>
                {String(cartQuantity)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.addButtonQuantityButton}
              onPress={handleAddButtonIncrease}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <PlusIcon width={20} height={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.addButton, 
              styles.addButtonCentered,
              width ? { width: addButtonWidth } : null
            ]}
            onPress={handleAddPress}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 126.5,
    gap: 4,
    alignSelf: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 139, // Fixed height from Figma
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  imageWrapper: {
    width: '100%',
    height: 111, // Fixed height: 139 (container) - 28 (quantity selector) = 111
    backgroundColor: '#EDEDED',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 28, // Fixed height from Figma
    backgroundColor: '#F6FBF6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(3, 71, 3, 0.2)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
    flexShrink: 0,
  },
  quantityControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 28,
    backgroundColor: '#F6FBF6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(3, 71, 3, 0.2)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
    flexShrink: 0,
  },
  quantityControlButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    // Match modal button style
  },
  quantityDisplayContainer: {
    flex: 1,
    minWidth: 20,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplayText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#034703',
    textAlign: 'center',
    includeFontPadding: false,
  },
  quantityTextContainer: {
    width: 48.69, // Fixed width from Figma
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#4C4C4C',
    textAlign: 'center',
    includeFontPadding: false,
  },
  dropdownIconContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    gap: 8,
  },
  nameContainer: {
    gap: 10,
  },
  productName: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    color: '#525252',
  },
  priceDiscountContainer: {
    height: 41.3,
    gap: 0,
  },
  discountContainer: {
    marginBottom: 4,
  },
  discountText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    color: '#FF8C00',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    paddingHorizontal: 1,
  },
  currentPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 30,
    height: 21,
    gap: 2,
  },
  rupeeIconContainer: {
    width: 10,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  priceTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  currentPrice: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#1A1A1A',
  },
  originalPriceContainer: {
    width: 18.5,
    height: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  originalPriceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPriceRupeeContainer: {
    width: 6,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  originalPriceTextContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  originalPrice: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 16,
    color: '#6B6B6B',
  },
  strikethroughLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 0.5,
    backgroundColor: '#777777',
  },
  addButton: {
    width: 127,
    backgroundColor: '#3F723F',
    borderWidth: 1,
    borderColor: '#012D01',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // Shadow effect matching Figma (inset shadow)
    shadowColor: '#011501',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.31,
    shadowRadius: 3,
    elevation: 0,
  },
  addButtonCentered: {
    justifyContent: 'center',
  },
  addButtonQuantityLayout: {
    justifyContent: 'space-between',
  },
  addButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  addButtonQuantityButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  addButtonQuantityDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 10,
  },
  addButtonQuantityText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

