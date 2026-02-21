import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Platform, ScrollView, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { RootStackNavigationProp } from '../types/navigation';
import BackIcon from '../components/icons/BackIcon';
import SearchIcon from '../components/icons/SearchIcon';
import Text from '../components/common/Text';
import BannerProductCard, { BannerProduct } from '../components/features/product/BannerProductCard';
import TinyTummiesCategoryCard, { TinyTummiesCategory } from '../components/TinyTummiesCategoryCard';
import ProductVariantModal, { ProductVariant } from '../components/features/product/ProductVariantModal';
import FloatingCartBar from '../components/features/cart/FloatingCartBar';
import DealsSection from '../components/sections/DealsSection';
import { logger } from '@/utils/logger';
import { useCart } from '../contexts/CartContext';
import { useDimensions, scale, scaleFont, getSpacing, getBorderRadius, wp } from '../utils/responsive';

// Dummy static data - ready for API replacement
interface TinyTimmiesData {
  id: string;
  title: string;
  bannerImage: ImageSourcePropType;
  categories: TinyTummiesCategory[];
  bedtimeBoosters: BannerProduct[];
  deals: BannerProduct[];
}

// Dummy categories data - using exact images from Figma
const DUMMY_CATEGORIES: TinyTummiesCategory[] = [
  {
    id: '1',
    title: 'Baby Essentials',
    subtitle: '0 to 2 year',
    backgroundColor: '#FAFAA7',
    textColor: '#0D0D0D',
    image: require('../assets/images/tiny-timmies/category-baby-essentials-exact.png'),
  },
  {
    id: '2',
    title: 'Toddler Treats',
    subtitle: '2 to 5 year',
    backgroundColor: '#AFE5FF',
    textColor: '#000000',
    image: require('../assets/images/tiny-timmies/category-toddler-treats-exact.png'),
  },
  {
    id: '3',
    title: 'Smart Snacking',
    subtitle: '5+ year',
    backgroundColor: '#C6FF9A',
    textColor: '#000000',
    image: require('../assets/images/tiny-timmies/category-smart-snacking-exact.png'),
  },
];

// Dummy products data for Bedtime Boosters
const DUMMY_BEDTIME_PRODUCTS: BannerProduct[] = [
  {
    id: 'bb1',
    name: 'Fresh Bananas',
    image: require('../assets/images/product-image-2.png'),
    price: 48,
    originalPrice: 60,
    discount: '20% OFF',
    quantity: '6 pieces',
  },
  {
    id: 'bb2',
    name: 'Fresh Bananas',
    image: require('../assets/images/product-image-2.png'),
    price: 48,
    originalPrice: 60,
    discount: '20% OFF',
    quantity: '6 pieces',
  },
  {
    id: 'bb3',
    name: 'Fresh Bananas',
    image: require('../assets/images/product-image-2.png'),
    price: 48,
    originalPrice: 60,
    discount: '20% OFF',
    quantity: '6 pieces',
  },
];

// Dummy products data for Deals
const DUMMY_DEALS: BannerProduct[] = [
  {
    id: 'd1',
    name: 'Fresh Bananas',
    image: require('../assets/images/product-image-2.png'),
    price: 48,
    originalPrice: 60,
    discount: '20% OFF',
    quantity: '6 pieces',
  },
  {
    id: 'd2',
    name: 'Fresh Bananas',
    image: require('../assets/images/product-image-2.png'),
    price: 48,
    originalPrice: 60,
    discount: '20% OFF',
    quantity: '6 pieces',
  },
  {
    id: 'd3',
    name: 'Fresh Bananas',
    image: require('../assets/images/product-image-2.png'),
    price: 48,
    originalPrice: 60,
    discount: '20% OFF',
    quantity: '6 pieces',
  },
];

// Dummy tiny-timmies data
const DUMMY_TINY_TIMMIES: TinyTimmiesData = {
  id: '1',
  title: 'Tiny Tummies',
  bannerImage: require('../assets/images/tiny-timmies/banner-image-new.png'),
  categories: DUMMY_CATEGORIES,
  bedtimeBoosters: DUMMY_BEDTIME_PRODUCTS,
  deals: DUMMY_DEALS,
};

