import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Platform, Text, ScrollView, Animated, NativeScrollEvent, NativeSyntheticEvent, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../types/navigation';
import TopSection from '../components/layout/TopSection';
import CategorySection from '../components/sections/CategorySection';
import Banner from '../components/Banner';
import DealsSection from '../components/sections/DealsSection';
import WellbeingSection from '../components/sections/WellbeingSection';
import GreensBanner from '../components/GreensBanner';
import SectionImage from '../components/SectionImage';
import LifestyleSection from '../components/sections/LifestyleSection';
import NewDealsSection from '../components/sections/NewDealsSection';
import FreshJuiceDealsSection from '../components/sections/FreshJuiceDealsSection';
import BannerSection from '../components/sections/BannerSection';
import OrganicTaglineSection from '../components/sections/OrganicTaglineSection';
import SupportCenterSection from '../components/sections/SupportCenterSection';
import FloatingCartBar from '../components/features/cart/FloatingCartBar';
import ErrorBoundary from '../components/common/ErrorBoundary';
import type { Product } from '../components/features/product/ProductCard';
import type { LifestyleItem } from '../components/LifestyleCard';
import { logger } from '@/utils/logger';
import { homeService } from '../services/home/homeService';
import { addressService } from '../services/address/addressService';
import { getApiErrorMessage } from '../services/api/types';

const PLACEHOLDER_IMAGE_URI = 'https://placehold.co/200x200?text=No+Image';
const LIFESTYLE_DEFAULT_POSITION = { x: 0, y: 34, width: 152, height: 111 };
const LIFESTYLE_DEFAULT_TITLE_POSITION = { x: 15, y: 12, width: 122 };

// Section keys for dynamic order (backend config.sectionOrder + sectionVisibility)
const DEFAULT_SECTION_ORDER = [
  'categories',
  'hero_banner',
  'deals',
  'wellbeing',
  'greens_banner',
  'section_image',
  'lifestyle',
  'new_deals',
  'mid_banner',
  'fresh_juice',
  'deals_2',
  'organic_tagline',
  'support_center',
] as const;
const VALID_SECTION_KEYS = new Set<string>(DEFAULT_SECTION_ORDER);
const MAX_SECTIONS = 20; // max sections for animation slots

function formatAddress(addr: { line1?: string; line2?: string; city?: string; state?: string; pincode?: string } | null | undefined): string {
  if (!addr) return '';
  const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '';
}

