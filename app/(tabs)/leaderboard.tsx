import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Avatar, useTheme, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../../src/config/supabase';

type LeaderboardEntry = {
  id: string; // attempt id (or user id if aggregating)
  score: number;
  created_at: string;
  user: {
    email: string;
  };
};

export default function LeaderboardScreen() {
  const theme = useTheme();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // For MVP: Fetch top 50 quiz attempts. 
  // Ideally, you'd aggregate by User ID (SUM of scores or AVG), but that requires a View or RP call in Supabase
  // Let's just show top individual quiz scores for now.
  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select(`
        id, 
        score, 
        created_at,
        profiles:user_id (email)
      `)
      .order('score', { ascending: false })
      .limit(20);

    if (!error && attempts) {
      // Flattens the response
      const formatted = attempts.map((a: any) => ({
        id: a.id,
        score: a.score,
        created_at: a.created_at,
        user: { email: a.profiles?.email || 'Unknown' }
      }));
      setData(formatted);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <View style={styles.rankContainer}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', color: index < 3 ? theme.colors.primary : theme.colors.secondary }}>
            #{index + 1}
          </Text>
        </View>
        <Avatar.Text
          size={40}
          label={item.user.email.substring(0, 2).toUpperCase()}
          style={{ backgroundColor: index < 3 ? theme.colors.tertiary : theme.colors.surfaceVariant, marginRight: 16 }}
          color={index < 3 ? theme.colors.onTertiary : theme.colors.onSurfaceVariant}
        />
        <View style={styles.info}>
          <Text variant="bodyLarge" style={{ fontWeight: '500' }}>{item.user.email.split('@')[0]}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
          {item.score}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={{ color: theme.colors.primary, textAlign: 'center' }}>Leaderboard</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No scores yet. Be the first!</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 8,
  },
  info: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
});
