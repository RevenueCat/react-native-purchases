import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { CustomVariablesProvider } from '@/components/CustomVariablesContext';
import CustomVariablesEditor from '@/components/CustomVariablesEditor';
import Purchases, { PURCHASES_ARE_COMPLETED_BY_TYPE, PurchasesAreCompletedBy, STOREKIT_VERSION } from 'react-native-purchases';
import APIKeys from '@/constants/APIKeys';
import ConfigOptions from '@/constants/ConfigOptions';

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

  const [purchasesConfigured, setPurchasesConfigured] = useState(false);

  // Configure Purchases on app startup
  useEffect(() => {
    const configurePurchases = async () => {
      try {
        // Enable debug logs before calling `configure`
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        // Get the appropriate API key based on platform
        let apiKey = '';
        if (Platform.OS === 'ios') {
          apiKey = APIKeys.apple;
        } else if (Platform.OS === 'android') {
          apiKey = APIKeys.google;
        } else if (Platform.OS === 'web') {
          apiKey = APIKeys.web;
        }

        if (apiKey) {
          // Initialize the RevenueCat Purchases SDK
          // appUserID is null, so an anonymous ID will be generated automatically
          const purchasesAreCompletedBy: PurchasesAreCompletedBy = ConfigOptions.usePurchasesCompletedByMyApp
            ? { type: PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP, storeKitVersion: STOREKIT_VERSION.STOREKIT_2 }
            : PURCHASES_ARE_COMPLETED_BY_TYPE.REVENUECAT;
          Purchases.configure({
            apiKey: apiKey,
            appUserID: null,
            useAmazon: false,
            purchasesAreCompletedBy: purchasesAreCompletedBy,
          });
          // @ts-expect-error - addTrackedEventListener is internal
          await Purchases.addTrackedEventListener((event: Record<string, unknown>) => {
            console.log('[RCTrackedEvent]', JSON.stringify(event, null, 2));
          });
          // @ts-expect-error - addDebugEventListener is internal
          await Purchases.addDebugEventListener((event: Record<string, unknown>) => {
            console.log('[RCDebugEvent]', JSON.stringify(event, null, 2));
          });
          setPurchasesConfigured(true);
          console.log('Purchases configured successfully');
        } else {
          console.warn('No API key found for platform:', Platform.OS);
        }
      } catch (e) {
        console.error('Failed to configure Purchases:', e);
      }
    };

    configurePurchases();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && purchasesConfigured) {
      SplashScreen.hideAsync();
    }
  }, [loaded, purchasesConfigured]);

  if (!loaded || !purchasesConfigured) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <CustomVariablesProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <CustomVariablesEditor />
      </ThemeProvider>
    </CustomVariablesProvider>
  );
}
