import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../common/Text';
import ProductCard, { Product } from '../features/product/ProductCard';
import ProductVariantModal, { ProductVariant } from '../features/product/ProductVariantModal';
import { useCart } from '../../contexts/CartContext';
import { logger } from '@/utils/logger';

interface DealsSectionProps {
  title?: string;
  onQuantityPress?: (productId: string) => void;
  onAddPress?: (productId: string) => void;
  fetchProducts?: () => Promise<Product[]>;
}

export default function DealsSection({
  title,
  onQuantityPress,
  onAddPress,
  fetchProducts,
}: DealsSectionProps) {
  const { addToCart, updateQuantity, removeFromCart, cartItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productSelectedVariants, setProductSelectedVariants] = useState<Record<string, string>>({});

  // Placeholder for API integration
  useEffect(() => {
    if (fetchProducts) {
      const loadProducts = async () => {
        setLoading(true);
        try {
          const data = await fetchProducts();
          setProducts(data);
        } catch (error) {
          logger.error('Error fetching products', error);
          setProducts([]);
        } finally {
          setLoading(false);
        }
      };
      loadProducts();
    }
  }, [fetchProducts]);

  const handleQuantityPress = (productId: string) => {
    if (onQuantityPress) {
      onQuantityPress(productId);
    } else {
      logger.info('Quantity selector pressed for product', { productId });
    }
  };

  const handleAddPress = (productId: string) => {
    if (onAddPress) {
      onAddPress(productId);
    } else {
      logger.info('Add to cart', { productId });
    }
  };

  const handleCardPress = (productId: string) => {
    // Open ProductVariantModal when dropdown is clicked
    setSelectedProductId(productId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProductId(null);
  };

  const handleVariantSelect = (variantId: string) => {
    if (selectedProductId) {
      // Update selected variant for this product (synchronization)
      setProductSelectedVariants(prev => ({
        ...prev,
        [selectedProductId]: variantId,
      }));
    }
  };

  const handleAddToCart = (variantId: string) => {
    if (selectedProductId) {
      const variant = getProductVariants().find(v => v.id === variantId);
      if (variant) {
        addToCart({
          variantId: variant.id,
          productId: selectedProductId,
          productName: selectedProduct?.name || 'Product',
          variantSize: variant.size,
          image: variant.image,
          price: variant.price,
          originalPrice: variant.originalPrice,
          discount: variant.discount,
        });
        // Update selected variant for this product (synchronization)
        setProductSelectedVariants(prev => ({
          ...prev,
          [selectedProductId]: variantId,
        }));
      }
    }
  };

  const handleQuantityChange = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
    } else {
      updateQuantity(variantId, quantity);
    }
  };

  // Sync selected variants for all products when cart changes
  // This ensures product card shows quantity selector automatically when item is added from dropdown
  useEffect(() => {
    products.forEach(product => {
      const productVariants = getVariantsForProduct(product.id);
      const variantInCart = productVariants.find(v => {
        const cartItem = cartItems.find(item => item.variantId === v.id);
        return cartItem && cartItem.quantity > 0;
      });
      
      // If variant is in cart and not already selected, auto-select it
      // This ensures product card shows quantity selector when item is added from dropdown
      if (variantInCart) {
        setProductSelectedVariants(prev => {
          // Only update if not already set or if different variant is in cart
          if (!prev[product.id] || prev[product.id] !== variantInCart.id) {
            return {
              ...prev,
              [product.id]: variantInCart.id,
            };
          }
          return prev;
        });
      }
    });
  }, [cartItems, products]);

  // Get selected product for modal
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  
  // Generate variants for a product (used for both modal and ProductCard)
  const getVariantsForProduct = (productId: string): Array<{ id: string; size: string }> => {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    
    return [
      { id: `${productId}-500g`, size: '500 g' },
      { id: `${productId}-1kg`, size: '1 kg' },
      { id: `${productId}-2kg`, size: '2 kg' },
    ];
  };
  
  // Generate variants from product (dummy - replace with API call)
  const getProductVariants = (): ProductVariant[] => {
    if (!selectedProduct) {
      // Return dummy variants if no product selected
      return [
        {
          id: '1',
          size: '500 g',
          image: require('../../assets/images/product-image-1.png'),
          price: 126,
          originalPrice: 256,
          discount: '16% OFF',
          quantity: 0,
        },
        {
          id: '2',
          size: '1 kg',
          image: require('../../assets/images/product-image-1.png'),
          price: 126,
          originalPrice: 256,
          discount: '16% OFF',
          quantity: 1, // In cart - shows quantity selector
        },
        {
          id: '3',
          size: '2 kg',
          image: require('../../assets/images/product-image-1.png'),
          price: 126,
          originalPrice: 256,
          discount: '16% OFF',
          quantity: 0,
        },
      ];
    }
    return [
      {
        id: `${selectedProduct.id}-500g`,
        size: '500 g',
        image: selectedProduct.image,
        price: selectedProduct.price,
        originalPrice: selectedProduct.originalPrice,
        discount: selectedProduct.discount,
        quantity: 0,
      },
      {
        id: `${selectedProduct.id}-1kg`,
        size: '1 kg',
        image: selectedProduct.image,
        price: selectedProduct.price * 2,
        originalPrice: selectedProduct.originalPrice * 2,
        discount: selectedProduct.discount,
        quantity: 1, // In cart - shows quantity selector
      },
      {
        id: `${selectedProduct.id}-2kg`,
        size: '2 kg',
        image: selectedProduct.image,
        price: selectedProduct.price * 4,
        originalPrice: selectedProduct.originalPrice * 4,
        discount: selectedProduct.discount,
        quantity: 0,
      },
    ];
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title ?? 'Deal in lowest Price'}</Text>
        </View>
        <View style={styles.dividerContainer}>
          <LinearGradient
            colors={['rgba(121, 121, 121, 1)', 'rgba(245, 245, 245, 1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />
        </View>
      </View>

      {/* Product Cards - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {products.map((product, index) => (
          <View
            key={product.id}
            style={[
              styles.cardWrapper,
              index === 0 && styles.firstCard,
              index === products.length - 1 && styles.lastCard,
            ]}
          >
            <ProductCard
              product={product}
              onQuantityPress={handleQuantityPress}
              onAddPress={handleAddPress}
              onCardPress={handleCardPress}
              variants={getVariantsForProduct(product.id)}
              selectedVariantId={productSelectedVariants[product.id]}
            />
          </View>
        ))}
      </ScrollView>

      {/* Product Variant Modal */}
      {selectedProduct && (
        <ProductVariantModal
          visible={modalVisible}
          productName={selectedProduct.name}
          productId={selectedProduct.id}
          variants={getProductVariants()}
          onClose={handleCloseModal}
          onVariantSelect={handleVariantSelect}
          onAddToCart={handleAddToCart}
          onQuantityChange={handleQuantityChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  titleContainer: {
    flexShrink: 0,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 19.36,
    color: '#222222',
  },
  dividerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingRight: 16,
  },
  cardWrapper: {
    marginRight: 16,
  },
  firstCard: {
    marginLeft: 0,
  },
  lastCard: {
    marginRight: 0,
  },
});

