import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

type ToastProps = {
  message: string;
  onHide: () => void;
};

const Toast: React.FC<ToastProps> = ({ message, onHide }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(onHide);
      }, 3000);
    });
  }, []);

  return (
    <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
  },
  toastText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default Toast;
