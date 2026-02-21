import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Image, ImageSourcePropType, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../types/navigation';
import { getWindowDimensions } from '../utils/responsive';
import { logger } from '@/utils/logger';
import handleHomeLink from '../utils/navigation/linkHandler';

interface BannerProps {
  banners?: ImageSourcePropType[];
  image?: ImageSourcePropType;
  onPress?: (index: number) => void;
  fetchBannerData?: () => Promise<ImageSourcePropType[]>;
}

export default function Banner({
  banners,
  image,
  onPress,
  fetchBannerData,
}: BannerProps) {
  const navigation = useNavigation<RootStackNavigationProp>();
  // If single image is provided, convert to array; otherwise use banners from API (no fallback)
  const initialBanners = image ? [image] : (banners ?? []);
  
  const [bannerImages, setBannerImages] = useState<ImageSourcePropType[]>(initialBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Gap between banner cards
  const cardGap = 12;
  
  // Responsive banner width - account for container padding and gap between cards
  const bannerWidth = useMemo(() => {
    const screenWidth = getWindowDimensions().width;
    const containerPadding = 12 * 2; // 12px padding on each side
    return screenWidth - containerPadding - cardGap; // Account for gap
  }, []);

  // Sync when banners prop updates (e.g. from home payload)
  useEffect(() => {
    if (fetchBannerData) {
      const loadBanners = async () => {
        setLoading(true);
        try {
          const data = await fetchBannerData();
          setBannerImages(data);
        } catch (error) {
          logger.error('Error fetching banner data', error);
          setBannerImages([]);
        } finally {
          setLoading(false);
        }
      };
      loadBanners();
    } else {
      setBannerImages(image ? [image] : (banners ?? []));
    }
  }, [fetchBannerData, banners, image]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const cardWidthWithGap = bannerWidth + cardGap; // Account for gap between cards
    const index = Math.round(scrollPosition / cardWidthWithGap);
    setCurrentIndex(index);
  };

  const handlePress = (index: number) => {
    const item = bannerImages[index] as any;
    // If consumer provided onPress callback, prefer that
    if (onPress) {
      onPress(index);
      return;
    }

    // If banner item is an object with a link, use link handler
    const bannerLink = item && typeof item === 'object' ? item.link : undefined;
    if (bannerLink) {
      handleHomeLink(bannerLink, navigation);
      return;
    }

    // Fallback: navigate to banner detail screen
    navigation.navigate('BannerDetail', { title: 'Banner' });
  };

  // Ensure banner images exist
  if (!bannerImages || bannerImages.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Banner Image Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingRight: 12 }]}
      >
        {bannerImages.map((banner, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.imageContainer, 
              { width: bannerWidth },
              index < bannerImages.length - 1 && { marginRight: cardGap } // Add gap between cards
            ]}
            onPress={() => handlePress(index)}
            activeOpacity={0.9}
          >
            <Image
              source={
                (banner as any)?.imageUrl
                  ? { uri: (banner as any).imageUrl }
                  : (banner as any)
              }
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dot Indicators */}
      {bannerImages.length > 1 && (
        <View style={styles.dotsContainer}>
          {bannerImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12, // Reduced padding for larger banner
    paddingVertical: 20,
    gap: 12,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingLeft: 12, // Add left padding for first card
  },
  imageContainer: {
    height: 340, // Increased from 272 to 340 (25% larger)
    borderRadius: 12, // Slightly larger border radius
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    width: '100%',
    paddingHorizontal: 16,
  },
  dot: {
    borderRadius: 4,
  },
  activeDot: {
    width: 16,
    height: 8,
    backgroundColor: '#034703',
  },
  inactiveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#BABABA',
  },
});
