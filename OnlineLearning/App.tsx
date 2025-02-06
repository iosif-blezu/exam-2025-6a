import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InstructorStack from './src/screens/InstructorStack';
import StudentScreen from './src/screens/StudentScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import Toast from './src/components/Toast';
import { courseEventEmitter } from './src/events/CourseEventEmitter';
import { fetchCourseById } from './src/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

export default function App() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://172.30.246.151:2506'); // update with your server address

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("Received WS message:", data);

        // Check for a deletion event in one of two ways:
        // 1. If the message has an action field set to "delete"
        // 2. Or, if it lacks a 'name' property (which a full course addition would include)
        if ((data.action && data.action === 'delete') || (!data.name && data.id)) {
          const deletedId = Number(data.id);
          AsyncStorage.getItem('courses').then((coursesStr) => {
            const courses = coursesStr ? JSON.parse(coursesStr) : [];
            const updatedCourses = courses.filter((c: any) => c.id !== deletedId);
            AsyncStorage.setItem('courses', JSON.stringify(updatedCourses));
            courseEventEmitter.emit('courseDeleted', deletedId);
          });
          setToastMsg(`Course deleted!`);
        } else {
          // Otherwise, treat this as an addition event.
          const newCourseId = Number(data.id);
          fetchCourseById(newCourseId)
            .then((newCourse) => {
              AsyncStorage.getItem('courses').then((coursesStr) => {
                const courses = coursesStr ? JSON.parse(coursesStr) : [];
                if (!courses.some((c: any) => c.id === newCourse.id)) {
                  courses.push(newCourse);
                  AsyncStorage.setItem('courses', JSON.stringify(courses));
                  courseEventEmitter.emit('courseAdded', newCourse);
                }
              });
            })
            .catch((err) => console.error("Failed to fetch course by id", err));
            setToastMsg(`New course added: ${data.name} by ${data.instructor}. ${data.description}`);
          }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => ws.close();
  }, []);

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Instructor" component={InstructorStack} />
          <Tab.Screen name="Student" component={StudentScreen} />
          <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      {toastMsg && <Toast message={toastMsg} onHide={() => setToastMsg(null)} />}
    </>
  );
}
