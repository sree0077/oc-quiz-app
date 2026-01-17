import { create } from 'zustand';
import { User, AuthState } from '../types/user.types';
import { auth, db } from '../config/firebase.config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, role: 'student' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, displayName: string, role: 'student' | 'admin') => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document in Firestore
      const newUser: User = {
        userId: userCredential.user.uid,
        email,
        displayName,
        role,
        totalScore: 0,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);

      set({
        user: newUser,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  initAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          set({ isLoading: false });
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });
  },
}));

