import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../src/config/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useProtectedRoute } from '../src/hooks/useProtectedRoute';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Protection hook
  useProtectedRoute();

  if (!isMounted) return null;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.onBackground,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
