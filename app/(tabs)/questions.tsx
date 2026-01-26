import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, FAB, useTheme, Chip, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/config/supabase';

// Type for Question (simplified)
type Question = {
  id: string;
  question_text: string;
  category: string;
  created_at: string;
};

// Memoized Item Component to prevent unnecessary re-renders
const QuestionItem = React.memo(({ item }: { item: Question }) => (
  <Card style={styles.card} onPress={() => { }}>
    <Card.Content>
      <Text variant="bodyLarge" numberOfLines={2} style={styles.questionText}>
        {item.question_text}
      </Text>
      <View style={styles.chips}>
        <Chip compact style={styles.chip}>{item.category || 'General'}</Chip>
      </View>
    </Card.Content>
  </Card>
));

export default function QuestionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('id, question_text, category, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuestions(data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuestions();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const renderItem = useCallback(({ item }: { item: Question }) => (
    <QuestionItem item={item} />
  ), []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={questions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          // Optimization Props
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text variant="bodyLarge" style={{ opacity: 0.6 }}>No questions found.</Text>
              <Text variant="bodyMedium">Start adding some questions!</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push('/(tabs)/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
  },
  questionText: {
    marginBottom: 8,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
