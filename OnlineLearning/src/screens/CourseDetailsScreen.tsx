import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InstructorStackParamList } from './InstructorStack';
import { RouteProp, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCourseById, deleteCourse } from '../api/api';
import LoadingIndicator from '../components/LoadingIndicator';

type Course = {
  id: number;
  name: string;
  instructor: string;
  description: string;
  status: string;
  students: number;
  duration: number;
};

type CourseDetailsScreenNavigationProp = StackNavigationProp<InstructorStackParamList, 'CourseDetails'>;
type CourseDetailsScreenRouteProp = RouteProp<InstructorStackParamList, 'CourseDetails'>;

type Props = {
  navigation: CourseDetailsScreenNavigationProp;
  route: CourseDetailsScreenRouteProp;
};

const CourseDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id } = route.params;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const isFocused = useIsFocused();

  const loadCourse = async () => {
    setLoading(true);
    try {
      const data = await fetchCourseById(id);
      setCourse(data);
      await AsyncStorage.setItem(`course-${id}`, JSON.stringify(data));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load course details. Using cached data.');
      const cached = await AsyncStorage.getItem(`course-${id}`);
      if (cached) setCourse(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    Alert.alert('Confirm', 'Are you sure you want to delete this course?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteCourse(id);
            Alert.alert('Success', 'Course deleted');
            navigation.goBack();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete course');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  useEffect(() => {
    if (isFocused) loadCourse();
  }, [isFocused]);

  if (loading || !course) return <LoadingIndicator />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{course.name}</Text>
      <Text>Instructor: {course.instructor}</Text>
      <Text>Description: {course.description}</Text>
      <Text>Status: {course.status}</Text>
      <Text>Enrolled Students: {course.students}</Text>
      <Text>Duration: {course.duration} hours</Text>
      <Button title="Delete Course" onPress={onDelete} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});

export default CourseDetailsScreen;
