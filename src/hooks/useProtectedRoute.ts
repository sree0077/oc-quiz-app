import { useEffect } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { session, isLoading } = useAuthStore();

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !session &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/(tabs)');
    }
  }, [session, segments, navigationState?.key, isLoading]);
}
