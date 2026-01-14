import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { QuestionCard } from '../../components/quiz/QuestionCard';
import { Timer } from '../../components/quiz/Timer';
import { useQuizStore } from '../../store/quizStore';
import { useAuthStore } from '../../store/authStore';
import quizService from '../../services/quiz.service';
import { AnswerOption } from '../../types/quiz.types';

export const QuizScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quizId } = route.params as { quizId: string };

  const { user } = useAuthStore();
  const {
    currentQuiz,
    questions,
    currentQuestionIndex,
    answers,
    timeRemaining,
    setQuiz,
    setAnswer,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
  } = useQuizStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());

  // Load quiz data
  useEffect(() => {
    loadQuiz();
    return () => {
      resetQuiz();
    };
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      // In real implementation, fetch quiz by ID
      // const quiz = await quizService.getQuizById(quizId);
      // const quizQuestions = await quizService.getQuizQuestions(quiz.questions);
      // setQuiz(quiz, quizQuestions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Error', 'Failed to load quiz');
      navigation.goBack();
    }
  };

  const handleAnswerSelect = (answer: AnswerOption) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswer(currentQuestion.questionId, answer);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion();
    }
  };

  const handleSubmit = () => {
    const unansweredCount = questions.length - answers.size;
    
    if (unansweredCount > 0) {
      Alert.alert(
        'Incomplete Quiz',
        `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: confirmSubmit },
        ]
      );
    } else {
      confirmSubmit();
    }
  };

  const confirmSubmit = async () => {
    if (!user || !currentQuiz) return;

    try {
      setIsSubmitting(true);
      const endTime = new Date();
      
      const attempt = await quizService.submitQuizAttempt(
        user.userId,
        currentQuiz,
        questions,
        answers,
        startTime,
        endTime
      );

      submitQuiz();
      
      // Navigate to results screen
      navigation.navigate('Result', { attemptId: attempt.attemptId });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    Alert.alert(
      'Time Up!',
      'Your time is up. The quiz will be submitted automatically.',
      [{ text: 'OK', onPress: confirmSubmit }]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!currentQuiz || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers.get(currentQuestion.questionId) || null;
  const progress = (currentQuestionIndex + 1) / questions.length;

  return (
    <View style={styles.container}>
      {/* Header with Timer and Progress */}
      <View style={styles.header}>
        <Timer
          duration={currentQuiz.duration * 60}
          onTimeUp={handleTimeUp}
          autoStart={true}
        />
        <ProgressBar progress={progress} style={styles.progressBar} />
      </View>

      {/* Question */}
      <ScrollView style={styles.content}>
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
        />
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={styles.button}
        >
          Previous
        </Button>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.button}
          >
            Next
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    elevation: 4,
  },
  progressBar: {
    marginTop: 12,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

