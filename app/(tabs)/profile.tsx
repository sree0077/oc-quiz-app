import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, Card, Button } from 'react-native-paper';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Text
            size={80}
            label={user?.displayName?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
          <Text variant="headlineMedium" style={styles.name}>
            {user?.displayName || 'User'}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email}
          </Text>
          <Text variant="labelLarge" style={styles.role}>
            {user?.role === 'admin' ? 'Admin' : 'Student'}
          </Text>

          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout"
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    backgroundColor: '#1976D2',
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#757575',
    marginBottom: 8,
  },
  role: {
    color: '#1976D2',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  logoutButton: {
    marginTop: 16,
    paddingHorizontal: 32,
  },
});

