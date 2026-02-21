import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Image, ImageSourcePropType, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { logger } from '@/utils/logger';
import handleHomeLink from '../../utils/navigation/linkHandler';
import type { RootStackNavigationProp } from '../../types/navigation';
import { getWindowDimensions, getSpacing } from '../../utils/responsive';

/** Backend banner shape: { imageUrl, link?, ... }; also accepts ImageSourcePropType */
export type BannerItem = ImageSourcePropType | { imageUrl: string; link?: string; [k: string]: unknown };

interface BannerSectionProps {
  banners?: BannerItem[];
  onPress?: (index: number) => void;
  fetchBannerData?: () => Promise<BannerItem[]>;
}

export default function BannerSection({
  banners,
  onPress,
  fetchBannerData,
}: BannerSectionProps) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [bannerImages, setBannerImages] = useState<BannerItem[]>(
    banners && banners.length > 0 ? banners : []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dotAnimationRef = useRef(new Animated.Value(0)).current;

  // Sync when banners prop updates (e.g. from home payload)
  useEffect(() => {
    if (banners && banners.length > 0) {
      setBannerImages(banners);
    } else if (!fetchBannerData) {
      setBannerImages([]);
    }
  }, [banners, fetchBannerData]);

  // Responsive banner dimensions
  const bannerDimensions = useMemo(() => {
    const screenWidth = getWindowDimensions().width;
    const containerPadding = getSpacing(16) * 2; // 16px on each side
    const gapBetweenBanners = getSpacing(12); // 12px gap as per Figma
    const bannerWidth = screenWidth - containerPadding; // Width minus padding
    const bannerWidthWithGap = bannerWidth + gapBetweenBanners; // Width including gap for scroll calculation
    
    return {
      bannerWidth,
      bannerWidthWithGap,
    };
  }, []);
  
  const { bannerWidth, bannerWidthWithGap } = bannerDimensions;
  
  // Calculate snap offsets for each banner
  const snapOffsets = useMemo(() => {
    return bannerImages.map((_, index) => {
      return index * bannerWidthWithGap;
    });
  }, [bannerImages, bannerWidthWithGap]);

  // Placeholder for API integration
  useEffect(() => {
    if (fetchBannerData) {
      const loadBanners = async () => {
        setLoading(true);
        try {
          const data = await fetchBannerData();
          setBannerImages(data);
        } catch (error) {
          logger.error('Error fetching banner data', error);
          // Fallback to provided banners or dummy data
          setBannerImages(banners ?? []);
        } finally {
          setLoading(false);
        }
      };
      loadBanners();
    }
  }, [fetchBannerData, banners]);

  // Auto-scroll functionality - scrolls every 5 seconds
  useEffect(() => {
    if (bannerImages.length <= 1) return; // Don't auto-scroll if there's only one banner

    // Reset and start dot animation
    dotAnimationRef.setValue(0);
    Animated.timing(dotAnimationRef, {
      toValue: 1,
      duration: 5000, // 5 seconds
      useNativeDriver: false,
    }).start();

    // Clear any existing timer
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }

    autoScrollTimerRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerImages.length;
      const scrollPosition = nextIndex * bannerWidthWithGap;
      
      scrollViewRef.current?.scrollTo({
        x: scrollPosition,
        animated: true,
      });
      
      setCurrentIndex(nextIndex);
    }, 5000); // 5 seconds

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [currentIndex, bannerImages.length, bannerWidthWithGap, dotAnimationRef]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / bannerWidthWithGap);
    setCurrentIndex(index);
    
    // Reset auto-scroll timer when user manually scrolls
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
    
    // Restart auto-scroll after 5 seconds of inactivity
    dotAnimationRef.setValue(0);
    Animated.timing(dotAnimationRef, {
      toValue: 1,
      duration: 5000, // 5 seconds
      useNativeDriver: false,
    }).start();

    autoScrollTimerRef.current = setInterval(() => {
      const nextIndex = (index + 1) % bannerImages.length;
      const scrollPosition = nextIndex * bannerWidthWithGap;
      
      scrollViewRef.current?.scrollTo({
        x: scrollPosition,
        animated: true,
      });
      
      setCurrentIndex(nextIndex);
    }, 5000);
  };

  const handlePress = (index: number) => {
    const item = bannerImages[index] as any;
    if (onPress) {
      onPress(index);
      return;
    }

    const bannerLink = item && typeof item === 'object' ? item.link : undefined;
    if (bannerLink) {
      handleHomeLink(bannerLink, navigation);
      return;
    }

    // Fallback
    navigation.navigate('BannerDetail', { title: 'Moringa' });
  };

  return (
    <View style={styles.container}>
      {/* Banner Image Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        snapToOffsets={snapOffsets}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {bannerImages.map((banner, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.imageContainer,
              { width: bannerWidth }, // Dynamic width from useMemo
              index < bannerImages.length - 1 && { marginRight: 12 }
            ]}
            onPress={() => handlePress(index)}
            activeOpacity={0.9}
          >
            <Image
              source={(banner as any)?.imageUrl ? { uri: (banner as any).imageUrl } : (banner as any)}
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dot Indicators */}
      <View style={styles.dotsContainer}>
        {bannerImages.map((_, index) => {
          const isActive = index === currentIndex;
          const animatedWidth = dotAnimationRef.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 16], // Animate from 8px to 16px
          });

          return (
            <View key={index} style={styles.dotWrapper}>
              {isActive ? (
                <Animated.View
                  style={[
                    styles.dot,
                    styles.activeDot,
                    {
                      width: animatedWidth,
                    },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.dot,
                    styles.inactiveDot,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    paddingLeft: 0,
    paddingRight: 16,
  },
  imageContainer: {
    height: 198,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  dotWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 4,
    height: 8,
  },
  activeDot: {
    backgroundColor: '#034703',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#BABABA',
  },
});
