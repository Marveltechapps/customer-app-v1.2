import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CustomerSupportStackParamList } from '../types/navigation';
import CustomerSupport from '../screens/CustomerSupport';
import HelpSubSection from '../screens/HelpSubSection';

const Stack = createNativeStackNavigator<CustomerSupportStackParamList>();

const CustomerSupportStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CustomerSupport"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CustomerSupport" component={CustomerSupport} />
      <Stack.Screen name="HelpSubSection" component={HelpSubSection} />
    </Stack.Navigator>
  );
};

export default CustomerSupportStack;

