import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';
import Constants from 'expo-constants';
import LocationSelector from '../features/location/LocationSelector';
import SearchBar from '../features/search/SearchBar';
import ProfileIconHome from '../icons/ProfileIconHome';
import MuteIcon from '../icons/MuteIcon';
import UnmuteIcon from '../icons/UnmuteIcon';
import { useDimensions, scale, getSpacing, wp } from '../../utils/responsive';
import { logger } from '@/utils/logger';

interface TopSectionProps {
  deliveryType?: string;
  address?: string;
  searchPlaceholder?: string;
  heroVideoUrl?: string | null;
  onLocationPress?: () => void;
  onProfilePress?: () => void;
  onSearch?: (text: string) => void;
  onLayout?: (layout: { y: number; height: number }) => void;
  isVisible?: boolean;
  isScreenFocused?: boolean; // New prop to track screen focus
}

// Video source - using the video file from assets/videos
const homepageVideo = require('../../assets/videos/homepage_video.mp4');

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export default function TopSection({
  deliveryType = 'Delivery to Home',
  address = '',
  searchPlaceholder = 'Search for "Dal" ',
  heroVideoUrl,
  onLocationPress,
  onProfilePress,
  onSearch,
  onLayout,
  isVisible = true,
  isScreenFocused = true,
}: TopSectionProps) {
  const { width: screenWidth } = useDimensions();
  const videoContainerRef = useRef<View>(null);
  const videoRef = useRef<Video>(null);
  const [isMuted, setIsMuted] = useState(false); // Audio state

  // Use backend hero video URL when present, otherwise local asset
  const hasRemoteVideo = Boolean(heroVideoUrl && heroVideoUrl.trim());
  const videoSource = hasRemoteVideo ? { uri: heroVideoUrl!.trim() } : homepageVideo;
  // In Expo Go, only use the real Video component when we have a remote URL (expo-av can play remote URIs)
  const useVideoPlayer = !isExpoGo || hasRemoteVideo;

  // Video container height - explicit height for proper layout
  const VIDEO_CONTAINER_HEIGHT = 400; // Increased by another 20% (300 * 1.20 = 360)
  
  // Responsive video dimensions - maintain aspect ratio from design (340/381)
  const videoDimensions = useMemo(() => {
    const baseVideoHeight = (340 / 381) * screenWidth; // Maintain aspect ratio
    const videoHeight = baseVideoHeight * 1.35; // Increase by 35%
    const fadeGradientHeight = videoHeight * 0.05; // 5% fade at top of video
    
    return {
      videoHeight,
      fadeGradientHeight,
      containerHeight: VIDEO_CONTAINER_HEIGHT,
    };
  }, [screenWidth]);

  const handleVideoLayout = (event: any) => {
    const { y, height } = event.nativeEvent.layout;
    if (onLayout) {
      onLayout({ y, height });
    }
  };

  // Control video playback and mute based on visibility
  useEffect(() => {
    if (!videoRef.current || isExpoGo) return;
    
    const controlPlayback = async () => {
      try {
        if (isVisible) {
          await videoRef.current?.playAsync();
          logger.info('Video resumed');
        } else {
          // When video is not visible: pause and auto-mute
          await videoRef.current?.pauseAsync();
          setIsMuted(true); // Auto-mute when not visible
          logger.info('Video paused and muted (not visible)');
        }
      } catch (error: any) {
        logger.warn('Error controlling video playback', error);
      }
    };
    
    controlPlayback();
  }, [isVisible]);

  // Auto-mute when screen loses focus (navigating away)
  useEffect(() => {
    if (!videoRef.current || isExpoGo) return;
    
    const handleScreenBlur = async () => {
      try {
        if (!isScreenFocused) {
          // Screen lost focus - pause and mute video
          await videoRef.current?.pauseAsync();
          setIsMuted(true);
          logger.info('Video paused and muted (screen lost focus)');
        }
      } catch (error: any) {
        logger.warn('Error handling screen blur', error);
      }
    };
    
    handleScreenBlur();
  }, [isScreenFocused]);

  // Toggle audio mute/unmute
  const handleToggleAudio = () => {
    setIsMuted((prev) => !prev);
    logger.info('Audio toggled', { muted: !isMuted });
  };

  return (
    <View style={styles.container}>
      {/* Video Container - Relative position with explicit height */}
      <View 
        ref={videoContainerRef}
        style={[
          styles.videoContainer, 
          { 
            height: videoDimensions.containerHeight,
          }
        ]}
        onLayout={handleVideoLayout}
      >
        {/* Green Background Layer - Bottom (zIndex: 0) */}
        <View 
          style={[
            styles.greenBackground, 
            { height: videoDimensions.containerHeight }
          ]} 
        />

        {/* Video - Absolute position to overlay text */}
        {useVideoPlayer ? (
          // Video Player (dev/prod builds, or Expo Go with remote URL)
          <>
            <Video
              ref={videoRef}
              source={videoSource}
              style={[
                styles.backgroundVideo, 
                { 
                  height: videoDimensions.containerHeight,
                }
              ]}
              resizeMode={'cover' as any}
              isLooping
              shouldPlay={isVisible}
              isMuted={isMuted}
              useNativeControls={false}
            />
            {/* White gradient at top of video (top to 5%) */}
            <LinearGradient
              colors={['#FFFFFF', 'rgba(255, 255, 255, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[
                styles.videoFadeGradient, 
                { height: videoDimensions.fadeGradientHeight }
              ]}
            />
            {/* Audio Toggle Button - Right Bottom */}
            <TouchableOpacity
              style={styles.audioToggleButton}
              onPress={handleToggleAudio}
              activeOpacity={0.7}
            >
              {isMuted ? (
                <MuteIcon width={24} height={24} color="#FFFFFF" />
              ) : (
                <UnmuteIcon width={24} height={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </>
        ) : (
          // Placeholder (Expo Go)
          <>
            <View style={[
              styles.backgroundVideo, 
              { 
                height: videoDimensions.containerHeight,
                backgroundColor: 'transparent' 
              }
            ]}>
              <View style={styles.placeholderContent}>
                <Text style={styles.placeholderText}>Video not available in Expo Go</Text>
              </View>
            </View>
            {/* White gradient at top of placeholder (top to 5%) */}
            <LinearGradient
              colors={['#FFFFFF', 'rgba(255, 255, 255, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[
                styles.videoFadeGradient, 
                { height: videoDimensions.fadeGradientHeight }
              ]}
            />
          </>
        )}
      </View>

      {/* Top Content Section - Input, Location & Profile - Top Layer (zIndex: 10) */}
      <View style={styles.topContent}>
        {/* Location and Profile Row */}
        <View style={styles.locationProfileRow}>
          <View style={styles.locationContainer}>
            <LocationSelector
              deliveryType={deliveryType}
              address={address}
              onPress={onLocationPress}
            />
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={onProfilePress}
            activeOpacity={0.7}
          >
            <ProfileIconHome />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <SearchBar placeholder={searchPlaceholder} onSearch={onSearch} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  videoContainer: {
    width: '100%',
    position: 'relative', // Changed from absolute to relative
    overflow: 'hidden',
  },
  greenBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: '#034703',
    zIndex: 0,
  },
  backgroundVideo: {
    width: '100%',
    position: 'absolute', // Video inside is absolute to overlay text
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  videoFadeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 2,
  },
  topContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: getSpacing(14),
    paddingTop: getSpacing(17),
    paddingBottom: getSpacing(20),
    gap: getSpacing(12),
    zIndex: 10,
  },
  locationProfileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: wp(28.85), // Responsive gap (108.18/375 * 100%)
  },
  locationContainer: {
    flex: 1,
  },
  profileButton: {
    width: scale(24),
    height: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  searchBarContainer: {
    width: '100%',
  },
  placeholderContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: scale(14),
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  audioToggleButton: {
    position: 'absolute',
    bottom: getSpacing(16),
    right: getSpacing(16),
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
});
