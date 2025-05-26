import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CreateHabitScreen() {
  const router = useRouter();

  const [frequency, setFrequency] = useState<'day' | 'week'>('day');
  const [habitName, setHabitName] = useState('');
  const [scanningMethod, setScanningMethod] = useState('');

  const onDone = () => {
    // Save habit logic here if needed
    router.push('/');
  };

  const onBack = () => router.back();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}

      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.title}>Create a new habit</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsContainer}>
          <Text style={styles.title1}>Select how often you want to do your habit</Text>

          {/* Frequency toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton1, frequency === 'day' && styles.toggleButtonSelected]}
              onPress={() => setFrequency('day')}
            >
              <Text style={[styles.toggleText, frequency === 'day' && styles.toggleTextSelected]}>
                Once a day
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton2, frequency === 'week' && styles.toggleButtonSelected]}
              onPress={() => setFrequency('week')}
            >
              <Text style={[styles.toggleText, frequency === 'week' && styles.toggleTextSelected]}>
                Once a week
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.title1}>Name your habit</Text>
          {/* Habit name input */}
          <TextInput
            style={styles.input1}
            placeholder="Habit name"
            value={habitName}
            onChangeText={setHabitName}
          />

          <Text style={styles.title1}>How would you like to scan for completing your habit?</Text>
          {/* Scanning metod input */}
          <TextInput
            style={styles.input2}
            placeholder="Scanning method"
            value={scanningMethod}
            onChangeText={setScanningMethod}
            multiline
            numberOfLines={4}
          />

          {/* Done button */}
          <TouchableOpacity
            style={[
              styles.doneButton,
              {
                opacity: habitName.trim() === '' || scanningMethod.trim() === '' ? 0.5 : 1,
              },
            ]}
            onPress={onDone}
            disabled={habitName.trim() === '' || scanningMethod.trim() === ''}
            activeOpacity={0.7}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#314146',
  },
  container: {
    alignItems: 'center',
    padding: 16,
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5D737A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 32,
    flexDirection: 'row',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFBF6',
    paddingBottom: 32,
  },
  scrollContent: {
    flexGrow: 1,
  },
  statsContainer: {
    backgroundColor: '#5D737A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title1: {
    fontSize: 20,
    marginBottom: 4,
    color: '#FFFBF6',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  toggleButton1: {
    flex: 1,
    paddingVertical: 12,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: '#FFFBF6',
  },
  toggleButton2: {
    flex: 1,
    paddingVertical: 12,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: '#FFFBF6',
  },
  toggleButtonSelected: {
    backgroundColor: '#FFF47B',
  },
  toggleText: {
    textAlign: 'center',
    color: '#314146',
    fontWeight: '500',
  },
  toggleTextSelected: {
    color: '#314146',
  },
  input1: {
    backgroundColor: '#FFFBF6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    fontSize: 24,
    marginBottom: 24,

  },
  input2: {
    backgroundColor: '#FFFBF6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    fontSize: 20,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 24,

},

  label: {
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  doneButton: {
    backgroundColor: '#FFF47B',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 30,
  },
  doneButtonText: {
    color: '#FFFBF6',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
