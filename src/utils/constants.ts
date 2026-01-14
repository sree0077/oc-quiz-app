// App Constants

export const APP_NAME = 'Quiz App';
export const APP_VERSION = '1.0.0';

// Quiz Settings
export const QUIZ_SETTINGS = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 100,
  DEFAULT_DURATION: 30, // minutes
  MIN_DURATION: 5,
  MAX_DURATION: 180,
  PASSING_SCORE: 60, // percentage
};

// Pagination
export const PAGINATION = {
  QUESTIONS_PER_PAGE: 20,
  ATTEMPTS_PER_PAGE: 20,
  LEADERBOARD_SIZE: 50,
};

// Timer Settings
export const TIMER = {
  WARNING_THRESHOLD: 300, // 5 minutes in seconds
  CRITICAL_THRESHOLD: 60, // 1 minute in seconds
};

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_QUESTION_LENGTH: 500,
  MAX_OPTION_LENGTH: 200,
  MIN_DISPLAY_NAME_LENGTH: 3,
  MAX_DISPLAY_NAME_LENGTH: 50,
};

// Colors
export const COLORS = {
  PRIMARY: '#1976D2',
  SECONDARY: '#424242',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
  
  // Difficulty colors
  EASY: '#4CAF50',
  MEDIUM: '#FF9800',
  HARD: '#F44336',
  
  // Background
  BACKGROUND: '#F5F5F5',
  SURFACE: '#FFFFFF',
  
  // Text
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
  TEXT_DISABLED: '#BDBDBD',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  QUIZ_SUBMITTED: 'Quiz submitted successfully!',
  QUESTION_ADDED: 'Question added successfully!',
  SUBJECT_CREATED: 'Subject created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  CACHED_QUIZZES: 'cached_quizzes',
  PENDING_ATTEMPTS: 'pending_attempts',
  OFFLINE_MODE: 'offline_mode',
};

// API Timeouts
export const TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 60000, // 60 seconds
  DOWNLOAD: 60000,
};

