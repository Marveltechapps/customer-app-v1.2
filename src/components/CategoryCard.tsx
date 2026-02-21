import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, Animated, Easing } from 'react-native';
import Text from './common/Text';

interface CategoryCardProps {
  image: ImageSourcePropType;
  name: string;
  onPress?: () => void;
  width?: number; // Optional width prop for responsive design
}

export default function CategoryCard({ image, name, onPress, width }: CategoryCardProps) {
  // Card width is 104px, image container stretches to full width with padding inside
  const cardWidth = width || 104;
  
  // Press animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    // Quick scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start(() => {
      onPress?.();
    });
  };
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[styles.container, width && { width }]} 
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.imageContainer, { width: cardWidth }]}>
          <Image source={image} style={styles.image} resizeMode="contain" />
        </View>
        <View style={[styles.textContainer, { width: cardWidth }]}>
          <Text style={styles.categoryName} numberOfLines={2}>
            {name}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 104,
    minHeight: 128, // Minimum height, can grow for multi-line text
    gap: 4, // Matches Figma gap between image and text
    alignItems: 'center',
  },
  imageContainer: {
    width: 104, // Full card width, matches Figma (stretches to card width)
    height: 96, // Fixed height from Figma (but can vary for some items)
    backgroundColor: '#EDEDED',
    borderWidth: 1,
    borderColor: 'rgba(209, 209, 209, 0.3)',
    borderRadius: 8,
    paddingVertical: 4, // Matches Figma padding: 4px 8px
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch', // Matches Figma layout
  },
  image: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  textContainer: {
    paddingHorizontal: 2, // Minimal padding, matches Figma (varies by item but 2px is common)
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch', // Matches Figma layout
    width: 104,
    minHeight: 18, // Minimum height for single line
    flexShrink: 0,
  },
  categoryName: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18, // 1.5em = 18px
    color: '#1C1C1C',
    textAlign: 'center',
    textAlignVertical: 'top', // Matches Figma textAlignVertical: TOP
  },
});

