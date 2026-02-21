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
import type { RootStackNavigationProp } from '../types/navigation';
import Header from '../components/layout/Header';
import PaymentCard from '../components/PaymentCard';
import { logger } from '@/utils/logger';

// Dummy static data - Replace with API call later
interface PaymentMethod {
  id: string;
  cardType: string;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
}

const DUMMY_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: '1',
    cardType: 'Visa',
    lastFourDigits: '2345',
    expiryMonth: '16',
    expiryYear: '24',
  },
  {
    id: '2',
    cardType: 'Visa',
    lastFourDigits: '2345',
    expiryMonth: '16',
    expiryYear: '24',
  },
];

const PaymentManagement: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  // State for API integration (ready for future use)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  // Placeholder for API call - Replace with actual API later
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/payment-methods');
        // const data = await response.json();
        // setPaymentMethods(data.paymentMethods);

        // Using dummy data for now
        setPaymentMethods(DUMMY_PAYMENT_METHODS);
      } catch (error) {
        logger.error('Error fetching payment methods', error);
        // Fallback to dummy data
        setPaymentMethods(DUMMY_PAYMENT_METHODS);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);


  const handleDeleteCard = async (cardId: string) => {
    // Update local state
    setPaymentMethods((prev) => prev.filter((card) => card.id !== cardId));

    // TODO: Replace with actual API call
    // await fetch(`/api/payment-methods/${cardId}`, {
    //   method: 'DELETE',
    // });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Payment management" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : paymentMethods.length > 0 ? (
            paymentMethods.map((card) => (
              <View key={card.id} style={styles.cardWrapper}>
                <PaymentCard
                  cardType={card.cardType}
                  lastFourDigits={card.lastFourDigits}
                  expiryMonth={card.expiryMonth}
                  expiryYear={card.expiryYear}
                  onDelete={() => handleDeleteCard(card.id)}
                />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No payment methods added</Text>
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
  cardsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  cardWrapper: {
    width: '100%',
  },
  loadingText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default PaymentManagement;

