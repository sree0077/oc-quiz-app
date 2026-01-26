import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, useTheme, Avatar, ActivityIndicator, Portal, Dialog, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useQuizStore, Subject } from '../../src/store/quizStore';
import { supabase } from '../../src/config/supabase';
import { useState, useEffect, useCallback } from 'react';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const session = useAuthStore(state => state.session);
  const startQuiz = useQuizStore(state => state.startQuiz);
  const [isStarting, setIsStarting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState({ totalQuizzes: 0, avgScore: 0 });

  // Subject creation state
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectLoading, setSubjectLoading] = useState(false);

  const fetchData = async () => {
    if (!session?.user?.id) return;

    try {
      // Fetch subjects
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (!subjectError && subjectData) {
        setSubjects(subjectData);
      }

      // Fetch stats
      const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select('score, total_questions')
        .eq('user_id', session.user.id);

      if (!attemptError && attemptData) {
        const total = attemptData.length;
        const avg = total > 0
          ? Math.round(attemptData.reduce((acc, curr) => acc + (curr.score / curr.total_questions), 0) / total * 100)
          : 0;
        setStats({ totalQuizzes: total, avgScore: avg });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session?.user?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [session?.user?.id]);

  const handleCreateSubject = async () => {
    console.log('handleCreateSubject called with name:', newSubjectName);
    if (!newSubjectName.trim()) {
      console.log('Empty subject name, aborting');
      return;
    }
    setSubjectLoading(true);
    const { data, error } = await supabase
      .from('subjects')
      .insert({ name: newSubjectName, creator_id: session?.user.id })
      .select()
      .single();

    console.log('Subject creation result:', { data, error });
    setSubjectLoading(false);
    if (!error && data) {
      setSubjects(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewSubjectName('');
      setShowSubjectDialog(false);
    } else {
      alert(error?.message || 'Failed to create subject');
    }
  };

  const handleStartQuiz = async (subjectId?: string) => {
    if (isStarting) return;

    setIsStarting(true);
    try {
      // Build query dynamically to avoid errors if subject_id column is missing or query fails
      let query = supabase
        .from('questions')
        .select('*'); // Select all to be safe, or specify exactly what's needed

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      } else {
        query = query.limit(10);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Quiz fetch error:', error);
        alert('Error fetching questions: ' + error.message);
        return;
      }

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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          Hello, {session?.user?.email?.split('@')[0] || 'Student'}
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.secondary }}>
          Ready to learn something new today?
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { marginRight: 8 }]}>
          <Card.Content>
            <Text variant="titleLarge">{stats.totalQuizzes}</Text>
            <Text variant="bodySmall">Quizzes Taken</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { marginLeft: 8 }]}>
          <Card.Content>
            <Text variant="titleLarge">{stats.avgScore}%</Text>
            <Text variant="bodySmall">Avg Score</Text>
          </Card.Content>
        </Card>
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
          <Button onPress={() => handleStartQuiz()} loading={isStarting && !subjects.some(s => s.id === 'loading')}>
            Start Random Quiz
          </Button>
        </Card.Actions>
      </Card>

      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Explore Subjects</Text>
        <Button
          mode="text"
          onPress={() => setShowSubjectDialog(true)}
          icon="plus"
        >
          Add Subject
        </Button>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : subjects.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium">No subjects created yet. Go to the "Create" tab to add some!</Text>
          </Card.Content>
        </Card>
      ) : (
        <View style={styles.subjectsGrid}>
          {subjects.map(subject => (
            <Card
              key={subject.id}
              style={styles.subjectCard}
              onPress={() => handleStartQuiz(subject.id)}
            >
              <Card.Content style={styles.subjectCardContent}>
                <Avatar.Icon size={40} icon="book-outline" style={{ backgroundColor: theme.colors.secondaryContainer }} color={theme.colors.onSecondaryContainer} />
                <Text variant="titleMedium" style={styles.subjectName}>{subject.name}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      <Portal>
        <Dialog visible={showSubjectDialog} onDismiss={() => setShowSubjectDialog(false)}>
          <Dialog.Title>Create New Subject</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Subject Name"
              value={newSubjectName}
              onChangeText={setNewSubjectName}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSubjectDialog(false)}>Cancel</Button>
            <Button onPress={handleCreateSubject} loading={subjectLoading}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  subjectCard: {
    width: '48%',
    marginBottom: 16,
  },
  subjectCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  subjectName: {
    marginTop: 8,
    textAlign: 'center',
  },
});
