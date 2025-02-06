import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CourseListScreen from './CourseListScreen';
import CourseDetailsScreen from './CourseDetailsScreen';
import AddCourseScreen from './AddCourseScreen';

export type InstructorStackParamList = {
  CourseList: undefined;
  CourseDetails: { id: number };
  AddCourse: undefined;
};

const Stack = createStackNavigator<InstructorStackParamList>();

const InstructorStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CourseList" component={CourseListScreen} options={{ title: 'Courses' }} />
    <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} options={{ title: 'Course Details' }} />
    <Stack.Screen name="AddCourse" component={AddCourseScreen} options={{ title: 'Add Course' }} />
  </Stack.Navigator>
);

export default InstructorStack;
