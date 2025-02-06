import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Alert } from 'react-native';
import { fetchAllCourses } from '../api/api';
import LoadingIndicator from '../components/LoadingIndicator';

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

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCourses();
      // Sort by status (ascending) and then enrolled students (descending)
      const sorted = data.sort((a: Course, b: Course) => {
        if (a.status === b.status) return b.students - a.students;
        return a.status.localeCompare(b.status);
      });
      setTopCourses(sorted.slice(0, 5));
    } catch (error) {
      Alert.alert('Error', 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const renderItem = ({ item }: { item: Course }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>Instructor: {item.instructor}</Text>
      <Text>Enrolled Students: {item.students}</Text>
      <Text>Status: {item.status}</Text>
    </View>
  );

  if (loading) return <LoadingIndicator />;

  return (
    <View style={styles.container}>
      <FlatList data={topCourses} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  title: { fontWeight: 'bold', fontSize: 16 },
});

export default AnalyticsScreen;
