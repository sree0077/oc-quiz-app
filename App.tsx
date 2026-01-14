import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    flex: 1,
  };

  return (
    <PaperProvider>
      <SafeAreaView style={backgroundStyle}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
              🎓 OC Quiz App
            </Text>
            <Text style={styles.subtitle}>
              Comprehensive Quiz Application with OCR & Excel Upload
            </Text>
            <View style={styles.featureContainer}>
              <Text style={styles.feature}>✅ Expo Managed Workflow</Text>
              <Text style={styles.feature}>✅ Firebase Integration Ready</Text>
              <Text style={styles.feature}>✅ OCR Question Scanning</Text>
              <Text style={styles.feature}>✅ Bulk Excel Upload</Text>
              <Text style={styles.feature}>✅ Real-time Leaderboards</Text>
              <Text style={styles.feature}>✅ Performance Analytics</Text>
              <Text style={styles.feature}>✅ Expo Go Compatible</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>🚀 Ready to Start!</Text>
              <Text style={styles.info}>
                Run "npm start" and scan the QR code with Expo Go app
              </Text>
              <Text style={styles.info}>
                All features are ready for development
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  featureContainer: {
    marginVertical: 20,
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
  },
  feature: {
    fontSize: 16,
    marginVertical: 5,
    color: '#4CAF50',
    fontWeight: '500',
  },
  infoBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#856404',
    marginTop: 5,
    textAlign: 'center',
  },
});

