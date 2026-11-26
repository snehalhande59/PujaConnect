import { NativeModules, LogBox } from 'react-native';

// Suppress and polyfill BiometricAuth warning for MSG91 SDK in Expo Go
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

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
