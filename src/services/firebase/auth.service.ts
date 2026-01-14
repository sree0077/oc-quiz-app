import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User, LoginCredentials, RegisterData } from '../../types/user.types';
import { COLLECTIONS } from '../../config/firebase.config';

class AuthService {
  /**
   * Register a new user with email and password
   */
  async register(data: RegisterData): Promise<User> {
    try {
      // Create Firebase Auth user
      const userCredential = await auth().createUserWithEmailAndPassword(
        data.email,
        data.password
      );

      // Update display name
      await userCredential.user.updateProfile({
        displayName: data.displayName,
      });

      // Create user document in Firestore
      const userData: User = {
        userId: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(userCredential.user.uid)
        .set({
          ...userData,
          createdAt: firestore.FieldValue.serverTimestamp(),
          lastLogin: firestore.FieldValue.serverTimestamp(),
        });

      return userData;
    } catch (error: any) {
      throw new Error(this.handleAuthError(error));
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );

      // Update last login
      await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(userCredential.user.uid)
        .update({
          lastLogin: firestore.FieldValue.serverTimestamp(),
        });

      // Fetch user data
      const userDoc = await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(userCredential.user.uid)
        .get();

      if (!userDoc.exists) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data() as User;
      return {
        ...userData,
        createdAt: userData.createdAt,
        lastLogin: new Date(),
      };
    } catch (error: any) {
      throw new Error(this.handleAuthError(error));
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw new Error('Failed to logout');
    }
  }

  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return null;

      const userDoc = await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(currentUser.uid)
        .get();

      if (!userDoc.exists) return null;

      const userData = userDoc.data() as User;
      return userData;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      throw new Error(this.handleAuthError(error));
    }
  }

  /**
   * Handle Firebase Auth errors
   */
  private handleAuthError(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/user-not-found':
        return 'No user found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      default:
        return error.message || 'Authentication failed';
    }
  }
}

export default new AuthService();

