import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Alert, RefreshControl } from 'react-native';
import { fetchAllCourses } from '../api/api';
import LoadingIndicator from '../components/LoadingIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { courseEventEmitter } from '../events/CourseEventEmitter';

type Course = {
  id: number;
  name: string;
  instructor: string;
  students: number;
  status: string;
};

const AnalyticsScreen: React.FC = () => {
  const [topCourses, setTopCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCourses();
      // Sort courses by status (ascending) and then by enrolled students (descending)
      const sorted = data.sort((a: Course, b: Course) => {
        if (a.status === b.status) return b.students - a.students;
        return a.status.localeCompare(b.status);
      });
      setTopCourses(sorted.slice(0, 5));
      // Optionally update the cache
      await AsyncStorage.setItem('courses', JSON.stringify(data));
    } catch (error) {
      Alert.alert('Error', 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load on mount.
  useEffect(() => {
    loadAnalytics();
  }, []);

  // Subscribe to events—here, on any addition or deletion, we re-load analytics.
  useEffect(() => {
    const onCourseChange = () => {
      loadAnalytics();
    };

    courseEventEmitter.on('courseAdded', onCourseChange);
    courseEventEmitter.on('courseDeleted', onCourseChange);

    return () => {
      courseEventEmitter.off('courseAdded', onCourseChange);
      courseEventEmitter.off('courseDeleted', onCourseChange);
    };
  }, []);

  const renderItem = ({ item }: { item: Course }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>Instructor: {item.instructor}</Text>
      <Text>Enrolled Students: {item.students}</Text>
      <Text>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <FlatList
          data={topCourses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadAnalytics} />
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

export default AnalyticsScreen;