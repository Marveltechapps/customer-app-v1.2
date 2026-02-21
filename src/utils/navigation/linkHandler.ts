import { Linking } from 'react-native';
import type { RootStackNavigationProp } from '../../types/navigation';

// Parses links: product:id, category:id, http(s)://..., or ScreenName:param1=val&param2=val
export function handleHomeLink(link: string | undefined, navigation: RootStackNavigationProp) {
  if (!link) return;
  const trimmed = link.trim();

  // External URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    Linking.openURL(trimmed).catch((err) => {
      console.warn('Failed to open URL', trimmed, err);
    });
    return;
  }

  // product:<productId> → ProductDetail
  if (trimmed.startsWith('product:')) {
    const productId = trimmed.slice(8).trim();
    if (productId) {
      try {
        navigation.navigate('ProductDetail', { productId });
      } catch (err) {
        console.warn('Navigation failed for link', link, err);
      }
    }
    return;
  }

  // category:<categoryId> → CategoryProducts (categoryName resolved from API on load)
  if (trimmed.startsWith('category:')) {
    const categoryId = trimmed.slice(9).trim();
    if (categoryId) {
      try {
        navigation.navigate('CategoryProducts', { categoryId, categoryName: '' });
      } catch (err) {
        console.warn('Navigation failed for link', link, err);
      }
    }
    return;
  }

  // In-app deep link format: ScreenName or ScreenName:param1=val&param2=val
  const [screenPart, paramsPart] = trimmed.split(':', 2);
  const screen = screenPart;
  let params: Record<string, any> = {};
  if (paramsPart) {
    try {
      const usp = new URLSearchParams(paramsPart);
      usp.forEach((value, key) => {
        params[key] = value;
      });
    } catch (e) {
      // fallback: crude parse
      paramsPart.split('&').forEach((pair) => {
        const [k, v] = pair.split('=');
        if (k) params[k] = decodeURIComponent(v || '');
      });
    }
  }

  try {
    navigation.navigate((screen as unknown) as any, params);
  } catch (err) {
    console.warn('Navigation failed for link', link, err);
  }
}

export default handleHomeLink;

