import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackNavigationProp, RootStackRouteProp } from '../types/navigation';
import BackIcon from '../components/icons/BackIcon';
import SearchIcon from '../components/icons/SearchIcon';
import Text from '../components/common/Text';
import SubCategoryItem from '../components/SubCategoryItem';
import CategoryBanner from '../components/CategoryBanner';
import ProductCard, { Product } from '../components/features/product/ProductCard';
import FloatingCartBar from '../components/features/cart/FloatingCartBar';
import ProductVariantModal, { ProductVariant } from '../components/features/product/ProductVariantModal';
import { useCart } from '../contexts/CartContext';
import { useDimensions, getSpacing, scale } from '../utils/responsive';
import { logger } from '@/utils/logger';
import categoryService, { type CategoryPayloadProduct } from '../services/category/categoryService';
import { handleHomeLink } from '../utils/navigation/linkHandler';
import { getApiErrorMessage } from '../services/api/types';

const PLACEHOLDER_IMAGE = require('../assets/images/product-image-1.png');

// Dummy static data - ready for API replacement
interface SubCategory {
  id: string;
  name: string;
  image: any;
}

interface BannerItem {
  id: string;
  image: any;
  link?: string | null;
}

// Dummy sub-categories data
const DUMMY_SUB_CATEGORIES: SubCategory[] = [
  { id: '1', name: 'Apples', image: require('../assets/images/product-image-1.png') },
  { id: '2', name: 'Bananas', image: require('../assets/images/product-image-2.png') },
  { id: '3', name: 'Oranges', image: require('../assets/images/product-image-3.png') },
  { id: '4', name: 'Grapes', image: require('../assets/images/product-image-4.png') },
  { id: '5', name: 'Mangoes', image: require('../assets/images/product-image-5.png') },
  { id: '6', name: 'Berries', image: require('../assets/images/product-image-1.png') },
];

// Dummy banner data - using exact image from Figma design
const DUMMY_BANNERS: BannerItem[] = [
  { id: '1', image: require('../assets/images/banners/category-banner-297a1c.png') },
  { id: '2', image: require('../assets/images/banners/category-banner-297a1c.png') },
  { id: '3', image: require('../assets/images/banners/category-banner-297a1c.png') },
];

