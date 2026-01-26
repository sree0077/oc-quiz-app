import { Stack } from 'expo-router';
import { theme } from '../../src/config/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true, // Show header for back button
        headerTransparent: true, // Make it clean matching the design
        headerTitle: '', // Hide title text for minimal look
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
