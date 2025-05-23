import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

// Sample data - in a real app, this would come from a database or API
const weeklyData = {
  'Running': [1, 2, 3, 2, 4, 3, 2],
  'Climbing': [0, 1, 0, 2, 1, 1, 0],
  'Reading': [3, 4, 3, 5, 4, 4, 5],
  'Cleaning': [2, 1, 2, 3, 2, 2, 1],
  'Meditation': [1, 2, 1, 2, 3, 2, 3],
  'Healthy Eating': [4, 3, 4, 3, 5, 4, 4],
};


const chartConfig = {
  backgroundColor: '#FFFBF6',
  backgroundGradientFrom: '#FFFBF6',
  backgroundGradientTo: '#FFFBF6',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  }, 
  propsForDots: {
    r: '6',
    strokeWidth: '2',
  }
};

export default function HabitDetailScreen() {
  const { id, title, iconName, color } = useLocalSearchParams();
  const router = useRouter();
  const habitTitle = title as string;
  const habitColor = color as string;
  const habitIcon = iconName as string;
  
  // Get data for this specific habit (or use empty array if not found)
  const habitData = weeklyData[habitTitle as keyof typeof weeklyData] || [0, 0, 0, 0, 0, 0, 0];
  
  // Calculate completion stats
  const totalCompletions = habitData.reduce((sum, day) => sum + day, 0);
  const avgCompletions = totalCompletions / 7;
  const bestDay = Math.max(...habitData);
  
  // Find which day had the most completions
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const bestDayIndex = habitData.indexOf(bestDay);
  const bestDayName = daysOfWeek[bestDayIndex];

  const screenWidth = Dimensions.get('window').width - 32; // Full width minus padding
  
  const handlePress = () => {
    // Convert title to a simple string id for the route
    router.push({
      pathname: '/habit/ActivityCaptureScreen',
      params: {color }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name={habitIcon as any} style={styles.icon}size={45} color={habitColor}/>
          <Text style={styles.title}>{habitTitle}</Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Weekly Statistics</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalCompletions}</Text>
                <Text style={styles.statLabel}>Total Completions</Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{avgCompletions.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Daily Average</Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{bestDayName}</Text>
                <Text style={styles.statLabel}>Best Day</Text>
              </View>
            </View>
            
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Daily Completions</Text>
              <LineChart
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [
                    {
                      data: habitData,
                      color: (opacity = 1) => habitColor || `rgba(52, 152, 219, ${opacity})`,
                      strokeWidth: 2
                    }
                  ]
                }}
                width={screenWidth-50}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                
              />
            </View>
            
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Tips to Improve</Text>
              <Text style={styles.tipText}>• Set a specific time each day for this habit</Text>
              <Text style={styles.tipText}>• Track your progress daily in the app</Text>
              <Text style={styles.tipText}>• Share your goals with friends for accountability</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.completeButton, { backgroundColor: habitColor }]}
              onPress={handlePress}
              //onPress={() => router.navigate('/habit/ActivityCaptureScreen')}
              activeOpacity={0.8}
              
            >
              <Text style={styles.completeButtonText}>Complete for Today</Text>
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
  header: {
    paddingTop: 32,
    flexDirection: 'row',
    marginBottom: 24,
  },
  icon: {
    position: 'relative',
    paddingRight: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFBF6',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFFBF6',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFBF6',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#FFFBF6',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  tipsContainer: {
    backgroundColor: '#FFFBF6',
    borderRadius: 8,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#444',
  },
  completeButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completeButtonText: {
    color: '#FFFBF6',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
