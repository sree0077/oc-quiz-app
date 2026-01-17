import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  // Redirect based on auth state
  if (user) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
