import React from 'react';
import { NativeModules, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { RootNavigator } from './src/navigation/RootNavigator';

// Ignore native BiometricAuth warning from MSG91 SDK in Expo Go
LogBox.ignoreLogs([
  'BiometricAuth is undefined',
  'Ensure the native module is properly linked',
]);

if (!NativeModules.BiometricAuth) {
  NativeModules.BiometricAuth = {
    isSensorAvailable: () => Promise.resolve({ available: false }),
    authenticate: () => Promise.reject('Biometrics not available in Expo Go'),
    getBiometricType: () => Promise.resolve(''),
    simplePrompt: () => Promise.resolve({ success: false }),
    cancelAuthentication: () => Promise.resolve(''),
    isTruecallerInstalled: () => Promise.resolve(false),
  };
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style="dark" />
      <AuthProvider>
        <CartProvider>
          <RootNavigator />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
