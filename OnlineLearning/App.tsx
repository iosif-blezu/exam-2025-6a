import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InstructorStack from './src/screens/InstructorStack';
import StudentScreen from './src/screens/StudentScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import Toast from './src/components/Toast';

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
        const { name, instructor, description } = data;
        setToastMsg(`New Course: ${name} by ${instructor}\n${description}`);
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
