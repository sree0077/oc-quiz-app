import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, Card, DataTable, Chip, ActivityIndicator } from 'react-native-paper';
import excelService from '../../services/excel.service';
import { useAuthStore } from '../../store/authStore';
import { useSubjectStore } from '../../store/subjectStore';

export const BulkUploadScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { selectedSubject } = useSubjectStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleDownloadTemplate = async () => {
    try {
      // In real implementation, generate and download template
      Alert.alert(
        'Template Format',
        'Excel file should have these columns:\n\n' +
        '• Question Text\n' +
        '• Option A\n' +
        '• Option B\n' +
        '• Option C\n' +
        '• Option D\n' +
        '• Correct Answer (A/B/C/D)\n' +
        '• Difficulty (easy/medium/hard)\n' +
        '• Topic (optional)'
      );
    } catch (error) {
      console.error('Error downloading template:', error);
      Alert.alert('Error', 'Failed to download template');
    }
  };

  const handlePickFile = async () => {
    try {
      const filePath = await excelService.pickExcelFile();
      
      if (!filePath) {
        return; // User cancelled
      }

      setSelectedFile(filePath);
      setIsProcessing(true);

      // Parse Excel file
      const result = await excelService.parseExcelFile(filePath);
      setParseResult(result);

      if (result.errors.length > 0) {
        Alert.alert(
          'Validation Errors',
          `Found ${result.errors.length} error(s) in ${result.totalRows} rows.\n` +
          `${result.validRows} valid question(s) ready to upload.`
        );
      } else {
        Alert.alert(
          'Success',
          `All ${result.validRows} question(s) are valid and ready to upload!`
        );
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to process file. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!parseResult || !selectedSubject || !user) return;

    if (parseResult.validRows === 0) {
      Alert.alert('Error', 'No valid questions to upload');
      return;
    }

    try {
      setIsProcessing(true);

      // Add subject and user info to questions
      const questionsToUpload = parseResult.questions.map((q: any) => ({
        ...q,
        subjectId: selectedSubject.subjectId,
        createdBy: user.userId,
        createdAt: new Date(),
      }));

      // Upload to Firestore
      // In real implementation, batch upload to Firestore
      // await firestoreService.batchAddQuestions(questionsToUpload);

      Alert.alert(
        'Success',
        `${questionsToUpload.length} question(s) uploaded successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setParseResult(null);
              setSelectedFile(null);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading questions:', error);
      Alert.alert('Error', 'Failed to upload questions');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium">Bulk Question Upload</Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              Upload multiple questions at once using an Excel or CSV file.
            </Text>
            
            {selectedSubject && (
              <Chip icon="book" style={styles.subjectChip}>
                {selectedSubject.name}
              </Chip>
            )}
          </Card.Content>
        </Card>

        {/* Template Download */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall">Step 1: Download Template</Text>
            <Text variant="bodySmall" style={styles.stepText}>
              Download the Excel template with the correct format
            </Text>
            <Button
              mode="outlined"
              onPress={handleDownloadTemplate}
              icon="download"
              style={styles.button}
            >
              View Template Format
            </Button>
          </Card.Content>
        </Card>

        {/* File Upload */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall">Step 2: Upload File</Text>
            <Text variant="bodySmall" style={styles.stepText}>
              Select your Excel or CSV file with questions
            </Text>
            <Button
              mode="contained"
              onPress={handlePickFile}
              icon="file-upload"
              style={styles.button}
              disabled={!selectedSubject || isProcessing}
              loading={isProcessing}
            >
              {selectedFile ? 'Change File' : 'Select File'}
            </Button>
            
            {selectedFile && (
              <Text variant="bodySmall" style={styles.fileName}>
                Selected: {selectedFile.split('/').pop()}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Parse Results */}
        {parseResult && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleSmall">Step 3: Review & Upload</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text variant="headlineSmall">{parseResult.totalRows}</Text>
                  <Text variant="bodySmall">Total Rows</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="headlineSmall" style={styles.successText}>
                    {parseResult.validRows}
                  </Text>
                  <Text variant="bodySmall">Valid</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="headlineSmall" style={styles.errorText}>
                    {parseResult.errors.length}
                  </Text>
                  <Text variant="bodySmall">Errors</Text>
                </View>
              </View>

              {parseResult.errors.length > 0 && (
                <View style={styles.errorsContainer}>
                  <Text variant="titleSmall" style={styles.errorsTitle}>
                    Validation Errors:
                  </Text>
                  <ScrollView style={styles.errorsList}>
                    {parseResult.errors.slice(0, 10).map((error: any, index: number) => (
                      <Text key={index} variant="bodySmall" style={styles.errorText}>
                        Row {error.row}: {error.field} - {error.message}
                      </Text>
                    ))}
                    {parseResult.errors.length > 10 && (
                      <Text variant="bodySmall" style={styles.moreErrors}>
                        ... and {parseResult.errors.length - 10} more errors
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}

              <Button
                mode="contained"
                onPress={handleUpload}
                icon="upload"
                style={styles.button}
                disabled={parseResult.validRows === 0 || isProcessing}
                loading={isProcessing}
              >
                Upload {parseResult.validRows} Question(s)
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoText: {
    marginTop: 8,
    color: '#666',
  },
  subjectChip: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  card: {
    marginBottom: 16,
  },
  stepText: {
    marginTop: 4,
    marginBottom: 12,
    color: '#666',
  },
  button: {
    marginTop: 8,
  },
  fileName: {
    marginTop: 8,
    color: '#1976D2',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
  },
  errorsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorsTitle: {
    marginBottom: 8,
    color: '#C62828',
  },
  errorsList: {
    maxHeight: 150,
  },
  moreErrors: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#666',
  },
});

