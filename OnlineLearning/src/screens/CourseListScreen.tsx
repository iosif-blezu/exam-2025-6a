import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InstructorStackParamList } from './InstructorStack';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCourses } from '../api/api';
import LoadingIndicator from '../components/LoadingIndicator';

type Course = {
  id: number;
  name: string;
  instructor: string;
  status: string;
};

type CourseListScreenNavigationProp = StackNavigationProp<InstructorStackParamList, 'CourseList'>;

type Props = {
  navigation: CourseListScreenNavigationProp;
};

const CourseListScreen: React.FC<Props> = ({ navigation }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const isFocused = useIsFocused();

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await fetchCourses();
      setCourses(data);
      await AsyncStorage.setItem('courses', JSON.stringify(data));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load courses. Using cached data.');
      const cached = await AsyncStorage.getItem('courses');
      if (cached) setCourses(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) loadCourses();
  }, [isFocused]);

  const renderItem = ({ item }: { item: Course }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('CourseDetails', { id: item.id })}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>Instructor: {item.instructor}</Text>
      <Text>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <LoadingIndicator />
      ) : (
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
});

export default CourseListScreen;
