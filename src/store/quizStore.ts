import { create } from 'zustand';
import { Quiz, Question, QuizState, AnswerOption } from '../types/quiz.types';

interface QuizStore extends QuizState {
  setQuiz: (quiz: Quiz, questions: Question[]) => void;
  setAnswer: (questionId: string, answer: AnswerOption) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  updateTimeRemaining: (time: number) => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  currentQuiz: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: new Map(),
  timeRemaining: 0,
  isSubmitted: false,

  setQuiz: (quiz, questions) =>
    set({
      currentQuiz: quiz,
      questions,
      currentQuestionIndex: 0,
      answers: new Map(),
      timeRemaining: quiz.duration * 60, // Convert minutes to seconds
      isSubmitted: false,
    }),

  setAnswer: (questionId, answer) =>
    set((state) => {
      const newAnswers = new Map(state.answers);
      newAnswers.set(questionId, answer);
      return { answers: newAnswers };
    }),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        state.questions.length - 1
      ),
    })),

  previousQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),

  goToQuestion: (index) =>
    set((state) => ({
      currentQuestionIndex: Math.max(
        0,
        Math.min(index, state.questions.length - 1)
      ),
    })),

  updateTimeRemaining: (time) => set({ timeRemaining: time }),

  submitQuiz: () => set({ isSubmitted: true }),

  resetQuiz: () =>
    set({
      currentQuiz: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: new Map(),
      timeRemaining: 0,
      isSubmitted: false,
    }),
}));

