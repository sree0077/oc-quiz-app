import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    flex: 1,
  };

  return (
    <PaperProvider>
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <View style={styles.container}>
          <Text style={styles.title}>🎓 OC Quiz App</Text>
          <Text style={styles.subtitle}>
            Comprehensive Quiz Application with OCR & Excel Upload
          </Text>
          <View style={styles.featureContainer}>
            <Text style={styles.feature}>✅ Firebase Integration Ready</Text>
            <Text style={styles.feature}>✅ OCR Question Scanning</Text>
            <Text style={styles.feature}>✅ Bulk Excel Upload</Text>
            <Text style={styles.feature}>✅ Real-time Leaderboards</Text>
            <Text style={styles.feature}>✅ Performance Analytics</Text>
          </View>
          <Text style={styles.info}>
            App is ready! Start implementing features from the documentation.
          </Text>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
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
  },
  feature: {
    fontSize: 16,
    marginVertical: 5,
    color: '#4CAF50',
  },
  info: {
    fontSize: 14,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default App;

