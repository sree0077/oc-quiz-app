import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Text, FAB, Avatar, IconButton, Button } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';

interface Subject {
  id: string;
  name: string;
  icon: string;
  quizCount: number;
}

export const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation();
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    // Mock data - replace with Firebase fetch
    setSubjects([
      { id: '1', name: 'Mathematics', icon: 'calculator', quizCount: 12 },
      { id: '2', name: 'Science', icon: 'flask', quizCount: 8 },
      { id: '3', name: 'History', icon: 'book-open-variant', quizCount: 6 },
      { id: '4', name: 'English', icon: 'text', quizCount: 10 },
    ]);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const renderSubject = ({ item }: { item: Subject }) => (
    <Card 
      style={styles.card}
      onPress={() => navigation.navigate('SubjectQuizzes' as never, { subjectId: item.id } as never)}
    >
      <Card.Content style={styles.cardContent}>
        <Avatar.Icon size={48} icon={item.icon} style={styles.avatar} />
        <View style={styles.cardText}>
          <Text variant="titleMedium">{item.name}</Text>
          <Text variant="bodySmall" style={styles.quizCount}>
            {item.quizCount} quizzes available
          </Text>
        </View>
        <IconButton icon="chevron-right" size={24} />
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall">Welcome back,</Text>
          <Text variant="titleLarge" style={styles.userName}>
            {user?.displayName || 'User'}
          </Text>
        </View>
        <IconButton icon="logout" size={24} onPress={handleLogout} />
      </View>

      {/* Stats Card */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.statsTitle}>
            Your Progress
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                24
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Quizzes Taken
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                85%
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Avg Score
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                #12
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Rank
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Subjects List */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Subjects
      </Text>
      
      <FlatList
        data={subjects}
        renderItem={renderSubject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Admin FAB */}
      {user?.role === 'admin' && (
        <FAB.Group
          open={false}
          visible
          icon="plus"
          actions={[
            {
              icon: 'camera',
              label: 'Scan Questions (OCR)',
              onPress: () => navigation.navigate('OCRScan' as never),
            },
            {
              icon: 'file-upload',
              label: 'Bulk Upload',
              onPress: () => navigation.navigate('BulkUpload' as never),
            },
            {
              icon: 'plus-circle',
              label: 'Create Question',
              onPress: () => navigation.navigate('CreateQuestion' as never),
            },
          ]}
          onStateChange={() => {}}
          style={styles.fab}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  userName: {
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statsCard: {
    margin: 16,
    elevation: 2,
  },
  statsTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#1976D2',
  },
  cardText: {
    flex: 1,
    marginLeft: 16,
  },
  quizCount: {
    color: '#666',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

