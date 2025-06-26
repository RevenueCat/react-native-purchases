import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Platform } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
// @ts-ignore
import Purchases from 'react-native-purchases';
import APIKeys from './APIKeys';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Configure Purchases with platform-specific API key
  useEffect(() => {
    const configurePurchases = async () => {
      try {
        let apiKey = '';

        if (Platform.OS === 'ios') {
          apiKey = APIKeys.apple;
        } else if (Platform.OS === 'android') {
          apiKey = APIKeys.google;
        } else if (Platform.OS === 'web') {
          apiKey = APIKeys.web;
        }

        if (apiKey) {
          Purchases.configure({ apiKey });
          console.log(`[RevenueCat] Configured with ${Platform.OS} API key`);
        } else {
          console.warn(`[RevenueCat] No API key configured for ${Platform.OS}`);
        }
      } catch (err) {
        console.error('[RevenueCat] Error configuring Purchases:', err);
      }
    };

    configurePurchases();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
