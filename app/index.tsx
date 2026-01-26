import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { theme } from '../src/config/theme';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="displayMedium" style={styles.title}>
          Quiz App
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Master your subjects with AI-powered quizzes.
        </Text>

        <Button
          mode="contained"
          onPress={() => router.push('/(auth)/login')} // We need to create this route
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Get Started
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 48,
    color: theme.colors.secondary,
    textAlign: 'center',
    opacity: 0.8,
  },
  button: {
    width: '100%',
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
