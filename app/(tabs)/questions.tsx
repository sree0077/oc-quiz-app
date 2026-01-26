import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, FAB, useTheme, Chip, ActivityIndicator, IconButton, Portal, Dialog, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/config/supabase';

// Type for Question (simplified)
type Question = {
  id: string;
  question_text: string;
  category: string;
  created_at: string;
  subjects?: {
    name: string;
  };
};

// Memoized Item Component to prevent unnecessary re-renders
const QuestionItem = React.memo(({ item, onDelete }: { item: Question, onDelete: (id: string) => void }) => (
  <Card style={styles.card}>
    <Card.Content style={styles.cardContent}>
      <View style={styles.questionInfo}>
        <Text variant="bodyLarge" numberOfLines={2} style={styles.questionText}>
          {item.question_text}
        </Text>
        <View style={styles.chips}>
          <Chip compact style={styles.chip}>
            {item.subjects?.name || item.category || 'General'}
          </Chip>
        </View>
      </View>
      <View style={{ zIndex: 10 }}>
        <IconButton
          icon="delete-outline"
          iconColor="red"
          onPress={() => {
            console.log('Delete button pressed for ID:', item.id);
            onDelete(item.id);
          }}
        />
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

  // Delete dialog state
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('id, question_text, category, created_at, subjects(name)')
      .order('created_at', { ascending: false });

    console.log('Fetched questions raw data:', data);
    if (error) console.error('Fetch questions error:', error);

    if (!error && data) {
      setQuestions(data as any);
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    console.log('handleDelete triggered for ID:', id);
    setQuestionToDelete(id);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;

    console.log('Confirming delete for ID:', questionToDelete);
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current User ID:', user?.id); // Log user for RLS debugging
    setDeleteLoading(true);

    const { data, error, status } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionToDelete)
      .select();

    setDeleteLoading(false);
    console.log('Delete Response:', { data, error, status });

    if (error) {
      console.error('Delete error:', error);
      alert('Failed to delete question: ' + error.message);
    } else if (data && data.length === 0) {
      console.warn('No rows were deleted. This usually means an RLS policy blocked the deletion.');
      alert('Delete failed: You may not have permission to delete this question (RLS policy).');
    } else {
      console.log('Delete successful, affected rows:', data.length);
      setQuestions((prev: Question[]) => prev.filter((q: Question) => q.id !== questionToDelete));
      setDeleteDialogVisible(false);
      setQuestionToDelete(null);
    }
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
    <QuestionItem item={item} onDelete={handleDelete} />
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

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Question</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to delete this question? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete} loading={deleteLoading} textColor="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionInfo: {
    flex: 1,
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
