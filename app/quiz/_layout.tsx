import { Stack } from 'expo-router';
import { theme } from '../../src/config/theme';

export default function QuizLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="session" options={{ title: 'Quiz Session', headerBackVisible: true }} />
      <Stack.Screen name="results" options={{ title: 'Results', headerBackVisible: false, gestureEnabled: false }} />
    </Stack>
  );
}
