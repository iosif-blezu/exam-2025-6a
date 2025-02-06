import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Alert, RefreshControl } from 'react-native';
import { fetchAllCourses } from '../api/api';
import LoadingIndicator from '../components/LoadingIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { courseEventEmitter } from '../events/CourseEventEmitter';

type Course = {
  id: number;
  name: string;
  duration: number;
  status: string;
  students: number;
};

const StudentScreen: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadOngoingCourses = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCourses();
      // Filter for courses that are ongoing
      const ongoingCourses = data.filter((c: Course) => c.status.toLowerCase() === 'ongoing');
      setCourses(ongoingCourses);
      // Cache the full list in AsyncStorage if desired
      await AsyncStorage.setItem('courses', JSON.stringify(data));
    } catch (error) {
      Alert.alert('Error', 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load on mount.
  useEffect(() => {
    loadOngoingCourses();
  }, []);

  // Subscribe to course events so that additions or deletions update the list.
  useEffect(() => {
    const onCourseAdded = (newCourse: Course) => {
      if (newCourse.status.toLowerCase() === 'ongoing') {
        // Add the course only if it's not already in the list.
        setCourses(prev => {
          if (!prev.some(c => c.id === newCourse.id)) {
            return [...prev, newCourse];
          }
          return prev;
        });
      }
    };

    const onCourseDeleted = (deletedId: number) => {
      setCourses(prev => prev.filter(course => course.id !== deletedId));
    };

    courseEventEmitter.on('courseAdded', onCourseAdded);
    courseEventEmitter.on('courseDeleted', onCourseDeleted);

    return () => {
      courseEventEmitter.off('courseAdded', onCourseAdded);
      courseEventEmitter.off('courseDeleted', onCourseDeleted);
    };
  }, []);

  const renderItem = ({ item }: { item: Course }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>Duration: {item.duration} hours</Text>
      <Text>Status: {item.status}</Text>
      <Text>Enrolled Students: {item.students}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadOngoingCourses} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  title: { fontWeight: 'bold', fontSize: 16 },
});

export default StudentScreen;