import { LogBox } from 'react-native';

// Suppress non-fatal BiometricAuth warning emitted by MSG91 SDK in Expo Go
LogBox.ignoreLogs([
  'BiometricAuth is undefined',
  'Ensure the native module is properly linked',
]);

const rawConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('BiometricAuth is undefined')
  ) {
    return;
  }
  rawConsoleError.apply(console, args);
};

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
