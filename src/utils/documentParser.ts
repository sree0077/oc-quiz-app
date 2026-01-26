import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import { Platform } from 'react-native';

export type ParsedQuestion = {
  question_text: string;
  options: string[];
  correct_option_index: number;
  category: string;
};

export const parseExcelFile = async (uri: string): Promise<ParsedQuestion[]> => {
  try {
    let b64 = '';

    if (Platform.OS === 'web') {
      // On web, fetch the blob
      const res = await fetch(uri);
      const blob = await res.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          resolve(normalizeData(jsonData));
        };
        reader.onerror = reject;
        reader.readAsBinaryString(blob);
      });

    } else {
      // On mobile, read as base64
      b64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const workbook = XLSX.read(b64, { type: 'base64' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      return normalizeData(jsonData);
    }

  } catch (error) {
    console.error('Error parsing excel:', error);
    throw new Error('Failed to parse file');
  }
};

const normalizeData = (data: any[]): ParsedQuestion[] => {
  // Expected format: Question, Option1, Option2, Option3, Option4, CorrectIndex (0-3), Category
  return data.map((row: any) => ({
    question_text: row.Question || row.question || '',
    options: [
      row.Option1 || row.option1 || '',
      row.Option2 || row.option2 || '',
      row.Option3 || row.option3 || '',
      row.Option4 || row.option4 || '',
    ],
    correct_option_index: parseInt(row.CorrectIndex || row.correct_index || '0'),
    category: row.Category || row.category || 'General',
  })).filter(q => q.question_text && q.options.every(o => o));
};

export const performOCR = async (imageUri: string): Promise<string> => {
  console.log('performOCR called with URI:', imageUri);
  try {
    console.log('Creating Tesseract worker with eng+mal...');
    const worker = await Tesseract.createWorker('eng+mal');
    console.log('Worker created successfully');

    console.log('Starting image recognition...');
    const result = await worker.recognize(imageUri);
    console.log('Recognition complete, text length:', result.data.text.length);

    await worker.terminate();
    console.log('Worker terminated');

    return result.data.text;
  } catch (error) {
    console.error('OCR Error details:', error);
    throw new Error('Failed to extract text: ' + (error as Error).message);
  }
};

export const parseQuestionsFromText = (text: string): ParsedQuestion[] => {
  // More robust parser
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length === 0) return [];

  const questions: ParsedQuestion[] = [];
  let currentQuestion: Partial<ParsedQuestion> | null = null;
  let currentOptions: string[] = [];

  // Regex patterns
  const questionPattern = /^(?:\d+[\.\):]|Q\d+[\.\):])\s*(.+)/i;
  const optionPattern = /^(?:[a-dA-D][\.\):]|[①-④])\s*(.+)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this is a new question
    const qMatch = line.match(questionPattern);
    if (qMatch) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.question_text) {
        questions.push({
          question_text: currentQuestion.question_text,
          options: currentOptions.length >= 2 ? [
            currentOptions[0] || '',
            currentOptions[1] || '',
            currentOptions[2] || '',
            currentOptions[3] || ''
          ] : ['', '', '', ''],
          correct_option_index: 0,
          category: 'General'
        });
      }

      // Start new question
      currentQuestion = { question_text: qMatch[1].trim() };
      currentOptions = [];
      continue;
    }

    // Check if this is an option
    const optMatch = line.match(optionPattern);
    if (optMatch && currentQuestion) {
      currentOptions.push(optMatch[1].trim());
      continue;
    }

    // If we have a current question but line doesn't match patterns
    if (currentQuestion) {
      if (currentOptions.length === 0 && currentQuestion.question_text) {
        // Append to question text
        currentQuestion.question_text += ' ' + line;
      } else if (currentOptions.length > 0 && currentOptions.length < 4) {
        // Might be continuation or unlabeled option
        if (line.length > 5) {
          currentOptions.push(line);
        }
      }
    }
  }

  // Don't forget the last question
  if (currentQuestion && currentQuestion.question_text) {
    questions.push({
      question_text: currentQuestion.question_text,
      options: currentOptions.length >= 2 ? [
        currentOptions[0] || '',
        currentOptions[1] || '',
        currentOptions[2] || '',
        currentOptions[3] || ''
      ] : ['', '', '', ''],
      correct_option_index: 0,
      category: 'General'
    });
  }

  // Fallback: if no structured questions found, return raw text as single question
  if (questions.length === 0 && text.trim().length > 10) {
    return [{
      question_text: text.trim(),
      options: ['', '', '', ''],
      correct_option_index: 0,
      category: 'General'
    }];
  }

  return questions;
};
