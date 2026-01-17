// Firebase Configuration for Expo
// Replace these values with your actual Firebase project credentials

// NOTE: Firebase Web SDK has compatibility issues with React Native/Expo
// For now, we're using a mock setup. To enable real Firebase:
// 1. Downgrade to firebase@9.x.x OR
// 2. Use @react-native-firebase packages (requires bare workflow) OR
// 3. Wait for Firebase Web SDK v11 with better RN support

// Mock Firebase services for development
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    callback(null);
    return () => {};
  },
} as any;

export const db = {} as any;
export const storage = {} as any;

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

