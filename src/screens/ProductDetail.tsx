import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackNavigationProp, RootStackRouteProp } from '../types/navigation';
import BackIcon from '../components/icons/BackIcon';
import SearchIcon from '../components/icons/SearchIcon';
import Text from '../components/common/Text';
import { logger } from '@/utils/logger';
import RupeeIcon from '../components/icons/RupeeIcon';
import PlusIcon from '../components/icons/PlusIcon';
import MinusIcon from '../components/icons/MinusIcon';
import DropdownArrowIcon from '../components/icons/DropdownArrowIcon';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import ProductCard, { Product } from '../components/features/product/ProductCard';
import ProductVariantModal, { ProductVariant } from '../components/features/product/ProductVariantModal';
import FloatingCartBar from '../components/features/cart/FloatingCartBar';
import { useCart } from '../contexts/CartContext';
import * as productService from '../services/products/productService';
import { getApiErrorMessage } from '../services/api/types';

// Dummy static data - ready for API replacement
interface ProductDetail {
  id: string;
  name: string;
  images: ImageSourcePropType[]; // Changed to array for multiple images
  price: number;
  originalPrice: number;
  discount: string;
  description: string;
  variants: Array<{ id: string; size: string; price: number; originalPrice: number }>;
}

interface SimilarProduct extends Product {
  quantity: string;
}

// Dummy product detail data
const DUMMY_PRODUCT_DETAIL: ProductDetail = {
  id: '1',
  name: 'Shimla Apple',
  images: [
    require('../assets/images/product-image-1.png'),
    require('../assets/images/product-image-2.png'),
    require('../assets/images/product-image-3.png'),
  ], // Multiple images for carousel
  price: 126,
  originalPrice: 256,
  discount: '16% OFF',
  description: `About - Tomatoes are a yummy fruit used in cooking purposes and foods like salads, sauces, and sandwiches.

Health Benefits - It improves immunity and aids in good metabolism.

Nutrition - It is rich in nutrients such as vitamin C, vitamin K, potassium, folate, and antioxidants.

Origin of Place - It is procured from the farms of India.`,
  variants: [
    { id: '1', size: '500 g', price: 126, originalPrice: 256 },
    { id: '2', size: '1 kg', price: 240, originalPrice: 480 },
    { id: '3', size: '2 kg', price: 450, originalPrice: 900 },
  ],
};

