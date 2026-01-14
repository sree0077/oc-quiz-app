export type AnswerOption = 'A' | 'B' | 'C' | 'D';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionSource = 'manual' | 'ocr' | 'excel';

export interface Subject {
  subjectId: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  questionCount: number;
  isActive: boolean;
}

export interface Question {
  questionId: string;
  subjectId: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: AnswerOption;
  difficulty: Difficulty;
  topic?: string;
  createdBy: string;
  createdAt: Date;
  source: QuestionSource;
  imageUrl?: string;
}

export interface Quiz {
  quizId: string;
  subjectId: string;
  title: string;
  duration: number; // in minutes
  questionCount: number;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  questions: string[]; // questionIds
}

export interface QuestionAnswer {
  questionId: string;
  selectedAnswer: AnswerOption | null;
  isCorrect: boolean;
  timeTaken: number; // in seconds
}

export interface QuizAttempt {
  attemptId: string;
  userId: string;
  quizId: string;
  subjectId: string;
  startedAt: Date;
  completedAt: Date;
  duration: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: QuestionAnswer[];
}

export interface QuizState {
  currentQuiz: Quiz | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Map<string, AnswerOption>;
  timeRemaining: number;
  isSubmitted: boolean;
}

export interface LeaderboardEntry {
  leaderboardId: string;
  subjectId: string;
  userId: string;
  displayName: string;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  totalCorrect: number;
  totalQuestions: number;
  lastAttemptAt: Date;
  rank?: number;
}

export interface PerformanceAnalytics {
  userId: string;
  subjectId: string;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  topicPerformance: {
    topic: string;
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
  }[];
  difficultyPerformance: {
    difficulty: Difficulty;
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
  }[];
  recentAttempts: QuizAttempt[];
}

