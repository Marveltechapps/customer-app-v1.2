import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform, ScrollView, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackNavigationProp, RootStackRouteProp } from '../types/navigation';
import BackIcon from '../components/icons/BackIcon';
import SearchIcon from '../components/icons/SearchIcon';
import Text from '../components/common/Text';
import BannerProductCard, { BannerProduct } from '../components/features/product/BannerProductCard';
import WhyMoringaSection from '../components/sections/WhyMoringaSection';
import ProductVariantModal, { ProductVariant } from '../components/features/product/ProductVariantModal';
import FloatingCartBar from '../components/features/cart/FloatingCartBar';
import { useCart } from '../contexts/CartContext';
import { useDimensions, getSpacing } from '../utils/responsive';
import { logger } from '@/utils/logger';

// Dummy static data - ready for API replacement
interface BannerDetailData {
  id: string;
  title: string;
  bannerImage: ImageSourcePropType;
  products: BannerProduct[];
}

// Dummy products data
const DUMMY_PRODUCTS: BannerProduct[] = [
  {
    id: '1',
    name: 'Shimla Apple',
    image: require('../assets/images/product-image-1.png'),
    price: 126,
    originalPrice: 256,
    discount: '16% OFF',
    quantity: '500 g',
  },
  {
    id: '2',
    name: 'Fresh Bananas',
    image: require('../assets/images/product-image-2.png'),
    price: 48,
    originalPrice: 60,
    discount: '20% OFF',
    quantity: '1 kg',
  },
  {
    id: '3',
    name: 'Organic Tomatoes',
    image: require('../assets/images/product-image-3.png'),
    price: 80,
    originalPrice: 100,
    discount: '20% OFF',
    quantity: '500 g',
  },
  {
    id: '4',
    name: 'Fresh Carrots',
    image: require('../assets/images/product-image-4.png'),
    price: 45,
    originalPrice: 55,
    discount: '18% OFF',
    quantity: '1 kg',
  },
  {
    id: '5',
    name: 'Green Bell Peppers',
    image: require('../assets/images/product-image-5.png'),
    price: 120,
    originalPrice: 150,
    discount: '20% OFF',
    quantity: '500 g',
  },
  {
    id: '6',
    name: 'Fresh Spinach',
    image: require('../assets/images/product-image-1.png'),
    price: 35,
    originalPrice: 45,
    discount: '22% OFF',
    quantity: '250 g',
  },
];

// Dummy banner detail data
const DUMMY_BANNER_DETAIL: BannerDetailData = {
  id: '1',
  title: 'Moringa',
  bannerImage: require('../assets/images/moringa-banner-68da63.png'),
  products: DUMMY_PRODUCTS,
};

interface BannerDetailScreenProps {
  fetchBannerDetail?: (bannerId: string) => Promise<BannerDetailData>;
  onProductPress?: (productId: string) => void;
  onQuantityPress?: (productId: string) => void;
  onAddPress?: (productId: string) => void;
  onSearchPress?: () => void;
}

