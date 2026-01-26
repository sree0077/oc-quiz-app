import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, RadioButton, HelperText, useTheme, ActivityIndicator, Dialog, Portal, Menu, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../src/config/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { parseExcelFile, performOCR, parseQuestionsFromText, ParsedQuestion } from '../../src/utils/documentParser';
import { Subject } from '../../src/store/quizStore';

export default function CreateQuestionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuthStore();

  const [questionText, setQuestionText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState<string>('0');
  const [category, setCategory] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectMenuVisible, setSubjectMenuVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showMultiQuestionDialog, setShowMultiQuestionDialog] = useState(false);
  const [detectedQuestions, setDetectedQuestions] = useState<ParsedQuestion[]>([]);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    if (!error && data) {
      setSubjects(data);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async () => {
    console.log('handleCreate called, loading state:', loading);
    if (loading) return;

    if (!questionText || !option1 || !option2 || !option3 || !option4) {
      Alert.alert('Missing Fields', 'Please fill all fields.');
      console.log('Missing fields validation failed');
      return;
    }

    console.log('Preparing to save question...');
    setLoading(true);

    let finalSubjectId = selectedSubjectId;

    // If manual subject name is provided, check if it exists or create it
    if (subjectName.trim()) {
      const existing = subjects.find(s => s.name.toLowerCase() === subjectName.trim().toLowerCase());
      if (existing) {
        finalSubjectId = existing.id;
      } else {
        // Create new subject
        const { data, error: subError } = await supabase
          .from('subjects')
          .insert({ name: subjectName.trim(), creator_id: session?.user.id })
          .select()
          .single();

        if (!subError && data) {
          finalSubjectId = data.id;
          // Optimistically update subjects list
          setSubjects(prev => [...prev, data]);
        }
      }
    }

    const options = [option1, option2, option3, option4];

    const questionData = {
      creator_id: session?.user.id,
      question_text: questionText,
      options: options,
      correct_option_index: parseInt(correctOption),
      category: category || 'General',
      subject_id: finalSubjectId,
    };

    console.log('Question data:', questionData);
    console.log('Session user ID:', session?.user.id);

    const { data, error } = await supabase.from('questions').insert(questionData);

    setLoading(false);

    console.log('Insert result - data:', data, 'error:', error);

    if (!error) {
      Alert.alert('Success', 'Question added!');
      console.log('Question saved successfully');
      setQuestionText('');
      setOption1(''); setOption2(''); setOption3(''); setOption4('');
      setCorrectOption('0');
      setSubjectName('');
      setSelectedSubjectId(null);
    } else {
      console.error('Save error:', error);
      Alert.alert('Error', error.message || 'Failed to save question');
    }
  };

  const handleBulkImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setBulkLoading(true);
      const fileUri = result.assets[0].uri;
      const questionsData = await parseExcelFile(fileUri);

      if (questionsData.length === 0) {
        Alert.alert('Error', 'No valid questions found in file.');
        setBulkLoading(false);
        return;
      }

      // Bulk insert
      const toInsert = questionsData.map(q => ({
        creator_id: session?.user.id,
        question_text: q.question_text,
        options: q.options,
        correct_option_index: q.correct_option_index,
        category: q.category,
        subject_id: selectedSubjectId
      }));

      const { error } = await supabase.from('questions').insert(toInsert);

      setBulkLoading(false);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', `Imported ${questionsData.length} questions!`, [
          { text: 'View All', onPress: () => router.push('/(tabs)/questions') }
        ]);
      }
    } catch (err: any) {
      setBulkLoading(false);
      Alert.alert('Import Failed', err.message);
    }
  };

  const handleOCR = async () => {
    console.log('handleOCR triggered');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      console.log('Image picker result:', result);
      if (result.canceled) {
        console.log('Image selection canceled');
        return;
      }

      setOcrLoading(true);
      console.log('OCR loading started');

      try {
        const text = await performOCR(result.assets[0].uri);
        console.log('OCR text received, length:', text?.length);

        if (!text || text.trim().length < 5) {
          Alert.alert('OCR Failed', 'Could not extract text from image.');
          return;
        }

        // Parse the text into structured questions
        const parsedQuestions = parseQuestionsFromText(text);
        console.log('Parsed questions count:', parsedQuestions.length);

        if (parsedQuestions.length === 0) {
          Alert.alert('No Questions Found', 'Could not detect any questions in the image.');
          return;
        }

        if (parsedQuestions.length > 1) {
          // Multiple questions detected - show dialog
          setDetectedQuestions(parsedQuestions);
          setShowMultiQuestionDialog(true);
        } else {
          // Single question
          const q = parsedQuestions[0];
          setQuestionText(q.question_text);
          setOption1(q.options[0]);
          setOption2(q.options[1]);
          setOption3(q.options[2]);
          setOption4(q.options[3]);

          if (q.options.every(opt => opt.length > 0)) {
            Alert.alert('OCR Success', 'Question and options extracted! Please verify and select the correct answer.');
          } else {
            Alert.alert('Partial Success', 'Question extracted but some options may be missing.');
          }
        }
      } finally {
        // Always clear loading state
        setOcrLoading(false);
        console.log('OCR loading cleared');
      }
    } catch (err: any) {
      console.error('handleOCR error:', err);
      setOcrLoading(false);
      Alert.alert('OCR Error', err.message || 'An error occurred');
    }
  };

  const handleImportAll = async () => {
    setShowMultiQuestionDialog(false);
    setBulkLoading(true);

    const toInsert = detectedQuestions.map(q => ({
      creator_id: session?.user.id,
      question_text: q.question_text,
      options: q.options,
      correct_option_index: 0,
      category: category || 'General',
      subject_id: selectedSubjectId
    }));

    const { error } = await supabase.from('questions').insert(toInsert);
    setBulkLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', `Imported ${detectedQuestions.length} questions! Please review and update correct answers.`);
      router.push('/(tabs)/questions');
    }
  };

  const handleFillForm = () => {
    setShowMultiQuestionDialog(false);
    const q = detectedQuestions[0];
    setQuestionText(q.question_text);
    setOption1(q.options[0]);
    setOption2(q.options[1]);
    setOption3(q.options[2]);
    setOption4(q.options[3]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>
        Add Questions
      </Text>

      <Button
        mode="contained-tonal"
        icon="file-excel"
        onPress={handleBulkImport}
        loading={bulkLoading}
        style={styles.actionButton}
      >
        Bulk Import from Excel
      </Button>

      <View style={styles.divider}>
        <Text variant="bodySmall" style={{ textAlign: 'center', opacity: 0.5 }}>OR MANUAL ENTRY</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Question Text"
          value={questionText}
          onChangeText={setQuestionText}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          right={<TextInput.Icon icon="camera" onPress={handleOCR} disabled={ocrLoading} />}
        />
        {ocrLoading && <ActivityIndicator size="small" style={{ alignSelf: 'flex-start', marginBottom: 8 }} />}
      </View>

      <View style={styles.subjectContainer}>
        <View style={{ flex: 1 }}>
          <TextInput
            label="Subject"
            value={subjectName}
            onChangeText={(text) => {
              setSubjectName(text);
              setSelectedSubjectId(null);
            }}
            mode="outlined"
            right={
              <TextInput.Icon
                icon="chevron-down"
                onPress={() => setSubjectMenuVisible(true)}
              />
            }
          />
          <Menu
            visible={subjectMenuVisible}
            onDismiss={() => setSubjectMenuVisible(false)}
            anchor={{ x: 0, y: 0 }} // Anchor is handled by the manual input icon
            contentStyle={{ marginTop: 60 }}
          >
            {subjects.map(subject => (
              <Menu.Item
                key={subject.id}
                onPress={() => {
                  setSubjectName(subject.name);
                  setSelectedSubjectId(subject.id);
                  setSubjectMenuVisible(false);
                }}
                title={subject.name}
              />
            ))}
            {subjects.length === 0 && <Menu.Item title="No subjects found" disabled />}
          </Menu>
        </View>

        <TextInput
          label="Category"
          value={category}
          onChangeText={setCategory}
          mode="outlined"
          style={[styles.input, { flex: 1, marginLeft: 8 }]}
        />
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Options (Select the correct answer)</Text>

      <HelperText type="info" style={{ marginBottom: 8 }}>
        Click the radio button next to the CORRECT answer
      </HelperText>

      <RadioButton.Group onValueChange={value => setCorrectOption(value)} value={correctOption}>
        {[option1, option2, option3, option4].map((opt, idx) => (
          <View style={styles.optionRow} key={idx}>
            <RadioButton value={idx.toString()} />
            <TextInput
              label={`Option ${idx + 1}`}
              value={idx === 0 ? option1 : idx === 1 ? option2 : idx === 2 ? option3 : option4}
              onChangeText={idx === 0 ? setOption1 : idx === 1 ? setOption2 : idx === 2 ? setOption3 : setOption4}
              mode="outlined"
              style={styles.optionInput}
            />
          </View>
        ))}
      </RadioButton.Group>

      <HelperText type="info">Select the correct answer.</HelperText>

      <Button
        mode="contained"
        onPress={handleCreate}
        loading={loading}
        disabled={loading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Save Single Question
      </Button>

      <Portal>
        <Dialog visible={showMultiQuestionDialog} onDismiss={() => setShowMultiQuestionDialog(false)}>
          <Dialog.Title>Multiple Questions Detected</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Found {detectedQuestions.length} questions in the image. Would you like to import all of them or fill the form with the first one?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowMultiQuestionDialog(false)}>Cancel</Button>
            <Button onPress={handleFillForm}>Fill Form</Button>
            <Button mode="contained" onPress={handleImportAll} loading={bulkLoading}>
              Import All
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButton: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectButton: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionInput: {
    flex: 1,
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
