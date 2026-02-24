import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { RootStackNavigationProp } from '../../types/navigation';
import Text from '../common/Text';
import CategoryCard from '../CategoryCard';
import handleHomeLink from '../../utils/navigation/linkHandler';

interface Category {
  id: string;
  name: string;
  image: any;
  /** When set, tap opens this link (product:id, category:id, URL, or screen); else CategoryProducts */
  link?: string;
}

interface CategorySectionProps {
  title?: string;
  onCategoryPress?: (categoryId: string) => void;
  categories?: Category[]; // optional external categories from backend
}

export default function CategorySection({ title = 'Grocery & Kitchen', onCategoryPress, categories: externalCategories }: CategorySectionProps) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  
  // Fixed card width (104px as per design)
  const CARD_WIDTH = 104;
  
  // Calculate responsive gap to center 3 cards properly
  // Screen width - container padding (16px * 2) - 3 card widths = remaining space
  // Divide by 2 (number of gaps between 3 cards) to get gap size
  const cardGap = useMemo(() => {
    const containerPadding = 16 * 2; // 16px on each side
    const totalCardWidth = CARD_WIDTH * 3; // 3 cards
    const remainingSpace = screenWidth - containerPadding - totalCardWidth;
    const gap = Math.max(16, Math.floor(remainingSpace / 2)); // Minimum 16px gap
    return gap;
  }, [screenWidth]);
  
  const sourceCategories = externalCategories ?? [];

  const handleCategoryPress = (categoryId: string) => {
    try {
      if (onCategoryPress) {
        onCategoryPress(categoryId);
        return;
      }
      const category = sourceCategories.find((cat) => cat.id === categoryId);
      if (category?.link) {
        handleHomeLink(category.link, navigation);
        return;
      }
      const categoryName = category?.name || 'Category';
      navigation.navigate('CategoryProducts', {
        categoryId,
        categoryName: categoryName.replace(/\n/g, ' '),
      });
    } catch (error) {
      console.warn('Error navigating to category:', error);
    }
  };

  // Group categories into rows of 3
  const rows: Category[][] = [];
  for (let i = 0; i < sourceCategories.length; i += 3) {
    rows.push(sourceCategories.slice(i, i + 3));
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
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

      <View style={styles.categoriesContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.row, { gap: cardGap }]}>
            {row.map((category) => (
              <CategoryCard
                key={category.id}
                image={category.image}
                name={category.name}
                onPress={() => handleCategoryPress(category.id)}
                width={CARD_WIDTH}
              />
            ))}
            {/* Fill remaining slots if row has less than 3 items */}
            {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, index) => (
              <View key={`spacer-${index}`} style={[styles.spacer, { width: CARD_WIDTH }]} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16, // Changed from 12 to 16 to match Figma
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 10, // Matches Figma
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  dividerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 1,
  },
  divider: {
    width: 214, // Fixed width from Figma
    height: 1,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500', // Changed from '600' to '500' to match Figma
    lineHeight: 24, // 1.5em = 24px
    color: '#222222',
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  categoriesContainer: {
    gap: 16, // Changed from 24 to 16 to match Figma (gap between rows)
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center', // Center cards horizontally
    // gap will be set dynamically via style prop
  },
  spacer: {
    // Width will be set dynamically based on cardWidth
  },
});

