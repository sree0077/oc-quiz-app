import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useQuizStore } from '../../src/store/quizStore';
import { supabase } from '../../src/config/supabase';
import { useState } from 'react';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const session = useAuthStore(state => state.session);
  const startQuiz = useQuizStore(state => state.startQuiz);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartQuiz = async () => {
    if (isStarting) {
      console.log('Quiz already starting, ignoring click');
      return;
    }

    setIsStarting(true);
    console.log('--- STARTING QUIZ FETCH ---');

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, question_text, options, correct_option_index, category')
        .limit(10);

      console.log('Fetched questions:', data?.length);

      if (data && data.length > 0) {
        const quizQuestions = data.map(q => {
          console.log('Processing question:', q.id);
          console.log('  options type:', typeof q.options);
          console.log('  options value:', q.options);
          
          const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          console.log('  parsed options:', parsedOptions);
          
          return {
            id: q.id,
            question_text: q.question_text,
            options: parsedOptions,
            correct_option_index: q.correct_option_index,
            category: q.category
          };
        });

        console.log('Committing questions to store');
        console.log('First question options:', quizQuestions[0]?.options);
        startQuiz(quizQuestions);
        router.push('/quiz/session');
      } else {
        alert('No questions available yet!');
      }
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          Hello, {session?.user?.email?.split('@')[0] || 'Student'}
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.secondary }}>
          Ready to learn something new today?
        </Text>
      </View>

      <Card style={styles.card} mode="elevated">
        <Card.Title
          title="Daily Challenge"
          subtitle="10 questions • Mixed topics"
          left={(props) => <Avatar.Icon {...props} icon="fire" style={{ backgroundColor: theme.colors.primary }} />}
        />
        <Card.Content>
          <Text variant="bodyMedium">
            Keep your streak alive! Complete today's challenge to earn points.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={handleStartQuiz}>Start Quiz</Button>
        </Card.Actions>
      </Card>

      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { marginRight: 8 }]}>
          <Card.Content>
            <Text variant="titleLarge">0</Text>
            <Text variant="bodySmall">Quizzes Taken</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { marginLeft: 8 }]}>
          <Card.Content>
            <Text variant="titleLarge">0%</Text>
            <Text variant="bodySmall">Avg Score</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
});
