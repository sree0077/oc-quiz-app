import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <PaperProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1976D2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}

