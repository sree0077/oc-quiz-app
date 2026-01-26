import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuizStore } from '../../src/store/quizStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ResultsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { score, questions, resetQuiz } = useQuizStore();

  const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;

  const handleHome = () => {
    resetQuiz();
    router.replace('/(tabs)');
  };

  const handleRetry = () => {
    // Logic to restart same quiz? For now just go home
    resetQuiz();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <MaterialCommunityIcons
            name={percentage >= 70 ? "trophy" : "emoticon-sad-outline"}
            size={80}
            color={theme.colors.primary}
            style={styles.icon}
          />

          <Text variant="headlineMedium" style={styles.title}>
            {percentage >= 70 ? "Great Job!" : "Keep Practicing!"}
          </Text>

          <Text variant="displayLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            {score} / {questions.length}
          </Text>

          <Text variant="titleMedium" style={styles.percent}>
            {Math.round(percentage)}% Score
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.buttons}>
        <Button mode="contained" onPress={handleHome} style={styles.button}>
          Back to Home
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 32,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
  },
  percent: {
    marginTop: 8,
    opacity: 0.6,
  },
  buttons: {
    marginTop: 32,
    width: '100%',
    maxWidth: 400,
  },
  button: {
    paddingVertical: 6,
  },
});
