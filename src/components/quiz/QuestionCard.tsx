import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, RadioButton } from 'react-native-paper';
import { Question, AnswerOption } from '../../types/quiz.types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: AnswerOption | null;
  onAnswerSelect: (answer: AnswerOption) => void;
  showCorrectAnswer?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showCorrectAnswer = false,
}) => {
  const getOptionStyle = (option: AnswerOption) => {
    if (!showCorrectAnswer) {
      return selectedAnswer === option ? styles.selectedOption : styles.option;
    }

    // Show correct/incorrect in review mode
    if (option === question.correctAnswer) {
      return styles.correctOption;
    }
    if (selectedAnswer === option && option !== question.correctAnswer) {
      return styles.incorrectOption;
    }
    return styles.option;
  };

  const getOptionTextStyle = (option: AnswerOption) => {
    if (!showCorrectAnswer) {
      return selectedAnswer === option ? styles.selectedOptionText : styles.optionText;
    }

    if (option === question.correctAnswer) {
      return styles.correctOptionText;
    }
    if (selectedAnswer === option && option !== question.correctAnswer) {
      return styles.incorrectOptionText;
    }
    return styles.optionText;
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Question Header */}
        <View style={styles.header}>
          <Text style={styles.questionNumber}>
            Question {questionNumber} of {totalQuestions}
          </Text>
          {question.difficulty && (
            <View style={[styles.difficultyBadge, styles[`${question.difficulty}Badge`]]}>
              <Text style={styles.difficultyText}>
                {question.difficulty.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Question Text */}
        <Text style={styles.questionText}>{question.questionText}</Text>

        {/* Question Image (if exists) */}
        {question.imageUrl && (
          <Image
            source={{ uri: question.imageUrl }}
            style={styles.questionImage}
            resizeMode="contain"
          />
        )}

        {/* Options */}
        <View style={styles.optionsContainer}>
          {(['A', 'B', 'C', 'D'] as AnswerOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={getOptionStyle(option)}
              onPress={() => !showCorrectAnswer && onAnswerSelect(option)}
              disabled={showCorrectAnswer}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLabel}>
                  <Text style={getOptionTextStyle(option)}>{option}</Text>
                </View>
                <Text style={[styles.optionText, getOptionTextStyle(option)]}>
                  {question.options[option]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Topic (if exists) */}
        {question.topic && (
          <Text style={styles.topic}>Topic: {question.topic}</Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  easyBadge: {
    backgroundColor: '#4CAF50',
  },
  mediumBadge: {
    backgroundColor: '#FF9800',
  },
  hardBadge: {
    backgroundColor: '#F44336',
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
    lineHeight: 26,
  },
  questionImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  optionsContainer: {
    marginTop: 8,
  },
  option: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#1976D2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#E3F2FD',
  },
  correctOption: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#E8F5E9',
  },
  incorrectOption: {
    borderWidth: 2,
    borderColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFEBEE',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#424242',
    flex: 1,
  },
  selectedOptionText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
    flex: 1,
  },
  correctOptionText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
    flex: 1,
  },
  incorrectOptionText: {
    fontSize: 16,
    color: '#C62828',
    fontWeight: '600',
    flex: 1,
  },
  topic: {
    fontSize: 12,
    color: '#757575',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

