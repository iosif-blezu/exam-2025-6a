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
      // Check if the course is already in cache.
      const cached = await AsyncStorage.getItem(`course-${id}`);
      if (cached) {
        setCourse(JSON.parse(cached));
        console.log('Loaded course from cache.');
      } else {
        // If not, fetch from the server and store it in cache.
        const data = await fetchCourseById(id);
        setCourse(data);
        await AsyncStorage.setItem(`course-${id}`, JSON.stringify(data));
        console.log('Fetched course from server and cached.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load course details.');
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
            // Remove the individual course cache.
            await AsyncStorage.removeItem(`course-${id}`);

            // Update the courses list cache by removing the deleted course.
            const coursesStr = await AsyncStorage.getItem('courses');
            if (coursesStr) {
              const courses = JSON.parse(coursesStr);
              const updatedCourses = courses.filter((c: Course) => c.id !== id);
              await AsyncStorage.setItem('courses', JSON.stringify(updatedCourses));
            }

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

  // Only load the course if the screen is focused and the course is not already loaded.
  useEffect(() => {
    if (isFocused && !course) {
      loadCourse();
    }
  }, [isFocused, course]);

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
