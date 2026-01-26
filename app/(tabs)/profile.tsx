import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, List, useTheme, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={session?.user?.email?.substring(0, 2).toUpperCase() || 'US'}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {session?.user?.email}
        </Text>
        <Text variant="bodyMedium" style={styles.role}>Student</Text>
      </View>

      <View style={styles.section}>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Edit Profile"
            left={props => <List.Icon {...props} icon="account-edit" />}
            onPress={() => { }}
          />
          <Divider />
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            onPress={() => { }}
          />
          <Divider />
          <List.Item
            title="Sign Out"
            left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
            titleStyle={{ color: theme.colors.error }}
            onPress={handleSignOut}
          />
        </List.Section>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  name: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  role: {
    opacity: 0.6,
  },
  section: {
    paddingHorizontal: 16,
  },
});
