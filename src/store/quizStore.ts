import { create } from 'zustand';

export type Subject = {
  id: string;
  name: string;
  creator_id: string;
};

export type Question = {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  category: string;
  subject_id?: string;
};

interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: number[]; // Index of selected option for each question (-1 if skipped)
  score: number;
  startTime: number | null;
  endTime: number | null;

  startQuiz: (questions: Question[]) => void;
  submitAnswer: (answerIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  startTime: null,
  endTime: null,

  startQuiz: (questions) => {
    console.log('QuizStore.startQuiz called with questions:', questions);
    console.log('Questions count:', questions.length);
    set({
      questions,
      currentQuestionIndex: 0,
      answers: new Array(questions.length).fill(-1),
      score: 0,
      startTime: Date.now(),
      endTime: null,
    });
    console.log('QuizStore state updated');
  },

  submitAnswer: (answerIndex) => {
    const { answers, currentQuestionIndex } = get();
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    set({ answers: newAnswers });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  finishQuiz: () => {
    const { questions, answers } = get();
    let score = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_option_index) {
        score++;
      }
    });
    set({ score, endTime: Date.now() });
  },

  resetQuiz: () => {
    set({
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      score: 0,
      startTime: null,
      endTime: null,
    });
  },
}));
