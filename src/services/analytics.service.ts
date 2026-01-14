import firestore from '@react-native-firebase/firestore';
import { PerformanceAnalytics, QuizAttempt, Difficulty } from '../types/quiz.types';
import { COLLECTIONS } from '../config/firebase.config';

class AnalyticsService {
  /**
   * Get comprehensive performance analytics for a user
   */
  async getUserAnalytics(
    userId: string,
    subjectId: string
  ): Promise<PerformanceAnalytics> {
    try {
      // Fetch all attempts for this user and subject
      const attemptsSnapshot = await firestore()
        .collection(COLLECTIONS.QUIZ_ATTEMPTS)
        .where('userId', '==', userId)
        .where('subjectId', '==', subjectId)
        .orderBy('completedAt', 'desc')
        .limit(50)
        .get();

      const attempts = attemptsSnapshot.docs.map(doc => ({
        ...doc.data(),
        attemptId: doc.id,
        startedAt: doc.data().startedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as QuizAttempt[];

      if (attempts.length === 0) {
        return this.getEmptyAnalytics(userId, subjectId);
      }

      // Calculate basic statistics
      const scores = attempts.map(a => a.score);
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const bestScore = Math.max(...scores);
      const worstScore = Math.min(...scores);

      // Calculate topic-wise performance
      const topicPerformance = await this.calculateTopicPerformance(attempts);

      // Calculate difficulty-wise performance
      const difficultyPerformance = await this.calculateDifficultyPerformance(attempts);

      return {
        userId,
        subjectId,
        totalAttempts: attempts.length,
        averageScore,
        bestScore,
        worstScore,
        topicPerformance,
        difficultyPerformance,
        recentAttempts: attempts.slice(0, 10),
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }

  /**
   * Calculate performance by topic
   */
  private async calculateTopicPerformance(attempts: QuizAttempt[]) {
    const topicStats: Record<string, { correct: number; total: number }> = {};

    // Aggregate answers by topic
    for (const attempt of attempts) {
      for (const answer of attempt.answers) {
        // Fetch question to get topic
        const questionDoc = await firestore()
          .collection(COLLECTIONS.QUESTIONS)
          .doc(answer.questionId)
          .get();

        if (questionDoc.exists) {
          const topic = questionDoc.data()?.topic || 'General';
          
          if (!topicStats[topic]) {
            topicStats[topic] = { correct: 0, total: 0 };
          }

          topicStats[topic].total++;
          if (answer.isCorrect) {
            topicStats[topic].correct++;
          }
        }
      }
    }

    // Convert to array format
    return Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      correctAnswers: stats.correct,
      totalQuestions: stats.total,
      accuracy: (stats.correct / stats.total) * 100,
    }));
  }

  /**
   * Calculate performance by difficulty
   */
  private async calculateDifficultyPerformance(attempts: QuizAttempt[]) {
    const difficultyStats: Record<Difficulty, { correct: number; total: number }> = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    // Aggregate answers by difficulty
    for (const attempt of attempts) {
      for (const answer of attempt.answers) {
        // Fetch question to get difficulty
        const questionDoc = await firestore()
          .collection(COLLECTIONS.QUESTIONS)
          .doc(answer.questionId)
          .get();

        if (questionDoc.exists) {
          const difficulty = questionDoc.data()?.difficulty || 'medium';
          
          difficultyStats[difficulty as Difficulty].total++;
          if (answer.isCorrect) {
            difficultyStats[difficulty as Difficulty].correct++;
          }
        }
      }
    }

    // Convert to array format
    return Object.entries(difficultyStats).map(([difficulty, stats]) => ({
      difficulty: difficulty as Difficulty,
      correctAnswers: stats.correct,
      totalQuestions: stats.total,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    }));
  }

  /**
   * Get empty analytics object
   */
  private getEmptyAnalytics(userId: string, subjectId: string): PerformanceAnalytics {
    return {
      userId,
      subjectId,
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      topicPerformance: [],
      difficultyPerformance: [
        { difficulty: 'easy', correctAnswers: 0, totalQuestions: 0, accuracy: 0 },
        { difficulty: 'medium', correctAnswers: 0, totalQuestions: 0, accuracy: 0 },
        { difficulty: 'hard', correctAnswers: 0, totalQuestions: 0, accuracy: 0 },
      ],
      recentAttempts: [],
    };
  }

  /**
   * Get progress over time
   */
  async getProgressOverTime(userId: string, subjectId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const snapshot = await firestore()
        .collection(COLLECTIONS.QUIZ_ATTEMPTS)
        .where('userId', '==', userId)
        .where('subjectId', '==', subjectId)
        .where('completedAt', '>=', firestore.Timestamp.fromDate(startDate))
        .orderBy('completedAt', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        date: doc.data().completedAt?.toDate(),
        score: doc.data().score,
      }));
    } catch (error) {
      console.error('Error fetching progress:', error);
      return [];
    }
  }
}

export default new AnalyticsService();

