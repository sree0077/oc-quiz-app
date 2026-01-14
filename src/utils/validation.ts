import { z } from 'zod';
import { VALIDATION } from './constants';

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Password validation
export const passwordSchema = z
  .string()
  .min(VALIDATION.MIN_PASSWORD_LENGTH, `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`);

// Display name validation
export const displayNameSchema = z
  .string()
  .min(VALIDATION.MIN_DISPLAY_NAME_LENGTH, `Name must be at least ${VALIDATION.MIN_DISPLAY_NAME_LENGTH} characters`)
  .max(VALIDATION.MAX_DISPLAY_NAME_LENGTH, `Name must not exceed ${VALIDATION.MAX_DISPLAY_NAME_LENGTH} characters`);

// Question validation
export const questionSchema = z.object({
  questionText: z
    .string()
    .min(5, 'Question must be at least 5 characters')
    .max(VALIDATION.MAX_QUESTION_LENGTH, `Question must not exceed ${VALIDATION.MAX_QUESTION_LENGTH} characters`),
  options: z.object({
    A: z.string().min(1, 'Option A is required').max(VALIDATION.MAX_OPTION_LENGTH),
    B: z.string().min(1, 'Option B is required').max(VALIDATION.MAX_OPTION_LENGTH),
    C: z.string().min(1, 'Option C is required').max(VALIDATION.MAX_OPTION_LENGTH),
    D: z.string().min(1, 'Option D is required').max(VALIDATION.MAX_OPTION_LENGTH),
  }),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic: z.string().optional(),
});

// Subject validation
export const subjectSchema = z.object({
  name: z.string().min(3, 'Subject name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

// Quiz validation
export const quizSchema = z.object({
  title: z.string().min(5, 'Quiz title must be at least 5 characters'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes').max(180, 'Duration cannot exceed 180 minutes'),
  questionCount: z.number().min(5, 'Quiz must have at least 5 questions').max(100, 'Quiz cannot exceed 100 questions'),
});

// Helper functions
export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password: string): boolean => {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';
  
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  
  if (strength <= 1) return 'weak';
  if (strength <= 2) return 'medium';
  return 'strong';
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