export default function HomeScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [videoLayout, setVideoLayout] = useState({ y: 0, height: 0 });
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  // Staggered animations for each section (length = MAX_SECTIONS)
  const sectionAnimations = useRef(
    Array.from({ length: MAX_SECTIONS }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
    }))
  ).current;
  const [homeData, setHomeData] = useState<any | null>(null);
  const [homeLoading, setHomeLoading] = useState(false);
  const [homeError, setHomeError] = useState<string | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<{ line1: string; line2?: string; city: string; state?: string; pincode?: string } | null>(null);

  // Optional: fetch default address when user is logged in (home payload may also include defaultAddress when auth'd)
  useEffect(() => {
    let mounted = true;
    const loadDefaultAddress = async () => {
      try {
        const res = await addressService.getDefault();
        if (mounted && res?.success && res.data) {
          setDefaultAddress(res.data);
        }
      } catch {
        // 401 or network: ignore; homeData.defaultAddress may still be used
      }
    };
    loadDefaultAddress();
    return () => {
      mounted = false;
    };
  }, []);

  // Derive UI props from homeData and defaultAddress (single source of truth)
  const {
    formattedAddress,
    categorySectionTitle,
    mappedCategories,
    heroBanners,
    midBanners,
    promoGreensBanner,
    promoSectionImage,
    organicTagline,
      organicIconUrl,
      dealsSectionTitle,
      newDealsSectionTitle,
      freshJuiceSectionTitle,
      orderedSectionKeys,
      fetchDealsProducts,
    fetchWellbeingProducts,
    fetchNewDealsProducts,
    fetchFreshJuiceProducts,
    fetchLifestyleItems,
  } = useMemo(() => {
    const addr = defaultAddress ?? homeData?.defaultAddress ?? null;
    const formattedAddress = formatAddress(addr);
    const categorySectionTitle = homeData?.config?.categorySectionTitle ?? 'Grocery & Kitchen';
    const organicTagline = homeData?.config?.organicTagline ?? undefined;
    const organicIconUrl = homeData?.config?.organicIconUrl ?? undefined;
    const dealsSectionTitle = homeData?.sections?.deals?.title ?? undefined;
    const newDealsSectionTitle = homeData?.sections?.new_deals?.title ?? undefined;
    const freshJuiceSectionTitle = homeData?.sections?.fresh_juice?.title ?? undefined;
    // Dynamic section order: config.sectionOrder (array of keys) + config.sectionVisibility (hide when false)
    const configOrder = homeData?.config?.sectionOrder;
    const visibility = homeData?.config?.sectionVisibility ?? {};
    const orderedSectionKeys: string[] =
      Array.isArray(configOrder) && configOrder.length > 0
        ? [
            ...configOrder.filter((k: string) => VALID_SECTION_KEYS.has(k)),
            ...DEFAULT_SECTION_ORDER.filter((k) => !configOrder.includes(k)),
          ]
        : [...DEFAULT_SECTION_ORDER];
    const orderedSectionKeysFiltered = orderedSectionKeys.filter(
      (key) => visibility[key] !== false
    );
    const rawCategories = homeData?.categories ?? [];
    const mappedCategories =
      rawCategories.length > 0
        ? rawCategories.map((c: any) => ({
            id: String(c._id ?? c.id),
            name: c.name ?? '',
            image: { uri: c.imageUrl || PLACEHOLDER_IMAGE_URI },
            link: c.link ?? undefined,
          }))
        : undefined;
    const heroBanners = homeData?.heroBanners?.length > 0 ? homeData.heroBanners : undefined;
    const midBanners = homeData?.midBanners?.length > 0 ? homeData.midBanners : undefined;
    const greens = homeData?.promoBlocks?.greens_banner;
    const promoGreensBanner =
      greens?.imageUrl != null ? { uri: greens.imageUrl, link: greens.link } : undefined;
    const sectionImg = homeData?.promoBlocks?.section_image;
    const promoSectionImage =
      sectionImg?.imageUrl != null ? { uri: sectionImg.imageUrl, link: sectionImg.link } : undefined;

    const mapProducts = (products: any[]): Product[] =>
      (products ?? []).map((p: any) => ({
        id: String(p._id ?? p.id),
        name: p.name ?? '',
        image: { uri: p.images?.[0] || PLACEHOLDER_IMAGE_URI },
        price: typeof p.price === 'number' ? p.price : 0,
        originalPrice: typeof p.originalPrice === 'number' ? p.originalPrice : p.price ?? 0,
        discount: p.discount ?? '',
        quantity: p.quantity ?? '',
      }));

    const fetchDealsProducts =
      homeData?.sections?.deals?.products != null
        ? async () => mapProducts(homeData.sections.deals.products)
        : undefined;
    const fetchWellbeingProducts =
      homeData?.sections?.wellbeing?.products != null
        ? async () => mapProducts(homeData.sections.wellbeing.products)
        : undefined;
    const fetchNewDealsProducts =
      homeData?.sections?.new_deals?.products != null
        ? async () => mapProducts(homeData.sections.new_deals.products)
        : undefined;
    const fetchFreshJuiceProducts =
      homeData?.sections?.fresh_juice?.products != null
        ? async () => mapProducts(homeData.sections.fresh_juice.products)
        : undefined;

    const rawLifestyle = homeData?.lifestyle ?? [];
    const fetchLifestyleItems =
      rawLifestyle.length > 0
        ? async (): Promise<LifestyleItem[]> =>
            rawLifestyle.map((item: any, idx: number) => ({
              id: String(item._id ?? item.id ?? idx),
              title: item.name ?? '',
              image: { uri: item.imageUrl || PLACEHOLDER_IMAGE_URI },
              imagePosition: LIFESTYLE_DEFAULT_POSITION,
              titlePosition: LIFESTYLE_DEFAULT_TITLE_POSITION,
              link: item.link ?? undefined,
            }))
        : undefined;

    return {
      formattedAddress,
      categorySectionTitle,
      mappedCategories,
      heroBanners,
      midBanners,
      promoGreensBanner,
      promoSectionImage,
      organicTagline,
      organicIconUrl,
      dealsSectionTitle,
      newDealsSectionTitle,
      freshJuiceSectionTitle,
      orderedSectionKeys: orderedSectionKeysFiltered,
      fetchDealsProducts,
      fetchWellbeingProducts,
      fetchNewDealsProducts,
      fetchFreshJuiceProducts,
      fetchLifestyleItems,
    };
  }, [homeData, defaultAddress]);

  // Animate sections when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Screen is focused
      setIsScreenFocused(true);
      
      // Reset all animation values
      sectionAnimations.forEach((anim) => {
        anim.opacity.setValue(0);
        anim.translateY.setValue(30);
      });

      // Animate all sections with staggered delays
      const animations = sectionAnimations.map((anim, index) => {
        return Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 500,
            delay: index * 80, // 80ms delay between sections
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: 0,
            duration: 500,
            delay: index * 80,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel(animations).start();

      // Cleanup when screen loses focus
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  const handleProfilePress = () => {
    navigation.navigate('Settings');
  };

  const handleLocationPress = () => {
    logger.info('Location selector pressed');
    // Handle location selection
  };

  const handleVideoLayout = (layout: { y: number; height: number }) => {
    setVideoLayout(layout);
    // Video is initially visible when layout is measured (at top of screen)
    if (layout.y === 0 || layout.y < 100) {
      setIsVideoVisible(true);
    }
  };

  // Load home payload from backend
  useEffect(() => {
    let mounted = true;
    const loadHome = async () => {
      setHomeLoading(true);
      try {
        const resp = await homeService.getHomePayload();
        if (mounted && resp && resp.success) {
          setHomeData(resp.data);
        } else if (mounted) {
          setHomeError('Failed to load home data');
        }
      } catch (err) {
        const msg = getApiErrorMessage(err, 'Failed to load home data');
        logger.error('Home payload failed', { message: msg });
        if (mounted) setHomeError(msg);
      } finally {
        if (mounted) setHomeLoading(false);
      }
    };
    loadHome();
    return () => {
      mounted = false;
    };
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const screenHeight = event.nativeEvent.layoutMeasurement.height;
    
    // Only calculate visibility if video layout is known
    if (videoLayout.height === 0) {
      return;
    }
    
    // Calculate if video is visible
    const videoTop = videoLayout.y;
    const videoBottom = videoLayout.y + videoLayout.height;
    const visibleTop = scrollY;
    const visibleBottom = scrollY + screenHeight;
    
    // Video is visible if any part of it is in the viewport
    const isVisible = videoBottom > visibleTop && videoTop < visibleBottom;
    setIsVideoVisible(isVisible);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.animatedContainer}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Top Section with Input, Location, Profile and Video */}
            <ErrorBoundary
              fallback={
                <View style={{ padding: 16, backgroundColor: '#FFFFFF', minHeight: 200 }}>
                  <Text style={{ color: '#666', textAlign: 'center' }}>Top section unavailable</Text>
                </View>
              }
            >
              <TopSection
                deliveryType={homeData?.config?.deliveryTypeLabel ?? 'Delivery to Home'}
                address={formattedAddress}
                searchPlaceholder={homeData?.config?.searchPlaceholder ?? 'Search for "Dal" '}
                heroVideoUrl={homeData?.config?.heroVideoUrl ?? undefined}
                onLocationPress={handleLocationPress}
                onProfilePress={handleProfilePress}
                onLayout={handleVideoLayout}
                isVisible={isVideoVisible}
                isScreenFocused={isScreenFocused}
              />
            </ErrorBoundary>

          {/* Empty state when API returned but DB was not seeded (no config / no categories) */}
          {!homeLoading && homeData && !homeData?.config && (homeData?.categories?.length ?? 0) === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No home content yet. Seed the backend database so categories and sections appear.
              </Text>
              <Text style={styles.emptyStateHint}>
                In the backend repo run: npm run seed:customer-home
              </Text>
            </View>
          )}

          {/* Sections in dynamic order (config.sectionOrder + sectionVisibility) */}
          {orderedSectionKeys.map((sectionKey, index) => {
            const fallback = (
              <View style={{ padding: 16, backgroundColor: '#FFFFFF', minHeight: 100 }}>
                <Text style={{ color: '#666', textAlign: 'center' }}>Section unavailable</Text>
              </View>
            );
            let content: React.ReactNode = null;
            switch (sectionKey) {
              case 'categories':
                content = <CategorySection title={categorySectionTitle} categories={mappedCategories} />;
                break;
              case 'hero_banner':
                content = <Banner banners={heroBanners ?? undefined} />;
                break;
              case 'deals':
              case 'deals_2':
                content = <DealsSection title={dealsSectionTitle} fetchProducts={fetchDealsProducts} />;
                break;
              case 'wellbeing':
                content = <WellbeingSection fetchProducts={fetchWellbeingProducts as any} />;
                break;
              case 'greens_banner':
                content = <GreensBanner image={promoGreensBanner} onPress={undefined} />;
                break;
              case 'section_image':
                content = <SectionImage image={promoSectionImage} />;
                break;
              case 'lifestyle':
                content = <LifestyleSection fetchItems={fetchLifestyleItems} />;
                break;
              case 'new_deals':
                content = <NewDealsSection title={newDealsSectionTitle} fetchProducts={fetchNewDealsProducts} />;
                break;
              case 'mid_banner':
                content = <BannerSection banners={midBanners ?? undefined} />;
                break;
              case 'fresh_juice':
                content = <FreshJuiceDealsSection title={freshJuiceSectionTitle} fetchProducts={fetchFreshJuiceProducts} />;
                break;
              case 'organic_tagline':
                content = <OrganicTaglineSection tagline={organicTagline} icon={organicIconUrl ? { uri: organicIconUrl } : undefined} />;
                break;
              case 'support_center':
                content = <SupportCenterSection />;
                break;
              default:
                break;
            }
            if (content == null) return null;
            return (
              <Animated.View
                key={sectionKey}
                style={{
                  opacity: sectionAnimations[index].opacity,
                  transform: [{ translateY: sectionAnimations[index].translateY }],
                }}
              >
                <ErrorBoundary fallback={fallback}>{content}</ErrorBoundary>
              </Animated.View>
            );
          })}
          </ScrollView>
        </View>

        {/* Floating Cart Bar - positioned right above bottom navigation bar */}
        <ErrorBoundary
          fallback={null} // Don't show error UI for cart bar, just fail silently
        >
          <FloatingCartBar onPress={() => navigation.navigate('Cart')} hasBottomNav={true} />
        </ErrorBoundary>
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
  animatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20, // Reduced padding to prevent excessive space at bottom
  },
  emptyState: {
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});