// Dummy products data - organized by sub-category
const DUMMY_PRODUCTS: { [subCategoryId: string]: Product[] } = {
  '1': [
    {
      id: 'p1',
      name: 'Fresh Apples',
      image: require('../assets/images/product-image-1.png'),
      price: 48,
      originalPrice: 60,
      discount: '20% OFF',
      quantity: '500 g',
    },
    {
      id: 'p2',
      name: 'Red Apples',
      image: require('../assets/images/product-image-2.png'),
      price: 45,
      originalPrice: 55,
      discount: '18% OFF',
      quantity: '1 kg',
    },
    {
      id: 'p3',
      name: 'Green Apples',
      image: require('../assets/images/product-image-3.png'),
      price: 50,
      originalPrice: 65,
      discount: '23% OFF',
      quantity: '500 g',
    },
    {
      id: 'p4',
      name: 'Premium Apples',
      image: require('../assets/images/product-image-4.png'),
      price: 70,
      originalPrice: 90,
      discount: '22% OFF',
      quantity: '1 kg',
    },
  ],
  '2': [
    {
      id: 'p5',
      name: 'Fresh Bananas',
      image: require('../assets/images/product-image-2.png'),
      price: 48,
      originalPrice: 60,
      discount: '20% OFF',
      quantity: '500 g',
    },
    {
      id: 'p6',
      name: 'Organic Bananas',
      image: require('../assets/images/product-image-3.png'),
      price: 55,
      originalPrice: 70,
      discount: '21% OFF',
      quantity: '1 dozen',
    },
    {
      id: 'p7',
      name: 'Ripe Bananas',
      image: require('../assets/images/product-image-4.png'),
      price: 42,
      originalPrice: 55,
      discount: '24% OFF',
      quantity: '500 g',
    },
    {
      id: 'p8',
      name: 'Premium Bananas',
      image: require('../assets/images/product-image-5.png'),
      price: 60,
      originalPrice: 75,
      discount: '20% OFF',
      quantity: '1 kg',
    },
  ],
  '3': [
    {
      id: 'p9',
      name: 'Fresh Oranges',
      image: require('../assets/images/product-image-3.png'),
      price: 55,
      originalPrice: 70,
      discount: '21% OFF',
      quantity: '1 kg',
    },
    {
      id: 'p10',
      name: 'Sweet Oranges',
      image: require('../assets/images/product-image-4.png'),
      price: 60,
      originalPrice: 75,
      discount: '20% OFF',
      quantity: '500 g',
    },
  ],
  '4': [
    {
      id: 'p11',
      name: 'Fresh Grapes',
      image: require('../assets/images/product-image-4.png'),
      price: 80,
      originalPrice: 100,
      discount: '20% OFF',
      quantity: '500 g',
    },
    {
      id: 'p12',
      name: 'Seedless Grapes',
      image: require('../assets/images/product-image-5.png'),
      price: 90,
      originalPrice: 115,
      discount: '22% OFF',
      quantity: '500 g',
    },
  ],
  '5': [
    {
      id: 'p13',
      name: 'Fresh Mangoes',
      image: require('../assets/images/product-image-5.png'),
      price: 120,
      originalPrice: 150,
      discount: '20% OFF',
      quantity: '1 kg',
    },
  ],
  '6': [
    {
      id: 'p14',
      name: 'Fresh Berries',
      image: require('../assets/images/product-image-1.png'),
      price: 150,
      originalPrice: 200,
      discount: '25% OFF',
      quantity: '250 g',
    },
  ],
};

interface CategoryProductsScreenProps {
  categoryId?: string;
  categoryName?: string;
  fetchSubCategories?: () => Promise<SubCategory[]>;
  fetchBanners?: () => Promise<BannerItem[]>;
  fetchProducts?: (subCategoryId: string) => Promise<Product[]>;
  onProductPress?: (productId: string) => void;
  onQuantityPress?: (productId: string) => void;
  onAddPress?: (productId: string) => void;
  onSearchPress?: () => void;
}

