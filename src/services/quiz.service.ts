import firestore from '@react-native-firebase/firestore';
import { Quiz, Question, QuizAttempt, QuestionAnswer, AnswerOption } from '../types/quiz.types';
import { COLLECTIONS } from '../config/firebase.config';

class QuizService {
  /**
   * Get all quizzes for a subject
   */
  async getQuizzesBySubject(subjectId: string): Promise<Quiz[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.QUIZZES)
        .where('subjectId', '==', subjectId)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        quizId: doc.id,
        createdAt: doc.data().createdAt?.toDate(),
      })) as Quiz[];
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw new Error('Failed to fetch quizzes');
    }
  }

  /**
   * Get questions for a quiz
   */
  async getQuizQuestions(questionIds: string[]): Promise<Question[]> {
    try {
      if (questionIds.length === 0) return [];

      // Firestore 'in' query supports max 10 items, so we need to batch
      const batches: string[][] = [];
      for (let i = 0; i < questionIds.length; i += 10) {
        batches.push(questionIds.slice(i, i + 10));
      }

      const allQuestions: Question[] = [];

      for (const batch of batches) {
        const snapshot = await firestore()
          .collection(COLLECTIONS.QUESTIONS)
          .where(firestore.FieldPath.documentId(), 'in', batch)
          .get();

        const questions = snapshot.docs.map(doc => ({
          ...doc.data(),
          questionId: doc.id,
          createdAt: doc.data().createdAt?.toDate(),
        })) as Question[];

        allQuestions.push(...questions);
      }

      // Maintain original order
      return questionIds
        .map(id => allQuestions.find(q => q.questionId === id))
        .filter(Boolean) as Question[];
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new Error('Failed to fetch questions');
    }
  }

  /**
   * Calculate quiz score
   */
  calculateScore(
    questions: Question[],
    answers: Map<string, AnswerOption>
  ): { score: number; correctAnswers: number; questionAnswers: QuestionAnswer[] } {
    let correctAnswers = 0;
    const questionAnswers: QuestionAnswer[] = [];

    questions.forEach(question => {
      const selectedAnswer = answers.get(question.questionId) || null;
      const isCorrect = selectedAnswer === question.correctAnswer;

      if (isCorrect) {
        correctAnswers++;
      }

      questionAnswers.push({
        questionId: question.questionId,
        selectedAnswer,
        isCorrect,
        timeTaken: 0, // This should be tracked during quiz
      });
    });

    const score = (correctAnswers / questions.length) * 100;

    return {
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      correctAnswers,
      questionAnswers,
    };
  }

  /**
   * Submit quiz attempt
   */
  async submitQuizAttempt(
    userId: string,
    quiz: Quiz,
    questions: Question[],
    answers: Map<string, AnswerOption>,
    startTime: Date,
    endTime: Date
  ): Promise<QuizAttempt> {
    try {
      const { score, correctAnswers, questionAnswers } = this.calculateScore(
        questions,
        answers
      );

      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      const attemptData: Omit<QuizAttempt, 'attemptId'> = {
        userId,
        quizId: quiz.quizId,
        subjectId: quiz.subjectId,
        startedAt: startTime,
        completedAt: endTime,
        duration,
        score,
        totalQuestions: questions.length,
        correctAnswers,
        answers: questionAnswers,
      };

      const docRef = await firestore()
        .collection(COLLECTIONS.QUIZ_ATTEMPTS)
        .add({
          ...attemptData,
          startedAt: firestore.Timestamp.fromDate(startTime),
          completedAt: firestore.Timestamp.fromDate(endTime),
        });

      // Update leaderboard
      await this.updateLeaderboard(userId, quiz.subjectId, score, correctAnswers, questions.length);

      return {
        ...attemptData,
        attemptId: docRef.id,
      };
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw new Error('Failed to submit quiz');
    }
  }

  /**
   * Update leaderboard after quiz attempt
   */
  private async updateLeaderboard(
    userId: string,
    subjectId: string,
    score: number,
    correctAnswers: number,
    totalQuestions: number
  ): Promise<void> {
    try {
      const leaderboardRef = firestore()
        .collection(COLLECTIONS.LEADERBOARD)
        .doc(`${userId}_${subjectId}`);

      const doc = await leaderboardRef.get();

      if (doc.exists) {
        const data = doc.data()!;
        const newTotalAttempts = data.totalAttempts + 1;
        const newTotalCorrect = data.totalCorrect + correctAnswers;
        const newTotalQuestions = data.totalQuestions + totalQuestions;
        const newAverageScore = (newTotalCorrect / newTotalQuestions) * 100;

        await leaderboardRef.update({
          totalAttempts: newTotalAttempts,
          averageScore: newAverageScore,
          bestScore: Math.max(data.bestScore, score),
          totalCorrect: newTotalCorrect,
          totalQuestions: newTotalQuestions,
          lastAttemptAt: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Create new leaderboard entry
        await leaderboardRef.set({
          leaderboardId: leaderboardRef.id,
          subjectId,
          userId,
          displayName: '', // Should be fetched from user data
          totalAttempts: 1,
          averageScore: score,
          bestScore: score,
          totalCorrect: correctAnswers,
          totalQuestions: totalQuestions,
          lastAttemptAt: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      // Don't throw error here, leaderboard update is not critical
    }
  }

  /**
   * Get user's quiz history
   */
  async getUserQuizHistory(userId: string, limit: number = 20): Promise<QuizAttempt[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.QUIZ_ATTEMPTS)
        .where('userId', '==', userId)
        .orderBy('completedAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        attemptId: doc.id,
        startedAt: doc.data().startedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as QuizAttempt[];
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      throw new Error('Failed to fetch quiz history');
    }
  }
}

export default new QuizService();

