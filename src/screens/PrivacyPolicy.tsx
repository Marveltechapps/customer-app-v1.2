import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { GeneralInfoStackNavigationProp } from '../types/navigation';
import Header from '../components/layout/Header';
import { getPrivacy } from '../services/legal/legalService';
import { logger } from '@/utils/logger';

const FALLBACK_PRIVACY = `Privacy Policy content is loaded from the server. If you see this, the request may have failed or content is not configured.`;
const FALLBACK_TITLE = 'Privacy Policy';

// Privacy content is loaded from GET /legal/privacy (backend-managed).

const PrivacyPolicy: React.FC = () => {
  const navigation = useNavigation<GeneralInfoStackNavigationProp>();
  const [title, setTitle] = useState<string>(FALLBACK_TITLE);
  const [content, setContent] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchPrivacy = async () => {
      setLoading(true);
      try {
        const res = await getPrivacy();
        if (cancelled) return;
        if (res.success && res.data) {
          setTitle(res.data.title || FALLBACK_TITLE);
          setContent(res.data.content || FALLBACK_PRIVACY);
          setLastUpdated(res.data.lastUpdated || null);
        } else {
          setContent(FALLBACK_PRIVACY);
        }
      } catch (err) {
        if (!cancelled) {
          logger.error('Error fetching privacy content', err);
          setContent(FALLBACK_PRIVACY);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPrivacy();
    return () => { cancelled = true; };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title={title} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <>
              {lastUpdated ? (
                <Text style={styles.lastUpdatedText}>Last updated: {lastUpdated}</Text>
              ) : null}
              <Text style={styles.contentText}>{content}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  contentText: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
    textAlign: 'left',
  },
  loadingText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
    paddingVertical: 20,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#828282',
    marginBottom: 8,
  },
});

export default PrivacyPolicy;

