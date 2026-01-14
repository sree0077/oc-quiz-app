import { create } from 'zustand';
import { Subject } from '../types/quiz.types';

interface SubjectStore {
  subjects: Subject[];
  selectedSubject: Subject | null;
  isLoading: boolean;
  error: string | null;
  setSubjects: (subjects: Subject[]) => void;
  setSelectedSubject: (subject: Subject | null) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (subjectId: string, updates: Partial<Subject>) => void;
  deleteSubject: (subjectId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSubjectStore = create<SubjectStore>((set) => ({
  subjects: [],
  selectedSubject: null,
  isLoading: false,
  error: null,

  setSubjects: (subjects) => set({ subjects, isLoading: false }),

  setSelectedSubject: (subject) => set({ selectedSubject: subject }),

  addSubject: (subject) =>
    set((state) => ({
      subjects: [...state.subjects, subject],
    })),

  updateSubject: (subjectId, updates) =>
    set((state) => ({
      subjects: state.subjects.map((subject) =>
        subject.subjectId === subjectId ? { ...subject, ...updates } : subject
      ),
    })),

  deleteSubject: (subjectId) =>
    set((state) => ({
      subjects: state.subjects.filter(
        (subject) => subject.subjectId !== subjectId
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),
}));

