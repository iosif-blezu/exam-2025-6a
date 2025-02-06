import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Alert } from 'react-native';
import { fetchAllCourses } from '../api/api';
import LoadingIndicator from '../components/LoadingIndicator';

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

  const loadOngoingCourses = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCourses();
      const ongoingCourses = data.filter((c: Course) => c.status.toLowerCase() === 'ongoing');
      setCourses(ongoingCourses);
    } catch (error) {
      Alert.alert('Error', 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOngoingCourses();
  }, []);

  const renderItem = ({ item }: { item: Course }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>Duration: {item.duration} hours</Text>
      <Text>Status: {item.status}</Text>
      <Text>Enrolled Students: {item.students}</Text>
    </View>
  );

  if (loading) return <LoadingIndicator />;

  return (
    <View style={styles.container}>
      <FlatList data={courses} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  title: { fontWeight: 'bold', fontSize: 16 },
});

export default StudentScreen;
