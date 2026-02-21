import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PlusIcon from '../../icons/PlusIcon';
import MinusIcon from '../../icons/MinusIcon';

export interface CartItemData {
  id: string;
  name: string;
  weight: string;
  quantity: number;
  discountedPrice: number;
  originalPrice: number;
  image?: string | any; // Can be string URI or ImageSourcePropType (require() result)
}

interface CartItemProps {
  item: CartItemData;
  onQuantityChange?: (id: string, newQuantity: number) => void;
  onRemove?: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
  const handleIncrease = () => {
    onQuantityChange?.(item.id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange?.(item.id, item.quantity - 1);
    } else {
      onRemove?.(item.id);
    }
  };

  const savings = (item.originalPrice - item.discountedPrice) * item.quantity;
  const totalPrice = item.discountedPrice * item.quantity;

  // Use existing product images as fallback
  const getImageSource = () => {
    if (item.image) {
      // If image is a string (URI), use it as URI
      if (typeof item.image === 'string') {
        return { uri: item.image };
      }
      // If image is already an ImageSourcePropType (require() result), use it directly
      return item.image;
    }
    // Fallback to existing product images based on item id
    const productImages: { [key: string]: any } = {
      '1': require('../../../assets/images/product-image-1.png'),
      '2': require('../../../assets/images/product-image-item-1.png'),
    };
    return productImages[item.id] || require('../../../assets/images/product-image-main.png');
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.imageContainer}>
          <View style={styles.imageGradient}>
            <Image source={getImageSource()} style={styles.image} />
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productWeight}>{item.weight}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.discountedPrice}>₹{item.discountedPrice.toFixed(0)}</Text>
            <Text style={styles.originalPrice}>₹{item.originalPrice.toFixed(0)}</Text>
            {item.originalPrice > item.discountedPrice && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText} numberOfLines={1}>
                  {Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100)}% OFF
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleDecrease}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MinusIcon width={20} height={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText} numberOfLines={1} adjustsFontSizeToFit={true} minimumFontScale={0.8}>
              {String(item.quantity)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncrease}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <PlusIcon width={20} height={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 6, // Reduced by 50% (was 12)
    paddingHorizontal: 8, // Reduced by 50% (was 16)
    gap: 6, // Reduced by 50% (was 12)
    alignSelf: 'stretch',
  },
  mainContent: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 8,
    alignItems: 'center',
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8F4F3', // Approximate gradient color (mix of rgba(224, 242, 241, 1) and rgba(245, 245, 245, 1))
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 0,
  },
  productInfo: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    gap: 0,
    marginBottom: 0,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
    lineHeight: 18, // 1.5em
  },
  productWeight: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B6B6B',
    lineHeight: 16, // 1.333em
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 0,
  },
  discountedPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#034703',
    lineHeight: 20, // 1.4285714285714286em
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B6B6B',
    textDecorationLine: 'line-through',
    lineHeight: 16, // 1.333em
  },
  discountBadge: {
    backgroundColor: '#E0F2F1',
    borderRadius: 3.5,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#034703',
    lineHeight: 16, // 1.6em
    textAlign: 'center',
    flexShrink: 0,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    width: 110, // Increased from 88 for more width
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#034703', // Match "Continue to Payment" button color
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#012D01', // Match ProductCard addButton border color
    shadowColor: '#011501', // Match ProductCard addButton shadow color
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.31,
    shadowRadius: 3,
    elevation: 0, // Match ProductCard addButton elevation
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  quantityDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 10,
  },
  quantityText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default CartItem;