export default function CategoryProductsScreen({
  categoryId,
  categoryName,
  fetchSubCategories,
  fetchBanners,
  fetchProducts,
  onProductPress,
  onQuantityPress,
  onAddPress,
  onSearchPress,
}: CategoryProductsScreenProps) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RootStackRouteProp<'CategoryProducts'>>();
  const params = route.params || {};
  // Responsive dimensions - using responsive utilities
  const { width: screenWidth } = useDimensions();
  const { cartItems } = useCart();

  // Use params if provided, otherwise use props. Avoid placeholder id so API isn't called with invalid id.
  const finalCategoryName = (params.categoryName as string) || categoryName || 'Category';
  const finalCategoryId = (params.categoryId as string) || categoryId || '';

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [apiProducts, setApiProducts] = useState<CategoryPayloadProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryDisplayName, setCategoryDisplayName] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const initialLoadDone = useRef(false);
  // Track selected variant for each product (for synchronization)
  const [productSelectedVariants, setProductSelectedVariants] = useState<Record<string, string>>({});

  const mapApiProductToProduct = useCallback((p: CategoryPayloadProduct): Product => ({
    id: p.id,
    name: p.name,
    image: p.images?.[0] ? { uri: p.images[0] } : PLACEHOLDER_IMAGE,
    price: p.price,
    originalPrice: p.originalPrice ?? p.price,
    discount: p.discount ?? '',
    quantity: p.quantity || (p.variants?.[0]?.size ?? ''),
  }), []);

  // Category API: load category payload when finalCategoryId is set (and not using fetch props)
  useEffect(() => {
    if (fetchSubCategories ?? fetchBanners ?? fetchProducts) {
      setLoading(false);
      return;
    }
    if (!finalCategoryId || finalCategoryId.trim() === '') {
      setLoading(false);
      setError('Select a category from Home to view products.');
      setCategoryDisplayName(null);
      setSubCategories([]);
      setBanners([]);
      setProducts([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    categoryService
      .getCategoryPayload(finalCategoryId)
      .then((res) => {
        if (cancelled || !res?.success || !res.data) return;
        const { category: _c, subcategories: sc, banners: b, products: pr } = res.data;
        if (_c?.name) setCategoryDisplayName(_c.name);
        setSubCategories(
          sc.map((s) => ({
            id: s.id,
            name: s.name,
            image: s.imageUrl ? { uri: s.imageUrl } : PLACEHOLDER_IMAGE,
          }))
        );
        setBanners(
          b.map((x) => ({
            id: x.id,
            image: x.imageUrl ? { uri: x.imageUrl } : PLACEHOLDER_IMAGE,
            link: x.link ?? null,
          }))
        );
        setApiProducts(pr);
        setProducts(pr.map(mapApiProductToProduct));
        setSelectedSubCategoryId(null);
        initialLoadDone.current = true;
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = getApiErrorMessage(err, 'Failed to load category');
          logger.error('Category payload failed', { message: msg, status: (err as { status?: number })?.status });
          setError(msg);
          setCategoryDisplayName(null);
          setSubCategories(DUMMY_SUB_CATEGORIES);
          setBanners(DUMMY_BANNERS);
          setSelectedSubCategoryId(DUMMY_SUB_CATEGORIES[0]?.id ?? null);
          setProducts(DUMMY_PRODUCTS[DUMMY_SUB_CATEGORIES[0]?.id ?? '1'] ?? []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [finalCategoryId, fetchSubCategories, fetchBanners, fetchProducts, mapApiProductToProduct]);

  // When user selects a subcategory, refetch products for that subcategory
  useEffect(() => {
    if (!initialLoadDone.current || selectedSubCategoryId === null) return;
    if (fetchProducts) return;
    let cancelled = false;
    setLoading(true);
    categoryService
      .getCategoryPayload(finalCategoryId, selectedSubCategoryId)
      .then((res) => {
        if (cancelled || !res?.success || !res.data) return;
        setApiProducts(res.data.products);
        setProducts(res.data.products.map(mapApiProductToProduct));
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = getApiErrorMessage(err, 'Failed to load products');
          logger.error('Category products by subcategory failed', { message: msg });
          setApiProducts([]);
          setProducts(DUMMY_PRODUCTS[selectedSubCategoryId] ?? []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [finalCategoryId, selectedSubCategoryId, fetchProducts, mapApiProductToProduct]);

  // Optional fetch props (override API when provided)
  useEffect(() => {
    if (fetchSubCategories) {
      const loadSubCategories = async () => {
        setLoading(true);
        try {
          const data = await fetchSubCategories();
          setSubCategories(data);
          if (data.length > 0) setSelectedSubCategoryId(data[0].id);
        } catch (err) {
          logger.error('Error fetching sub-categories', err);
          setSubCategories(DUMMY_SUB_CATEGORIES);
          setSelectedSubCategoryId(DUMMY_SUB_CATEGORIES[0]?.id ?? null);
        } finally {
          setLoading(false);
        }
      };
      loadSubCategories();
    }
  }, [fetchSubCategories]);

  useEffect(() => {
    if (fetchBanners) {
      const loadBanners = async () => {
        try {
          const data = await fetchBanners();
          setBanners(data);
        } catch (err) {
          logger.error('Error fetching banners', err);
          setBanners(DUMMY_BANNERS);
        }
      };
      loadBanners();
    }
  }, [fetchBanners]);

  useEffect(() => {
    if (fetchProducts) {
      const loadProducts = async () => {
        if (selectedSubCategoryId == null) return;
        setLoading(true);
        try {
          const data = await fetchProducts(selectedSubCategoryId);
          setProducts(data);
        } catch (err) {
          logger.error('Error fetching products', err);
          setProducts(DUMMY_PRODUCTS[selectedSubCategoryId] ?? []);
        } finally {
          setLoading(false);
        }
      };
      loadProducts();
    }
  }, [selectedSubCategoryId, fetchProducts]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSearch = useCallback(() => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigation.navigate('Search');
    }
  }, [navigation, onSearchPress]);

  const handleSubCategoryPress = useCallback((subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);
  }, []);

  const handleBannerPress = useCallback(
    (banner: BannerItem) => {
      if (banner.link) handleHomeLink(banner.link, navigation);
    },
    [navigation]
  );

  const handleQuantityPress = useCallback((productId: string) => {
    if (onQuantityPress) {
      onQuantityPress(productId);
    } else {
      logger.info('Quantity selector pressed for product', { productId });
    }
  }, [onQuantityPress]);

  const handleAddPress = useCallback((productId: string) => {
    if (onAddPress) {
      onAddPress(productId);
    } else {
      logger.info('Add to cart', { productId });
    }
  }, [onAddPress]);

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

  const handleAddToCart = (variantId: string) => {
    if (selectedProductId) {
      // Update selected variant when adding to cart (synchronization)
      setProductSelectedVariants(prev => ({
        ...prev,
        [selectedProductId]: variantId,
      }));
    }
  };
  
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

  const handleQuantityChange = (variantId: string, quantity: number) => {
    // Quantity change is handled by cart context
    // No need to update selected variant here
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  
  const getProductVariants = (): ProductVariant[] => {
    const dummyVariants: ProductVariant[] = [
      { id: '1', size: '500 g', image: require('../assets/images/product-image-1.png'), price: 126, originalPrice: 256, discount: '16% OFF', quantity: 0 },
      { id: '2', size: '1 kg', image: require('../assets/images/product-image-1.png'), price: 126, originalPrice: 256, discount: '16% OFF', quantity: 0 },
      { id: '3', size: '2 kg', image: require('../assets/images/product-image-1.png'), price: 126, originalPrice: 256, discount: '16% OFF', quantity: 0 },
    ];
    if (!selectedProduct) return dummyVariants;

    const apiProduct = apiProducts.find((p) => p.id === selectedProduct.id);
    if (apiProduct?.variants?.length) {
      return apiProduct.variants.map((v) => ({
        id: v.id,
        size: v.size,
        image: selectedProduct.image,
        price: v.price,
        originalPrice: v.originalPrice ?? v.price,
        discount: selectedProduct.discount,
        quantity: cartItems.find((item) => item.variantId === v.id)?.quantity ?? 0,
      }));
    }

    const variants: ProductVariant[] = [
      { id: `${selectedProduct.id}-500g`, size: '500 g', image: selectedProduct.image, price: selectedProduct.price, originalPrice: selectedProduct.originalPrice, discount: selectedProduct.discount, quantity: 0 },
      { id: `${selectedProduct.id}-1kg`, size: '1 kg', image: selectedProduct.image, price: selectedProduct.price * 2, originalPrice: selectedProduct.originalPrice * 2, discount: selectedProduct.discount, quantity: 0 },
      { id: `${selectedProduct.id}-2kg`, size: '2 kg', image: selectedProduct.image, price: selectedProduct.price * 4, originalPrice: selectedProduct.originalPrice * 4, discount: selectedProduct.discount, quantity: 0 },
    ];
    return variants.map((v) => ({
      ...v,
      quantity: cartItems.find((item) => item.variantId === v.id)?.quantity ?? 0,
    }));
  };
  
  // Get variants for a product (used in ProductCard) - use API variants when available
  const getVariantsForProduct = (productId: string): Array<{ id: string; size: string }> => {
    const apiProduct = apiProducts.find((p) => p.id === productId);
    if (apiProduct?.variants?.length) {
      return apiProduct.variants.map((v) => ({ id: v.id, size: v.size }));
    }
    return [
      { id: `${productId}-500g`, size: '500 g' },
      { id: `${productId}-1kg`, size: '1 kg' },
      { id: `${productId}-2kg`, size: '2 kg' },
    ];
  };

  const handleHomePress = () => {
    navigation.navigate('Home');
  };

  const handleShopPress = () => {
    navigation.navigate('Category');
  };

  const handleCartPress = () => {
    navigation.navigate('Checkout');
  };

  // Calculate product card width for 2-column grid (minimum 2 cards per row)
  const sidebarWidth = scale(72); // Sub-category sidebar width (maximum)
  const containerPadding = getSpacing(12) * 2; // Left and right padding (from productsContent - updated to 12px)
  const columnGap = getSpacing(16); // Column gap between cards (horizontal)
  // Calculate available width and ensure minimum 2 columns
  const availableWidth = screenWidth - sidebarWidth - containerPadding - columnGap;
  const productCardWidth = availableWidth / 2; // Always 2 columns minimum

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <BackIcon />
          </TouchableOpacity>

          {/* Title Container */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{categoryDisplayName ?? finalCategoryName}</Text>
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

        {/* Main Content Container */}
        <View style={styles.mainContent}>
          {/* Sub-Category Sidebar - starts from below header */}
          <View style={styles.sidebar}>
            <ScrollView
              style={styles.sidebarScroll}
              contentContainerStyle={styles.sidebarContent}
              showsVerticalScrollIndicator={false}
            >
              {subCategories.map((subCategory) => (
                <SubCategoryItem
                  key={subCategory.id}
                  id={subCategory.id}
                  name={subCategory.name}
                  image={subCategory.image}
                  isSelected={selectedSubCategoryId === subCategory.id}
                  onPress={handleSubCategoryPress}
                />
              ))}
            </ScrollView>
          </View>

          {/* Products Grid */}
          <View style={styles.productsContainer}>
            {loading && subCategories.length === 0 && !error ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2D5016" />
                <Text style={styles.loadingText}>Loading…</Text>
              </View>
            ) : error && subCategories.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
            <ScrollView
              style={styles.productsScroll}
              contentContainerStyle={[
                styles.productsContent,
                { paddingBottom: 80 }, // Add padding to prevent content from being hidden behind bottom nav
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* Scrollable Banner */}
              <CategoryBanner banners={banners} onBannerPress={handleBannerPress} />

              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#2D5016" />
                </View>
              ) : null}

              {/* Product Grid - 2 columns */}
              <View style={styles.productsGrid}>
                {products.map((product, index) => (
                  <View
                    key={product.id}
                    style={[
                      styles.productCardWrapper,
                      { width: productCardWidth },
                    ]}
                  >
                    <View style={styles.productCardInner}>
                      <ProductCard
                        product={product}
                        onQuantityPress={handleQuantityPress}
                        onAddPress={handleAddPress}
                        onCardPress={handleCardPress}
                        width={productCardWidth}
                        variants={getVariantsForProduct(product.id)}
                        selectedVariantId={productSelectedVariants[product.id]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            )}
          </View>
        </View>

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
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    width: 32,
    height: 32,
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
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  sidebar: {
    width: 72,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: 'rgba(209, 209, 209, 0.5)',
    paddingVertical: 0,
    gap: 4,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarContent: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    paddingBottom: 12,
    gap: 8,
  },
  productsContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  productsScroll: {
    flex: 1,
  },
  productsContent: {
    padding: 12,
    paddingTop: 16,
    gap: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16, // Column gap (horizontal) between cards
  },
  productCardWrapper: {
    marginBottom: 12, // Row gap (vertical) between cards
  },
  productCardInner: {
    width: '100%',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  loadingRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#B00020',
    textAlign: 'center',
  },
});

