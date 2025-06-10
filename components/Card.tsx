import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getHabitCount } from '../db/habitOps';

type CardProps = {
  iconName: any; // Using 'any' to bypass strict type checking for now
  title: string;
  status: string;
  color?: string;
  scanMethod?: string;
  id?: string;
};

export default function Card({ iconName, title, status, scanMethod, color = '#3498db', id = '0' }: CardProps) {
  const router = useRouter();
  
  const handlePress = async () => {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === 'not done') {
    router.push({
      pathname: '/habit/ActivityCaptureScreen',
      params: { color, scanMethod, habitId: id, habitTitle: title },
    });
  } else if (normalizedStatus === 'done') {
    router.push({
      pathname: '/habit/[id]',
      params: { id: id, title, iconName, scanMethod, color }, // Use the real database ID
    });
  } else if (normalizedStatus === 'no habit') {
    // Check habit count before allowing navigation to NewHabit
    try {
      const currentCount = await getHabitCount();
      if (currentCount >= 6) {
        Alert.alert(
          'Maximum Habits Reached',
          'You can only have up to 6 habits. Please delete an existing habit to add a new one.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      router.push({
        pathname: '/habit/NewHabit',
      });
    } catch (error) {
      console.error('Error checking habit count:', error);
      Alert.alert('Error', 'Unable to check habit count. Please try again.');
    }
  } else {
    console.warn('Unrecognized status:', status);
  }
};
  
  return (
    <TouchableOpacity
      style={[styles.card,
        { borderColor: status.trim().toLowerCase() === 'done' ? '#FFFBF6' : color },
        status.trim().toLowerCase() === 'done' && { backgroundColor: color }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={iconName as any}
          size={45}
          color={status.trim().toLowerCase() === 'done' ? '#FFFBF6' : color}
        />
      </View>
      <Text
        style={[
          styles.title,
          status.trim().toLowerCase() === 'done' && { color: '#FFFBF6' },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.status,
          { color: status.trim().toLowerCase() === 'done' ? '#FFFBF6' : color },
        ]}
      >
        {status}
      </Text>
    </TouchableOpacity>

  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFBF6',
    borderRadius: 10,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    borderLeftWidth: 4,
    minHeight: 150,
    flex: 1,
  },
  iconContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
});