interface TinyTimmiesScreenProps {
  fetchTinyTimmiesData?: () => Promise<TinyTimmiesData>;
  onProductPress?: (productId: string) => void;
  onQuantityPress?: (productId: string) => void;
  onAddPress?: (productId: string) => void;
  onSearchPress?: () => void;
  onCategoryPress?: (categoryId: string) => void;
}

export default function TinyTimmiesScreen({
  fetchTinyTimmiesData,
  onProductPress,
  onQuantityPress,
  onAddPress,
  onSearchPress,
  onCategoryPress,
}: TinyTimmiesScreenProps = {} as TinyTimmiesScreenProps) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { addToCart, updateQuantity, getItemQuantity, cartItems } = useCart();
  const [tinyTimmiesData, setTinyTimmiesData] = useState<TinyTimmiesData>(DUMMY_TINY_TIMMIES);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productSelectedVariants, setProductSelectedVariants] = useState<Record<string, string>>({});

  // Placeholder for API integration
  useEffect(() => {
    if (fetchTinyTimmiesData) {
      const loadData = async () => {
        setLoading(true);
        try {
          const data = await fetchTinyTimmiesData();
          setTinyTimmiesData(data);
        } catch (error) {
          logger.error('Error fetching tiny-timmies data', error);
          // Fallback to dummy data on error
          setTinyTimmiesData(DUMMY_TINY_TIMMIES);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [fetchTinyTimmiesData]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigation.navigate('Search');
    }
  }, [navigation, onSearchPress]);

  const handleProductPress = useCallback((productId: string) => {
    if (onProductPress) {
      onProductPress(productId);
    } else {
      navigation.navigate('ProductDetail', { productId });
    }
  }, [navigation, onProductPress]);

  const handleCardPress = useCallback((productId: string) => {
    // Open ProductVariantModal when dropdown is clicked
    setSelectedProductId(productId);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedProductId(null);
  }, []);

  const handleVariantSelect = useCallback((variantId: string) => {
    setProductSelectedVariants(prev => {
      if (selectedProductId) {
        return {
          ...prev,
          [selectedProductId]: variantId,
        };
      }
      return prev;
    });
  }, [selectedProductId]);

  const handleAddToCart = useCallback((variantId: string) => {
    setProductSelectedVariants(prev => {
      if (selectedProductId) {
        return {
          ...prev,
          [selectedProductId]: variantId,
        };
      }
      return prev;
    });
  }, [selectedProductId]);

  const handleQuantityChange = useCallback((variantId: string, quantity: number) => {
    // Quantity changes are handled by the modal itself through cart context
  }, []);

  const handleCategoryPress = useCallback((categoryId: string) => {
    if (onCategoryPress) {
      onCategoryPress(categoryId);
    } else {
      logger.info('Category pressed', { categoryId });
      // Navigate to category products page
    }
  }, [onCategoryPress]);

  const handleCheckoutPress = useCallback(() => {
    navigation.navigate('Checkout');
  }, [navigation]);

  // Get variants for a product
  const getVariantsForProduct = (productId: string): Array<{ id: string; size: string }> => {
    return [
      { id: `${productId}-500g`, size: '500 g' },
      { id: `${productId}-1kg`, size: '1 kg' },
      { id: `${productId}-2kg`, size: '2 kg' },
    ];
  };

  // Convert product to ProductVariant format for modal
  const getProductVariants = (): ProductVariant[] => {
    if (!selectedProductId) return [];
    
    // Find product in bedtime boosters or deals
    const product = [...tinyTimmiesData.bedtimeBoosters, ...tinyTimmiesData.deals].find(
      p => p.id === selectedProductId
    );
    if (!product) return [];

    return [
      {
        id: `${selectedProductId}-500g`,
        size: '500 g',
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        quantity: getItemQuantity(`${selectedProductId}-500g`),
      },
      {
        id: `${selectedProductId}-1kg`,
        size: '1 kg',
        image: product.image,
        price: product.price * 2,
        originalPrice: product.originalPrice * 2,
        discount: product.discount,
        quantity: getItemQuantity(`${selectedProductId}-1kg`),
      },
      {
        id: `${selectedProductId}-2kg`,
        size: '2 kg',
        image: product.image,
        price: product.price * 4,
        originalPrice: product.originalPrice * 4,
        discount: product.discount,
        quantity: getItemQuantity(`${selectedProductId}-2kg`),
      },
    ];
  };

  const selectedProduct = selectedProductId
    ? [...tinyTimmiesData.bedtimeBoosters, ...tinyTimmiesData.deals].find(
        p => p.id === selectedProductId
      )
    : null;

  // Sync selected variants from cart when modal opens
  useEffect(() => {
    if (modalVisible && selectedProductId) {
      // Find if any variant of this product is in cart
      const productVariants = getVariantsForProduct(selectedProductId);
      const variantInCart = productVariants.find(v => {
        const cartItem = cartItems.find(item => item.variantId === v.id);
        return cartItem && cartItem.quantity > 0;
      });

      if (variantInCart && !productSelectedVariants[selectedProductId]) {
        // Auto-select variant that's in cart
        setProductSelectedVariants(prev => ({
          ...prev,
          [selectedProductId]: variantInCart.id,
        }));
      }
    }
  }, [modalVisible, selectedProductId, cartItems]);

  // Sync selected variants for all products when cart changes
  useEffect(() => {
    [...tinyTimmiesData.bedtimeBoosters, ...tinyTimmiesData.deals].forEach(product => {
      const productVariants = getVariantsForProduct(product.id);
      const variantInCart = productVariants.find(v => {
        const cartItem = cartItems.find(item => item.variantId === v.id);
        return cartItem && cartItem.quantity > 0;
      });

      if (variantInCart && !productSelectedVariants[product.id]) {
        setProductSelectedVariants(prev => ({
          ...prev,
          [product.id]: variantInCart.id,
        }));
      }
    });
  }, [cartItems]);

  const { width: screenWidth } = useDimensions();
  
  // Responsive dimensions - memoized for performance
  const responsiveDimensions = useMemo(() => {
    // Product card width - responsive
    const cardWidth = scale(126.5);
    
    // Category cards layout - responsive calculation
    const containerPadding = getSpacing(16) * 2; // 16px on each side
    const gapBetweenCards = getSpacing(16);
    const availableWidth = screenWidth - containerPadding - gapBetweenCards;
    
    // Calculate responsive widths maintaining Figma proportions
    // Figma: First card 166px, Column 165.65px (total 331.65px)
    // Base design width is 375px, so scale factor is screenWidth / 375
    const baseDesignWidth = 375;
    const scaleFactor = screenWidth / baseDesignWidth;
    const figmaTotalWidth = 166 + 165.65; // 331.65px
    const figmaBaseWidth = figmaTotalWidth * scaleFactor;
    const figmaScaleFactor = availableWidth / figmaBaseWidth;
    
    const firstCardWidth = Math.max(166 * scaleFactor * figmaScaleFactor, scale(140)); // Minimum 140px
    const secondColumnWidth = Math.max(165.65 * scaleFactor * figmaScaleFactor, scale(140)); // Minimum 140px
    
    // Heights from Figma - responsive dimensions
    const firstCardHeight = 364.5 * scaleFactor * figmaScaleFactor; // First card: 166x364.5px from Figma
    const stackedCardHeight = 173.5 * scaleFactor * figmaScaleFactor; // Stacked cards: 165.65x173.5px each from Figma
    
    return {
      cardWidth,
      firstCardWidth,
      secondColumnWidth,
      firstCardHeight,
      stackedCardHeight,
    };
  }, [screenWidth]);
  
  const { cardWidth, firstCardWidth, secondColumnWidth, firstCardHeight, stackedCardHeight } = responsiveDimensions;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text variant="h3" style={styles.title}>
              {tinyTimmiesData.title}
            </Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
            <View style={styles.searchButtonContainer}>
              <SearchIcon width={scale(20)} height={scale(20)} />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner Image */}
          <View style={styles.bannerContainer}>
            <Image
              source={tinyTimmiesData.bannerImage}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>

          {/* Category Cards Section - Matching Figma layout exactly, responsive */}
          <View style={styles.categoriesContainer}>
            <View style={styles.categoriesRow}>
              {/* First Card - Baby Essentials (responsive width, taller height) */}
              {tinyTimmiesData.categories[0] && (
                <View style={{ width: firstCardWidth }}>
                  <TinyTummiesCategoryCard
                    category={tinyTimmiesData.categories[0]}
                    onPress={() => handleCategoryPress(tinyTimmiesData.categories[0]?.id || '')}
                    width={firstCardWidth}
                    height={firstCardHeight}
                  />
                </View>
              )}
              {/* Column with two stacked cards (responsive width, 18px gap) */}
              <View style={[styles.categoriesColumn, { width: secondColumnWidth }]}>
                {tinyTimmiesData.categories[1] && (
                  <TinyTummiesCategoryCard
                    category={tinyTimmiesData.categories[1]}
                    onPress={() => handleCategoryPress(tinyTimmiesData.categories[1]?.id || '')}
                    width={secondColumnWidth}
                    height={stackedCardHeight}
                  />
                )}
                {tinyTimmiesData.categories[2] && (
                  <TinyTummiesCategoryCard
                    category={tinyTimmiesData.categories[2]}
                    onPress={() => handleCategoryPress(tinyTimmiesData.categories[2]?.id || '')}
                    width={secondColumnWidth}
                    height={stackedCardHeight}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Bedtime Boosters Section - Exact Figma Design */}
          <View style={styles.bedtimeBoostersSection}>
            {/* Background Image - Full height background */}
            <View style={styles.bedtimeBoostersBackground}>
              <Image
                source={require('../assets/images/tiny-timmies/bedtime-boosters-section.png')}
                style={styles.bedtimeBoostersImage}
                resizeMode="cover"
              />
            </View>
            {/* Product Row - Horizontal Scrollable, positioned at y: 138 from Figma */}
            <View style={styles.bedtimeBoostersProductRowContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bedtimeBoostersProductRow}
              >
                {tinyTimmiesData.bedtimeBoosters.map((product) => (
                  <View key={product.id} style={[styles.productCardWrapper, { width: cardWidth }]}>
                    <BannerProductCard
                      product={product}
                      onCardPress={() => handleCardPress(product.id)}
                      width={cardWidth}
                      variants={getVariantsForProduct(product.id)}
                      selectedVariantId={productSelectedVariants[product.id]}
                      textColor="white"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Banner Section */}
          <View style={styles.bannerSectionContainer}>
            <Image
              source={require('../assets/images/tiny-timmies/banner-below-bedtime-boosters.png')}
              style={styles.bannerSectionImage}
              resizeMode="cover"
            />
          </View>

          {/* Deals Section */}
          <DealsSection />
        </ScrollView>

        {/* Floating Cart Bar */}
        <FloatingCartBar onPress={handleCheckoutPress} hasBottomNav={false} />

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
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(14),
    backgroundColor: '#FFFFFF',
    gap: getSpacing(8),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: '#0D0D0D',
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  searchButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  searchButtonContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(52),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scale(100),
  },
  bannerContainer: {
    width: '100%',
    height: scale(160),
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  categoriesContainer: {
    paddingHorizontal: getSpacing(16),
    paddingTop: getSpacing(20),
    paddingBottom: getSpacing(20),
    alignItems: 'center',
    width: '100%',
  },
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing(16),
    width: '100%',
    justifyContent: 'center',
  },
  categoriesColumn: {
    flexDirection: 'column',
    gap: getSpacing(18),
  },
  bedtimeBoostersSection: {
    width: '100%',
    height: scale(415), // Responsive height from Figma
    marginTop: getSpacing(10),
    marginBottom: getSpacing(10),
    position: 'relative',
  },
  bedtimeBoostersBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bedtimeBoostersImage: {
    width: '100%',
    height: '100%',
  },
  bedtimeBoostersProductRowContainer: {
    position: 'absolute',
    top: scale(138), // Responsive y position from Figma
    left: 0,
    right: 0,
    paddingHorizontal: getSpacing(16), // Responsive x position from Figma
  },
  bedtimeBoostersProductRow: {
    gap: getSpacing(16), // Responsive gap between product cards from Figma
    alignItems: 'center',
  },
  horizontalScrollContent: {
    paddingHorizontal: getSpacing(16),
    gap: getSpacing(16),
  },
  productCardWrapper: {
    marginRight: getSpacing(16),
  },
  bannerSectionContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: '100%',
    marginTop: getSpacing(16),
    marginBottom: getSpacing(16),
  },
  bannerSectionImage: {
    width: '100%',
    height: scale(272), // Responsive height from Figma
    borderRadius: getBorderRadius(8),
    overflow: 'hidden',
  },
});
