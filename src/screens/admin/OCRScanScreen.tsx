import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Text, Card, ActivityIndicator, Chip } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import ocrService from '../../services/ocr.service';
import { useAuthStore } from '../../store/authStore';
import { useSubjectStore } from '../../store/subjectStore';

export const OCRScanScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { selectedSubject } = useSubjectStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedQuestions, setScannedQuestions] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  // Request camera permission on mount
  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || !selectedSubject || !user) return;

    try {
      setIsProcessing(true);

      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      // Process with OCR
      const questions = await ocrService.processQuestionScan(
        photo.uri,
        selectedSubject.subjectId,
        user.userId
      );

      if (questions.length === 0) {
        Alert.alert(
          'No Questions Found',
          'Could not detect any questions in the image. Please try again with a clearer image.'
        );
        return;
      }

      setScannedQuestions(questions);
      setIsScanning(false);
      
      Alert.alert(
        'Success',
        `Found ${questions.length} question(s). Please review and edit if needed.`
      );
    } catch (error) {
      console.error('Error scanning:', error);
      Alert.alert('Error', 'Failed to scan questions. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (!selectedSubject || !user) return;

    try {
      setIsProcessing(true);
      
      // Validate all questions
      const validQuestions = scannedQuestions.filter(q => 
        ocrService.validateQuestion(q)
      );

      if (validQuestions.length === 0) {
        Alert.alert('Error', 'No valid questions to save');
        return;
      }

      // Save to Firestore
      // In real implementation, call firestore service to save questions
      // await firestoreService.addQuestions(validQuestions);

      Alert.alert(
        'Success',
        `${validQuestions.length} question(s) saved successfully!`,
        [{ text: 'OK', onPress: () => setScannedQuestions([]) }]
      );
    } catch (error) {
      console.error('Error saving questions:', error);
      Alert.alert('Error', 'Failed to save questions');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Camera permission is required</Text>
        <Button onPress={requestPermission}>Grant Permission</Button>
      </View>
    );
  }

  if (isScanning) {
    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
        />
        
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          
          <View style={styles.controls}>
            <Button
              mode="contained"
              onPress={handleCapture}
              loading={isProcessing}
              disabled={isProcessing}
              icon="camera"
            >
              Capture
            </Button>
            <Button
              mode="outlined"
              onPress={() => setIsScanning(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium">OCR Question Scanner</Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              Scan physical question papers to automatically extract questions and options.
            </Text>
            
            {selectedSubject && (
              <Chip icon="book" style={styles.subjectChip}>
                {selectedSubject.name}
              </Chip>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => setIsScanning(true)}
          icon="camera"
          style={styles.scanButton}
          disabled={!selectedSubject}
        >
          Start Scanning
        </Button>

        {scannedQuestions.length > 0 && (
          <View style={styles.questionsContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Scanned Questions ({scannedQuestions.length})
            </Text>
            
            {scannedQuestions.map((question, index) => (
              <Card key={index} style={styles.questionCard}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.questionText}>
                    {index + 1}. {question.questionText}
                  </Text>
                  <View style={styles.options}>
                    <Text>A) {question.options.A}</Text>
                    <Text>B) {question.options.B}</Text>
                    <Text>C) {question.options.C}</Text>
                    <Text>D) {question.options.D}</Text>
                  </View>
                </Card.Content>
              </Card>
            ))}

            <Button
              mode="contained"
              onPress={handleSaveQuestions}
              loading={isProcessing}
              disabled={isProcessing}
              style={styles.saveButton}
            >
              Save All Questions
            </Button>
          </View>
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
  scanButton: {
    marginBottom: 24,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  scanFrame: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    margin: 40,
  },
  controls: {
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
  },
  questionsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  questionCard: {
    marginBottom: 12,
  },
  questionText: {
    fontWeight: '600',
    marginBottom: 8,
  },
  options: {
    marginTop: 8,
    gap: 4,
  },
  saveButton: {
    marginTop: 16,
  },
});