export default function BannerDetailScreen({
  fetchBannerDetail,
  onProductPress,
  onQuantityPress,
  onAddPress,
  onSearchPress,
}: BannerDetailScreenProps) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RootStackRouteProp<'BannerDetail'>>();
  const params = route.params || {};
  const [bannerData, setBannerData] = useState<BannerDetailData>(DUMMY_BANNER_DETAIL);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productSelectedVariants, setProductSelectedVariants] = useState<Record<string, string>>({});
  const { addToCart, updateQuantity, removeFromCart, cartItems } = useCart();

  // Placeholder for API integration
  useEffect(() => {
    const loadBannerDetail = async () => {
      if (fetchBannerDetail && params.bannerId) {
        setLoading(true);
        try {
          const data = await fetchBannerDetail(params.bannerId);
          setBannerData(data);
        } catch (error) {
          logger.error('Error fetching banner detail', error);
          // Fallback to dummy data on error
          if (params.title) {
            setBannerData({
              ...DUMMY_BANNER_DETAIL,
              title: params.title,
            });
          } else {
            setBannerData(DUMMY_BANNER_DETAIL);
          }
        } finally {
          setLoading(false);
        }
      } else if (params.title) {
        // Update title if provided via params
        setBannerData({
          ...DUMMY_BANNER_DETAIL,
          title: params.title,
        });
      }
    };
    loadBannerDetail();
  }, [fetchBannerDetail, params.bannerId, params.title]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigation.navigate('Search');
    }
  };

  const handleProductPress = (productId: string) => {
    if (onProductPress) {
      onProductPress(productId);
    } else {
      logger.info('Product pressed', { productId });
    }
  };

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

  const selectedProduct = bannerData.products.find((p) => p.id === selectedProductId);
  
  const getVariantsForProduct = (productId: string): Array<{ id: string; size: string }> => {
    const product = bannerData.products.find(p => p.id === productId);
    if (!product) return [];
    
    // Return variants for the product (same structure as getProductVariants but simplified)
    return [
      { id: `${productId}-500g`, size: '500 g' },
      { id: `${productId}-1kg`, size: '1 kg' },
      { id: `${productId}-2kg`, size: '2 kg' },
    ];
  };

  // Sync selected variants for all products when cart changes
  // This ensures product card shows quantity selector automatically when item is added from dropdown
  useEffect(() => {
    bannerData.products.forEach(product => {
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
  }, [cartItems, bannerData.products]);
  
  const getProductVariants = (): ProductVariant[] => {
    if (!selectedProduct) {
      // Return dummy variants if no product selected
      return [
        {
          id: '1',
          size: '500 g',
          image: require('../assets/images/product-image-1.png'),
          price: 126,
          originalPrice: 256,
          discount: '16% OFF',
          quantity: 0,
        },
        {
          id: '2',
          size: '1 kg',
          image: require('../assets/images/product-image-1.png'),
          price: 126,
          originalPrice: 256,
          discount: '16% OFF',
          quantity: 1, // In cart - shows quantity selector
        },
        {
          id: '3',
          size: '2 kg',
          image: require('../assets/images/product-image-1.png'),
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

  // Group products into rows of 2
  const productRows: BannerProduct[][] = [];
  for (let i = 0; i < bannerData.products.length; i += 2) {
    productRows.push(bannerData.products.slice(i, i + 2));
  }

  // Calculate responsive card width using responsive utilities
  const { width: screenWidth } = useDimensions();
  const containerPadding = getSpacing(16) * 2; // Left and right padding
  const columnGap = getSpacing(16); // Gap between cards (horizontal)
  const productCardWidth = (screenWidth - containerPadding - columnGap) / 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <BackIcon />
          </TouchableOpacity>

          {/* Title Container - Near Back Button */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{bannerData.title}</Text>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            activeOpacity={0.7}
          >
            <View style={styles.searchButtonIcon}>
              <SearchIcon />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner Image Container */}
          <View style={styles.bannerImageContainer}>
            <Image
              source={bannerData.bannerImage}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>

          {/* Product List Container */}
          <View style={styles.productListContainer}>
            {productRows.map((row, index) => (
              <React.Fragment key={`row-${index}`}>
                <View style={styles.productRow}>
                  {row.map((product) => (
                    <View
                      key={product.id}
                      style={[styles.productCardWrapper, { width: productCardWidth }]}
                    >
                      <BannerProductCard
                        product={product}
                        onQuantityPress={handleQuantityPress}
                        onAddPress={handleAddPress}
                        onCardPress={handleCardPress}
                        width={productCardWidth}
                        variants={getVariantsForProduct(product.id)}
                        selectedVariantId={productSelectedVariants[product.id]}
                      />
                    </View>
                  ))}
                  {/* Fill empty space if odd number of products in last row */}
                  {row.length === 1 && <View style={[styles.productCardWrapper, { width: productCardWidth }]} />}
                </View>
                {/* Why Moringa Section - After first 2 rows (4 products) */}
                {index === 1 && <WhyMoringaSection />}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>

        {/* Floating Cart Bar - 4px above bottom nav bar */}
        <FloatingCartBar onPress={() => navigation.navigate('Checkout')} hasBottomNav={false} />

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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28, // 1.4 * 20
    color: '#1A1A1A',
    textAlign: 'left',
  },
  searchButton: {
    width: 28,
    height: 28,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  searchButtonIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerImageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#EDEDED',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 226,
  },
  productListContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
    alignItems: 'center',
  },
  productRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  productCardWrapper: {
    // Width will be set dynamically via inline style
  },
});