// Dummy similar products data
const DUMMY_SIMILAR_PRODUCTS: SimilarProduct[] = [
  {
    id: '2',
    name: 'Fresh Bananas',
    image: require('../assets/images/product-image-2.png'),
    price: 48,
    originalPrice: 60,
    discount: '20% OFF',
    quantity: '6 pieces',
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
];

interface ProductDetailScreenProps {
  productId?: string;
  fetchProductDetail?: (productId: string) => Promise<ProductDetail>;
  fetchSimilarProducts?: (productId: string) => Promise<SimilarProduct[]>;
}

export default function ProductDetailScreen({
  productId: propProductId,
  fetchProductDetail,
  fetchSimilarProducts,
}: ProductDetailScreenProps = {} as ProductDetailScreenProps) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RootStackRouteProp<'ProductDetail'>>();
  const routeParams = route.params || {};
  const { addToCart, updateQuantity, getItemQuantity, cartItems } = useCart();

  // Get productId from props, params, or use default
  const productId = propProductId || routeParams.productId || DUMMY_PRODUCT_DETAIL.id;

  // State management
  const [productDetail, setProductDetail] = useState<ProductDetail>(DUMMY_PRODUCT_DETAIL);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>(DUMMY_SIMILAR_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    DUMMY_PRODUCT_DETAIL.variants[0]?.id || ''
  );
  const [isProductInfoExpanded, setIsProductInfoExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  // Ref to track variants being added to prevent flicker
  const addingVariants = React.useRef<Set<string>>(new Set());

  // Placeholder for API integration
  useEffect(() => {
    const loadProductDetail = async () => {
      setLoading(true);
      try {
        if (fetchProductDetail) {
          const data = await fetchProductDetail(productId);
          setProductDetail(data);
          setSelectedVariantId(data.variants[0]?.id || '');
        } else if (productId) {
          // default behavior: call productService to fetch details
          const resp = await productService.getProductDetail(productId);
          if (resp && resp.success && resp.data) {
            const data = resp.data as ProductDetail;
            setProductDetail(data);
            setSelectedVariantId(data.variants[0]?.id || '');
          } else {
            setProductDetail(DUMMY_PRODUCT_DETAIL);
          }
        } else {
          setProductDetail(DUMMY_PRODUCT_DETAIL);
        }
      } catch (err) {
        const msg = getApiErrorMessage(err, 'Failed to load product');
        logger.error('Product detail failed', { message: msg });
        setProductDetail(DUMMY_PRODUCT_DETAIL);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetail();
  }, [productId, fetchProductDetail]);

  useEffect(() => {
    const loadSimilarProducts = async () => {
      if (fetchSimilarProducts) {
        try {
          const data = await fetchSimilarProducts(productId);
          setSimilarProducts(data);
        } catch (err) {
          const msg = getApiErrorMessage(err, 'Failed to load similar products');
          logger.error('Similar products failed', { message: msg });
          setSimilarProducts(DUMMY_SIMILAR_PRODUCTS);
        }
      }
    };

    loadSimilarProducts();
  }, [productId, fetchSimilarProducts]);

  // Get selected variant
  const selectedVariant = productDetail.variants.find((v) => v.id === selectedVariantId) || productDetail.variants[0];
  const variantPrice = selectedVariant?.price || productDetail.price;
  const variantOriginalPrice = selectedVariant?.originalPrice || productDetail.originalPrice;

  // Get quantity from cart for the selected variant
  const rawCartQuantity = selectedVariantId ? getItemQuantity(selectedVariantId) : 0;
  const cartQuantity = (selectedVariantId && addingVariants.current.has(selectedVariantId) && rawCartQuantity === 2)
    ? 1
    : rawCartQuantity;
  const hasQuantity = cartQuantity > 0;

  // Navigation handlers
  const handleBack = () => {
    navigation.goBack();
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  // Variant selection handler (used by both page and modal)
  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
  };

  // Add to cart handler (for Add button on page)
  const handleAddToCart = () => {
    if (selectedVariantId && selectedVariant) {
      const currentQuantity = getItemQuantity(selectedVariantId);
      const itemExistsInCart = cartItems.some((item) => item.variantId === selectedVariantId);

      // Mark variant as being added to prevent flicker
      addingVariants.current.add(selectedVariantId);

      if (!itemExistsInCart && currentQuantity === 0) {
          addToCart({
          variantId: selectedVariantId,
          productId: productDetail.id,
          productName: productDetail.name,
          variantSize: selectedVariant.size,
          image: currentImage,
          price: variantPrice,
          originalPrice: variantOriginalPrice,
          discount: productDetail.discount,
        });

        setTimeout(() => {
          updateQuantity(selectedVariantId, 1);
          setTimeout(() => {
            addingVariants.current.delete(selectedVariantId);
          }, 100);
        }, 0);
      } else {
        updateQuantity(selectedVariantId, 1);
        setTimeout(() => {
          addingVariants.current.delete(selectedVariantId);
        }, 100);
      }
    }
  };

  // Quantity change handlers
  const handleDecrease = () => {
    if (selectedVariantId && cartQuantity > 0) {
      const newQuantity = cartQuantity - 1;
      updateQuantity(selectedVariantId, newQuantity);
    }
  };

  const handleIncrease = () => {
    if (selectedVariantId && cartQuantity >= 0) {
      const newQuantity = cartQuantity + 1;
      updateQuantity(selectedVariantId, newQuantity);
    }
  };

  // Toggle product information
  const toggleProductInfo = () => {
    setIsProductInfoExpanded(!isProductInfoExpanded);
  };

  // Handle image scroll to update current index
  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const { width: screenWidth } = Dimensions.get('window');
    const index = Math.round(scrollPosition / screenWidth);
    setCurrentImageIndex(index);
  };

  // Get current image for cart (use first image)
  const currentImage = productDetail.images[0] || productDetail.images[currentImageIndex];

  // Generate variants for ProductCard
  const getVariantsForProduct = (productId: string): Array<{ id: string; size: string }> => {
    return [
      { id: `${productId}-500g`, size: '500 g' },
      { id: `${productId}-1kg`, size: '1 kg' },
      { id: `${productId}-2kg`, size: '2 kg' },
    ];
  };

  // Convert productDetail variants to ProductVariant format for modal
  const getProductVariants = (): ProductVariant[] => {
    return productDetail.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      image: productDetail.images[0] || require('../assets/images/product-image-1.png'),
      price: variant.price,
      originalPrice: variant.originalPrice,
      discount: productDetail.discount,
      quantity: getItemQuantity(variant.id),
    }));
  };

  // Handle dropdown click to open modal
  const handleDropdownPress = () => {
    setModalVisible(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // Handle variant select from modal
  const handleModalVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
  };

  // Handle add to cart from modal
  const handleModalAddToCart = (variantId: string) => {
    const variant = productDetail.variants.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariantId(variantId);
    }
  };

  // Handle quantity change from modal
  const handleModalQuantityChange = (variantId: string, quantity: number) => {
    // Quantity changes are handled by the modal itself through cart context
    // This is just for synchronization if needed
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          <TouchableOpacity style={styles.searchButton}>
            <SearchIcon width={20} height={20} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Product Images Carousel */}
          <View style={styles.productImageContainer}>
            <FlatList
              data={productDetail.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `image-${index}`}
              onScroll={handleImageScroll}
              scrollEventThrottle={16}
              renderItem={({ item }: { item: ImageSourcePropType }) => (
                <View style={styles.imageWrapper}>
                  <Image source={item} style={styles.productImage} resizeMode="cover" />
                </View>
              )}
            />
            {/* Dot Indicators - Only show if more than 1 image */}
            {productDetail.images.length > 1 && (
              <View style={styles.dotContainer}>
                {productDetail.images.map((_, index) => (
                  <View
                    key={`dot-${index}`}
                    style={[
                      styles.dot,
                      index === currentImageIndex ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Product Info Card */}
          <View style={styles.productInfoCard}>
            {/* Product Name and Price */}
            <View style={styles.productHeader}>
              <View style={styles.priceContainer}>
                <View style={styles.discountAndPriceContainer}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{productDetail.discount}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <View style={styles.currentPriceContainer}>
                      <RupeeIcon size={11} color="#222222" />
                      <Text style={styles.currentPrice}>{variantPrice}</Text>
                    </View>
                    <View style={styles.originalPriceContainer}>
                      <View style={styles.originalPriceRow}>
                        <RupeeIcon size={8} color="#777777" />
                        <Text style={styles.originalPrice}>{variantOriginalPrice}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Size Selector and Add Button */}
            <View style={styles.actionContainer}>
              {/* Size Selector */}
              <TouchableOpacity style={styles.sizeSelector} onPress={handleDropdownPress}>
                <Text style={styles.sizeText}>{selectedVariant?.size || '500 g'}</Text>
                <View style={styles.dropdownIconWrapper}>
                  <DropdownArrowIcon />
                </View>
              </TouchableOpacity>

              {/* Add/Quantity Button */}
              {!hasQuantity ? (
                <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.quantityContainer}>
                  <TouchableOpacity style={styles.quantityButton} onPress={handleDecrease}>
                    <MinusIcon width={16} height={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.quantityTextContainer}>
                    <Text style={styles.quantityText}>{cartQuantity}</Text>
                  </View>
                  <TouchableOpacity style={styles.quantityButton} onPress={handleIncrease}>
                    <PlusIcon width={16} height={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Product Information Section */}
          <View style={styles.productInformationCard}>
            <View style={styles.productInfoHeaderContainer}>
              <TouchableOpacity style={styles.productInfoHeader} onPress={toggleProductInfo}>
                <Text style={styles.productInfoTitle}>Product Information</Text>
                <ChevronDownIcon width={20} height={20} color="#4C4C4C" />
              </TouchableOpacity>
            </View>
            {isProductInfoExpanded && (
              <View style={styles.productInfoContent}>
                <Text style={styles.productDescription}>{productDetail.description}</Text>
              </View>
            )}
          </View>

          {/* Similar Products Section */}
          <View style={styles.similarProductsCard}>
            <View style={styles.similarProductsHeader}>
              <Text style={styles.similarProductsTitle}>Similar products</Text>
              <View style={styles.dividerLine} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarProductsScroll}>
              {similarProducts.map((product) => (
                <View key={product.id} style={styles.similarProductCard}>
                  <ProductCard
                    product={product}
                    onCardPress={() => handleProductPress(product.id)}
                    variants={getVariantsForProduct(product.id)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Floating Cart Bar */}
        <FloatingCartBar onPress={() => navigation.navigate('Checkout')} hasBottomNav={false} />

        {/* Product Variant Modal */}
        <ProductVariantModal
          visible={modalVisible}
          productName={productDetail.name}
          productId={productDetail.id}
          variants={getProductVariants()}
          onClose={handleCloseModal}
          onVariantSelect={handleVariantSelect}
          onAddToCart={handleModalAddToCart}
          onQuantityChange={handleModalQuantityChange}
        />
      </SafeAreaView>
    </View>
  );
}

// Calculate screen width for dynamic styles
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  productImageContainer: {
    width: '100%',
    height: 272,
    backgroundColor: '#EDEDED',
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    height: 272,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  dotContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#2C512C',
  },
  inactiveDot: {
    backgroundColor: '#FFFFFF',
  },
  productInfoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#F4F4F4',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    gap: 16,
    alignSelf: 'stretch',
  },
  productHeader: {
    gap: 8,
    alignSelf: 'stretch',
  },
  priceContainer: {
    gap: 16,
    alignSelf: 'stretch',
  },
  discountAndPriceContainer: {
    flexDirection: 'column',
    gap: 16,
    alignSelf: 'stretch',
  },
  discountBadge: {
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18, // 1.5em * 12
    color: '#FA7500',
    fontFamily: 'Inter',
    textAlign: 'left',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  currentPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 24, // 1.2em * 20
    color: '#222222',
    fontFamily: 'Inter',
  },
  originalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  originalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.94, // 1.2102272851126534em * 14
    color: '#777777',
    fontFamily: 'Inter',
    textAlign: 'left',
    textDecorationLine: 'line-through',
    textDecorationColor: '#777777',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'stretch',
    alignSelf: 'stretch',
  },
  sizeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#D7F1D7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    flex: 1,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20, // 1.4285714285714286em * 14
    color: '#1A1A1A',
    fontFamily: 'Inter',
  },
  dropdownIconWrapper: {
    width: 14,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 127,
    height: 40,
    backgroundColor: '#3F723F',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#012D01',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20, // 1.4285714285714286em * 14
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  quantityContainer: {
    width: 127,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3F723F',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#012D01',
    paddingHorizontal: 12,
    gap: 20,
  },
  quantityButton: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0,
  },
  quantityTextContainer: {
    flex: 0,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  productInformationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#F4F4F4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
    alignSelf: 'stretch',
  },
  productInfoHeaderContainer: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    gap: 8,
    width: '100%',
  },
  productInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  productInfoTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24, // 1.5em * 16
    color: '#4C4C4C',
    fontFamily: 'Inter',
    textAlign: 'left',
    includeFontPadding: false,
  },
  productInfoContent: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 10,
  },
  productDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 24, // 1.7142857142857142em * 14
    color: '#4E4E4E',
    fontFamily: 'Inter',
    textAlign: 'left',
    includeFontPadding: false,
  },
  similarProductsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
  },
  similarProductsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  similarProductsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    fontFamily: 'Inter',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  similarProductsScroll: {
    gap: 16,
    paddingRight: 16,
  },
  similarProductCard: {
    width: 126.5,
  },
});

