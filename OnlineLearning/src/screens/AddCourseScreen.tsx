import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InstructorStackParamList } from './InstructorStack';
import { addCourse } from '../api/api';
import LoadingIndicator from '../components/LoadingIndicator';

type Props = {
  navigation: StackNavigationProp<InstructorStackParamList, 'AddCourse'>;
};

const AddCourseScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [students, setStudents] = useState('');
  const [duration, setDuration] = useState('');

  const onSubmit = async () => {
    if (!name || !instructor || !description || !status || !students || !duration) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await addCourse({
        name,
        instructor,
        description,
        status,
        students: parseInt(students, 10),
        duration: parseInt(duration, 10),
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput placeholder="Course Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Instructor" value={instructor} onChangeText={setInstructor} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
      <TextInput placeholder="Status (e.g., upcoming, ongoing, completed)" value={status} onChangeText={setStatus} style={styles.input} />
      <TextInput placeholder="Enrolled Students" value={students} onChangeText={setStudents} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Duration (hours)" value={duration} onChangeText={setDuration} style={styles.input} keyboardType="numeric" />
      <Button title="Add Course" onPress={onSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
  },
});

export default AddCourseScreen;
