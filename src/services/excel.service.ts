import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import { Question, AnswerOption, Difficulty } from '../types/quiz.types';

interface ExcelQuestionRow {
  'Question Text': string;
  'Option A': string;
  'Option B': string;
  'Option C': string;
  'Option D': string;
  'Correct Answer': string;
  'Difficulty': string;
  'Topic'?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParseResult {
  questions: Partial<Question>[];
  errors: ValidationError[];
  totalRows: number;
  validRows: number;
}

class ExcelService {
  /**
   * Pick Excel/CSV file from device
   */
  async pickExcelFile(): Promise<string | null> {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.xlsx,
          DocumentPicker.types.xls,
          DocumentPicker.types.csv,
        ],
      });

      if (result && result[0]) {
        return result[0].uri;
      }
      return null;
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        return null;
      }
      console.error('Error picking file:', error);
      throw new Error('Failed to pick file');
    }
  }

  /**
   * Read and parse Excel file
   */
  async parseExcelFile(filePath: string): Promise<ParseResult> {
    try {
      // Read file content
      const fileContent = await RNFS.readFile(filePath, 'base64');
      
      // Parse Excel file
      const workbook = XLSX.read(fileContent, { type: 'base64' });
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData: ExcelQuestionRow[] = XLSX.utils.sheet_to_json(worksheet);
      
      // Parse and validate questions
      return this.validateAndParseQuestions(jsonData);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error('Failed to parse Excel file. Please check the format.');
    }
  }

  /**
   * Validate and parse questions from Excel data
   */
  private validateAndParseQuestions(data: ExcelQuestionRow[]): ParseResult {
    const questions: Partial<Question>[] = [];
    const errors: ValidationError[] = [];
    let validRows = 0;

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because Excel is 1-indexed and has header row
      const rowErrors: ValidationError[] = [];

      // Validate required fields
      if (!row['Question Text'] || row['Question Text'].trim().length === 0) {
        rowErrors.push({
          row: rowNumber,
          field: 'Question Text',
          message: 'Question text is required',
        });
      }

      if (!row['Option A'] || row['Option A'].trim().length === 0) {
        rowErrors.push({
          row: rowNumber,
          field: 'Option A',
          message: 'Option A is required',
        });
      }

      if (!row['Option B'] || row['Option B'].trim().length === 0) {
        rowErrors.push({
          row: rowNumber,
          field: 'Option B',
          message: 'Option B is required',
        });
      }

      if (!row['Option C'] || row['Option C'].trim().length === 0) {
        rowErrors.push({
          row: rowNumber,
          field: 'Option C',
          message: 'Option C is required',
        });
      }

      if (!row['Option D'] || row['Option D'].trim().length === 0) {
        rowErrors.push({
          row: rowNumber,
          field: 'Option D',
          message: 'Option D is required',
        });
      }

      // Validate correct answer
      const correctAnswer = row['Correct Answer']?.trim().toUpperCase();
      if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        rowErrors.push({
          row: rowNumber,
          field: 'Correct Answer',
          message: 'Correct answer must be A, B, C, or D',
        });
      }

      // Validate difficulty
      const difficulty = row['Difficulty']?.trim().toLowerCase();
      if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
        rowErrors.push({
          row: rowNumber,
          field: 'Difficulty',
          message: 'Difficulty must be easy, medium, or hard',
        });
      }

      // If there are errors, add them and skip this row
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        // Create question object
        const question: Partial<Question> = {
          questionText: row['Question Text'].trim(),
          options: {
            A: row['Option A'].trim(),
            B: row['Option B'].trim(),
            C: row['Option C'].trim(),
            D: row['Option D'].trim(),
          },
          correctAnswer: correctAnswer as AnswerOption,
          difficulty: (difficulty || 'medium') as Difficulty,
          topic: row['Topic']?.trim() || undefined,
          source: 'excel',
        };

        questions.push(question);
        validRows++;
      }
    });

    return {
      questions,
      errors,
      totalRows: data.length,
      validRows,
    };
  }

  /**
   * Generate Excel template for bulk upload
   */
  generateTemplate(): ExcelQuestionRow[] {
    return [
      {
        'Question Text': 'What is the capital of France?',
        'Option A': 'London',
        'Option B': 'Paris',
        'Option C': 'Berlin',
        'Option D': 'Madrid',
        'Correct Answer': 'B',
        'Difficulty': 'easy',
        'Topic': 'Geography',
      },
      {
        'Question Text': 'Which planet is known as the Red Planet?',
        'Option A': 'Venus',
        'Option B': 'Jupiter',
        'Option C': 'Mars',
        'Option D': 'Saturn',
        'Correct Answer': 'C',
        'Difficulty': 'easy',
        'Topic': 'Astronomy',
      },
    ];
  }

  /**
   * Export template to Excel file
   */
  async exportTemplate(filePath: string): Promise<void> {
    try {
      const template = this.generateTemplate();
      const worksheet = XLSX.utils.json_to_sheet(template);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
      
      const excelBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      await RNFS.writeFile(filePath, excelBuffer, 'base64');
    } catch (error) {
      console.error('Error exporting template:', error);
      throw new Error('Failed to export template');
    }
  }
}

export default new ExcelService();

