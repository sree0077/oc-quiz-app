// Firebase Configuration for Expo
// Replace these values with your actual Firebase project credentials
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  SUBJECTS: 'subjects',
  QUESTIONS: 'questions',
  QUIZZES: 'quizzes',
  QUIZ_ATTEMPTS: 'quizAttempts',
  LEADERBOARD: 'leaderboard',
} as const;

// Firebase Storage Paths
export const STORAGE_PATHS = {
  QUESTION_IMAGES: 'questions/images',
  OCR_SCANS: 'ocr/scans',
  PROFILE_IMAGES: 'users/profiles',
} as const;

