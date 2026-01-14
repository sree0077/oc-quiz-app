import { Camera } from 'react-native-vision-camera';
import { OCRFrame, scanOCR } from 'vision-camera-ocr';
import storage from '@react-native-firebase/storage';
import { Question, AnswerOption } from '../types/quiz.types';
import { STORAGE_PATHS } from '../config/firebase.config';

interface OCRResult {
  fullText: string;
  blocks: string[];
}

interface ParsedQuestion {
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer?: AnswerOption;
}

class OCRService {
  /**
   * Request camera permissions
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const permission = await Camera.requestCameraPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Scan image and extract text using OCR
   */
  async scanImage(imagePath: string): Promise<OCRResult> {
    try {
      // Note: This is a simplified version. In production, you'd process the frame
      // The actual implementation depends on vision-camera-ocr setup
      
      // For now, returning a mock structure
      // In real implementation, you'd use the OCR plugin to scan the image
      const result: OCRResult = {
        fullText: '',
        blocks: [],
      };

      return result;
    } catch (error) {
      console.error('OCR scanning error:', error);
      throw new Error('Failed to scan image');
    }
  }

  /**
   * Parse OCR text into structured question format
   * This uses pattern matching to identify questions and options
   */
  parseQuestionFromText(text: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    
    try {
      // Split text into lines
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      let currentQuestion: Partial<ParsedQuestion> | null = null;
      let questionText = '';
      const options: Partial<Record<AnswerOption, string>> = {};
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect question number patterns (e.g., "1.", "Q1:", "Question 1:")
        const questionPattern = /^(?:Q\.?|Question)?\s*\d+[\.\:\)]\s*(.+)/i;
        const questionMatch = line.match(questionPattern);
        
        if (questionMatch) {
          // Save previous question if exists
          if (currentQuestion && questionText && Object.keys(options).length === 4) {
            questions.push({
              questionText,
              options: options as ParsedQuestion['options'],
            });
          }
          
          // Start new question
          questionText = questionMatch[1];
          Object.keys(options).forEach(key => delete options[key as AnswerOption]);
          currentQuestion = {};
          continue;
        }
        
        // Detect option patterns (e.g., "A)", "a.", "(A)", "A:")
        const optionPattern = /^[\(\[]?([A-Da-d])[\)\]\.\:]\s*(.+)/;
        const optionMatch = line.match(optionPattern);
        
        if (optionMatch && currentQuestion !== null) {
          const optionLetter = optionMatch[1].toUpperCase() as AnswerOption;
          const optionText = optionMatch[2];
          options[optionLetter] = optionText;
          continue;
        }
        
        // If we're in a question and this isn't an option, append to question text
        if (currentQuestion !== null && !optionMatch) {
          questionText += ' ' + line;
        }
      }
      
      // Add last question
      if (currentQuestion && questionText && Object.keys(options).length === 4) {
        questions.push({
          questionText,
          options: options as ParsedQuestion['options'],
        });
      }
      
      return questions;
    } catch (error) {
      console.error('Error parsing questions:', error);
      return [];
    }
  }

  /**
   * Upload scanned image to Firebase Storage
   */
  async uploadScanImage(imagePath: string, fileName: string): Promise<string> {
    try {
      const reference = storage().ref(`${STORAGE_PATHS.OCR_SCANS}/${fileName}`);
      await reference.putFile(imagePath);
      const downloadUrl = await reference.getDownloadURL();
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading scan image:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Process complete OCR workflow: scan, parse, and structure
   */
  async processQuestionScan(
    imagePath: string,
    subjectId: string,
    createdBy: string
  ): Promise<ParsedQuestion[]> {
    try {
      // 1. Scan image with OCR
      const ocrResult = await this.scanImage(imagePath);
      
      // 2. Parse questions from OCR text
      const parsedQuestions = this.parseQuestionFromText(ocrResult.fullText);
      
      if (parsedQuestions.length === 0) {
        throw new Error('No questions found in the scanned image');
      }
      
      return parsedQuestions;
    } catch (error) {
      console.error('Error processing question scan:', error);
      throw error;
    }
  }

  /**
   * Validate parsed question structure
   */
  validateQuestion(question: ParsedQuestion): boolean {
    return !!(
      question.questionText &&
      question.questionText.length > 5 &&
      question.options.A &&
      question.options.B &&
      question.options.C &&
      question.options.D
    );
  }
}

export default new OCRService();

