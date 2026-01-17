import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  HelperText,
  SegmentedButtons,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSignup = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setValidationError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    setValidationError('');

    try {
      await signup(email, password, name, role);
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>
            Create Account
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Join OC Quiz App
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
              />

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
              />

              <Text variant="labelLarge" style={styles.roleLabel}>
                I am a:
              </Text>
              <SegmentedButtons
                value={role}
                onValueChange={(value) => setRole(value as 'student' | 'admin')}
                buttons={[
                  { value: 'student', label: 'Student' },
                  { value: 'admin', label: 'Admin' },
                ]}
                style={styles.segmentedButtons}
              />

              {(validationError || error) && (
                <HelperText type="error" visible={!!(validationError || error)}>
                  {validationError || error}
                </HelperText>
              )}

              <Button
                mode="contained"
                onPress={handleSignup}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
              >
                Sign Up
              </Button>

              <Button
                mode="text"
                onPress={() => router.back()}
                style={styles.linkButton}
              >
                Already have an account? Login
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1976D2',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  roleLabel: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 8,
  },
});

