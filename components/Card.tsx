import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
  
  const handlePress = () => {
  const cardId = title.toLowerCase().replace(/\s+/g, '-');
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === 'not done') {
    router.push({
      pathname: '/habit/ActivityCaptureScreen',
      params: { color, scanMethod },
    });
  } else if (normalizedStatus === 'done') {
    router.push({
      pathname: '/habit/[id]',
      params: { id: cardId, title, iconName, scanMethod, color },
    });
  } else if (normalizedStatus === 'no habit') {
    router.push({
      pathname: '/habit/NewHabit',
    });
  } else {
    console.warn('Unrecognized status:', status);
  }
};
  
  return (
    <TouchableOpacity 
      style={[styles.card, { borderColor: color }]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName as any} size={45} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.status, { color }]}>{status}</Text>
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
