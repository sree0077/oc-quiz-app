import { storage } from '../config/firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
   * Scan image and extract text using OCR
   * Note: This is a placeholder. For production, integrate with:
   * - Google Cloud Vision API
   * - AWS Textract
   * - Azure Computer Vision
   * - Or use expo-image-manipulator with a third-party OCR service
   */
  async scanImage(imagePath: string): Promise<OCRResult> {
    try {
      // TODO: Implement actual OCR using a cloud service
      // For now, returning a mock structure for development

      console.log('OCR scanning image:', imagePath);

      // Mock result - replace with actual OCR API call
      const result: OCRResult = {
        fullText: 'Sample question text from OCR\n(A) Option A\n(B) Option B\n(C) Option C\n(D) Option D',
        blocks: [
          'Sample question text from OCR',
          '(A) Option A',
          '(B) Option B',
          '(C) Option C',
          '(D) Option D'
        ],
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
      // Fetch the image as a blob
      const response = await fetch(imagePath);
      const blob = await response.blob();

      // Create storage reference
      const storageRef = ref(storage, `${STORAGE_PATHS.OCR_SCANS}/${fileName}`);

      // Upload the blob
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
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

