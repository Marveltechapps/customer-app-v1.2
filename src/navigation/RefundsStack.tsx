import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RefundsStackParamList } from '../types/navigation';
import Refunds from '../screens/Refunds';
import RefundDetails from '../screens/RefundDetails';

const Stack = createNativeStackNavigator<RefundsStackParamList>();

const RefundsStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Refunds"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Refunds" component={Refunds} />
      <Stack.Screen name="RefundDetails" component={RefundDetails} />
    </Stack.Navigator>
  );
};

export default RefundsStack;

