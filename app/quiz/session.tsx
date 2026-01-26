import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Button, ProgressBar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuizStore } from '../../src/store/quizStore';
import { supabase } from '../../src/config/supabase';
import { useAuthStore } from '../../src/store/authStore';

export default function QuizSessionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const session = useAuthStore(state => state.session);

  const questions = useQuizStore(state => state.questions);
  const currentQuestionIndex = useQuizStore(state => state.currentQuestionIndex);
  const answers = useQuizStore(state => state.answers);
  const submitAnswer = useQuizStore(state => state.submitAnswer);
  const nextQuestion = useQuizStore(state => state.nextQuestion);
  const prevQuestion = useQuizStore(state => state.prevQuestion);
  const finishQuiz = useQuizStore(state => state.finishQuiz);

  const [timeLeft, setTimeLeft] = useState(600);
  const [isFinishing, setIsFinishing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? (currentQuestionIndex + 1) / questions.length : 0;

  useEffect(() => {
    console.log('RE-MOUNTED: Quiz session view. Current Q index:', currentQuestionIndex);
    console.log('Current question object:', currentQuestion);
    console.log('Current question options:', currentQuestion?.options);
    console.log('Questions length:', questions.length);

    if (questions.length === 0) {
      console.log('QuizSession: Store is empty, but session screen is active. This might be a reload.');
      // Keep silent for a sec, if it remains empty then redirect
      const timeout = setTimeout(() => {
        if (useQuizStore.getState().questions.length === 0) {
          router.replace('/(tabs)');
        }
      }, 500);
      return () => clearTimeout(timeout);
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [questions.length]);

  const handleFinishQuiz = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    if (timerRef.current) clearInterval(timerRef.current);

    finishQuiz();
    const finalScore = useQuizStore.getState().score;

    if (session?.user) {
      try {
        await supabase.from('quiz_attempts').insert({
          user_id: session.user.id,
          score: finalScore,
          total_questions: questions.length,
        });
      } catch (err) {
        console.error('QuizSession: Result persistence failed:', err);
      }
    }
    router.replace('/quiz/results');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentQuestion) {
    return (
      <View style={[styles.simpleCentered, { backgroundColor: '#fff' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading Question...</Text>
      </View>
    );
  }

  if (!currentQuestion.options || currentQuestion.options.length === 0) {
    return (
      <View style={[styles.simpleCentered, { backgroundColor: '#fff' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Question has no options</Text>
        <Text style={{ fontSize: 14, color: '#999', marginTop: 10 }}>Debug: {JSON.stringify(currentQuestion, null, 2)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Header (Always Top) */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Q {currentQuestionIndex + 1} / {questions.length}</Text>
        <Text style={[styles.timerText, timeLeft < 60 && { color: 'red' }]}>{formatTime(timeLeft)}</Text>
      </View>

      <ProgressBar
        progress={progress}
        color={theme.colors.primary}
        style={styles.progressBar}
      />

      {/* 2. Middle Block: Using a fixed container wrapper to stop web collapse */}
      <View style={styles.mainScrollWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled={true}
        >
          {/* Question Title */}
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>
              {currentQuestion.question_text}
            </Text>
          </View>

          {/* Options List */}
          <View style={styles.optionsBox}>
            {console.log('Rendering', currentQuestion.options?.length, 'options')}
            {currentQuestion.options && currentQuestion.options.map((option, idx) => {
              console.log(`Rendering option ${idx}:`, option);
              return (
                <TouchableOpacity
                  key={`opt-${currentQuestion.id}-${idx}`}
                  onPress={() => submitAnswer(idx)}
                  activeOpacity={0.8}
                  style={[
                    styles.optionBtn,
                    answers[currentQuestionIndex] === idx && styles.optionBtnSelected
                  ]}
                >
                  <View style={[
                    styles.radio,
                    answers[currentQuestionIndex] === idx && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary }
                  ]} />
                  <Text style={[
                    styles.optionText,
                    answers[currentQuestionIndex] === idx && { fontWeight: 'bold' }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 3. Footer (Always Bottom) */}
      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={prevQuestion}
          disabled={currentQuestionIndex === 0}
          textColor="#666"
          style={styles.navBtn}
        >
          Previous
        </Button>
        <Button
          mode="contained"
          onPress={() => {
            if (currentQuestionIndex === questions.length - 1) {
              handleFinishQuiz();
            } else {
              nextQuestion();
            }
          }}
          buttonColor={theme.colors.primary}
          style={styles.navBtn}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
    marginTop: Platform.OS === 'ios' ? 40 : 0,
    flexShrink: 0,
  },
  headerText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  timerText: {
    fontSize: 18,
    color: '#d97757',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    flexShrink: 0,
  },
  mainScrollWrapper: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  questionBox: {
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    lineHeight: 32,
    textAlign: 'center',
  },
  optionsBox: {
    paddingTop: 10,
  },
  optionBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    // Shadow for web/ios/android
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 2 }
    }),
  },
  optionBtnSelected: {
    borderColor: '#d97757',
    borderWidth: 2,
    backgroundColor: '#fff9f7',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 15,
  },
  optionText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  footer: {
    height: 80,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    flexShrink: 0,
  },
  navBtn: {
    minWidth: 120,
    borderRadius: 8,
  },
  simpleCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
