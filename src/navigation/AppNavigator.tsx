import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

// Main Screens
import { DashboardScreen } from '../screens/DashboardScreen';

// Student Screens
import { QuizScreen } from '../screens/student/QuizScreen';

// Admin Screens
import { BulkUploadScreen } from '../screens/admin/BulkUploadScreen';
import { OCRScanScreen } from '../screens/admin/OCRScanScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { user, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        // Auth Stack
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
      ) : (
        // Main App Stack
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1976D2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{
              title: '🎓 OC Quiz',
              headerShown: true,
            }}
          />
          
          {/* Student Screens */}
          <Stack.Screen 
            name="Quiz" 
            component={QuizScreen}
            options={{
              title: 'Take Quiz',
            }}
          />
          
          {/* Admin Screens */}
          {user.role === 'admin' && (
            <>
              <Stack.Screen 
                name="BulkUpload" 
                component={BulkUploadScreen}
                options={{
                  title: 'Bulk Upload Questions',
                }}
              />
              <Stack.Screen 
                name="OCRScan" 
                component={OCRScanScreen}
                options={{
                  title: 'Scan Questions (OCR)',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

