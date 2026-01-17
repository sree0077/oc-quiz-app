import { auth, db } from '../../config/firebase.config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User, LoginCredentials, RegisterData } from '../../types/user.types';
import { COLLECTIONS } from '../../config/firebase.config';

class AuthService {
  /**
   * Register a new user with email and password
   */
  async register(data: RegisterData): Promise<User> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: data.displayName,
      });

      // Create user document in Firestore
      const userData: User = {
        userId: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        totalScore: 0,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), userData);

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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Update last login
      await updateDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
        lastLogin: new Date(),
      });

      // Fetch user data
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid));

      if (!userDoc.exists()) {
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
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Failed to logout');
    }
  }

  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, currentUser.uid));

      if (!userDoc.exists()) return null;

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
      await sendPasswordResetEmail(auth, email);
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

