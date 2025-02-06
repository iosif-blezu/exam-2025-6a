import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { InstructorStackParamList } from './InstructorStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCourses } from '../api/api';
import LoadingIndicator from '../components/LoadingIndicator';
import { courseEventEmitter } from '../events/CourseEventEmitter';

type Course = {
  id: number;
  name: string;
  instructor: string;
  status: string;
};

type CourseListScreenNavigationProp = NavigationProp<InstructorStackParamList, 'CourseList'>;

type Props = {
  navigation: CourseListScreenNavigationProp;
};

const CourseListScreen: React.FC<Props> = ({ navigation }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load courses from local cache
  const loadCoursesFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem('courses');
      if (cached) {
        setCourses(JSON.parse(cached));
      }
    } catch (err) {
      console.error('Error reading courses from cache:', err);
    }
  };

  // Refresh cache on focus so that deletions or additions are reflected instantly
  useFocusEffect(
    useCallback(() => {
      loadCoursesFromCache();
    }, [])
  );

  // Initial network load happens once on mount.
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCourses();
        setCourses(data);
        await AsyncStorage.setItem('courses', JSON.stringify(data));
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please retry.');
      } finally {
        setLoading(false);
      }
    };
    initialLoad();

    // Listen for course addition/deletion events
    const onCourseAdded = (newCourse: Course) => {
      setCourses((prev) => [...prev, newCourse]);
    };

    const onCourseDeleted = (deletedId: number) => {
      setCourses((prev) => prev.filter((course) => course.id !== deletedId));
    };

    courseEventEmitter.on('courseAdded', onCourseAdded);
    courseEventEmitter.on('courseDeleted', onCourseDeleted);

    return () => {
      courseEventEmitter.off('courseAdded', onCourseAdded);
      courseEventEmitter.off('courseDeleted', onCourseDeleted);
    };
  }, []);

  const renderItem = ({ item }: { item: Course }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('CourseDetails', { id: item.id })}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>Instructor: {item.instructor}</Text>
      <Text>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && <LoadingIndicator />}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={async () => {
            setLoading(true);
            setError(null);
            try {
              const data = await fetchCourses();
              setCourses(data);
              await AsyncStorage.setItem('courses', JSON.stringify(data));
            } catch (err) {
              setError('Failed to load courses. Please retry.');
            } finally {
              setLoading(false);
            }
          }} />
        </View>
      )}
      {!loading && !error && (
        <>
          <FlatList data={courses} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} />
          <Button title="Add New Course" onPress={() => navigation.navigate('AddCourse')} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  title: { fontWeight: 'bold', fontSize: 16 },
  errorContainer: { alignItems: 'center', marginTop: 20 },
  errorText: { color: 'red', marginBottom: 10 },
});

export default CourseListScreen;
