import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Dimensions, TouchableOpacity, Alert, Pressable, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { deleteHabit, getWeeklyCompletionData } from '../../db/habitOps';

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
  },
  segments: 3, 
};

export default function HabitDetailScreen() {
  const { id, title, iconName, color, scanMethod } = useLocalSearchParams();
  const router = useRouter();
  const habitTitle = title as string;
  const habitColor = color as string;
  const habitIcon = iconName as string;
  const habitScanMethod = scanMethod as string;
  const habitId = Number(id);
  
  // State for weekly completion data
  const [habitData, setHabitData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch weekly data
  const fetchWeeklyData = async () => {
    if (habitId && habitId !== -1) {
      try {
        setIsLoading(true);
        const weeklyCompletions = await getWeeklyCompletionData(habitId);
        setHabitData(weeklyCompletions);
      } catch (error) {
        console.error('Error fetching weekly data:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (habitId && habitId !== -1) {
        const weeklyCompletions = await getWeeklyCompletionData(habitId);
        setHabitData(weeklyCompletions);
      }
    } catch (error) {
      console.error('Error refreshing weekly data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch weekly completion data when component mounts
  useEffect(() => {
    fetchWeeklyData();
  }, [habitId]);

  useFocusEffect(
    React.useCallback(() => {
      if (habitId && habitId !== -1) {
        fetchWeeklyData();
      }
    }, [habitId])
  );
  
  // Calculate completion stats
  const totalCompletions = habitData.reduce((sum, day) => sum + day, 0);
  const avgCompletions = totalCompletions / 7;
  const bestDay = Math.max(...habitData);
  
  // Find which day had the most completions
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const bestDayIndex = habitData.indexOf(bestDay);
  const bestDayName = daysOfWeek[bestDayIndex];

  // Get current day of week for chart highlighting
  const getCurrentDayIndex = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday=0, Sunday=6
  };

  const currentDayIndex = getCurrentDayIndex();
  
  // Create chart labels with current day highlighted
  const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, index) => 
    index === currentDayIndex ? `${label}*` : label
  );

  // Calculate chart Y-axis configuration
  const maxValue = Math.max(...habitData, 1);
  const chartMaxValue = Math.max(3, maxValue);
  
  // Prepare chart data for better scaling
  const chartData = [...habitData];
  
  // Create dynamic chart config based on data
  const dynamicChartConfig = {
    ...chartConfig,
    segments: 3, 
    yAxisInterval: Math.ceil(chartMaxValue / 3), 
  };

  const screenWidth = Dimensions.get('window').width - 32; 
  
  const handlePress = () => {
    router.push({
      pathname: '/habit/ActivityCaptureScreen',
      params: { color, scanMethod: habitScanMethod, habitId: habitId.toString(), habitTitle }
    });
  };

  const onDelete = () => {
    if (habitId === -1) {
      Alert.alert('Cannot Delete', 'This is not a real habit that can be deleted.');
      return;
    }
    
    Alert.alert(
      'Delete habit?',
      'This removes all completions too. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting habit with ID:', habitId);
              await deleteHabit(habitId);
              console.log('Habit deleted successfully');
              router.push({
                pathname: '/',
                params: { refresh: Date.now().toString() }
              });
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit. Please try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </Pressable>
        <View style={styles.header}>
          <Ionicons name={habitIcon as any} style={styles.icon}size={35} color={habitColor}/>
          <Text style={styles.title}>{habitTitle}</Text>
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFBF6"
            />
          }
        >
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>This Week's Statistics</Text>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading statistics...</Text>
              </View>
            ) : (
              <>
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
                  <Text style={styles.chartTitle}>Daily Completions (Current Week)</Text>
                  <Text style={styles.chartSubtitle}>* indicates today</Text>
                  <LineChart
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          data: chartData.length === 0 ? [0] : chartData,
                          color: (opacity = 1) => habitColor || `rgba(52, 152, 219, ${opacity})`,
                          strokeWidth: 2
                        }
                      ]
                    }}
                    width={screenWidth-50}
                    height={220}
                    chartConfig={dynamicChartConfig}
                    bezier
                    style={styles.chart}
                    yAxisInterval={dynamicChartConfig.yAxisInterval}
                    fromZero={true}
                    segments={3}
                    yAxisSuffix=""
                    yLabelsOffset={10}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    withDots={true}
                    withShadow={false}
                    withScrollableDot={false}
                    getDotColor={(dataPoint, dataPointIndex) => habitColor || '#3498db'}
                    formatYLabel={(value) => Math.round(Number(value)).toString()}
                  />
                </View>
              </>
            )}
            
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Tips to Improve</Text>
              <Text style={styles.tipText}>• Set a specific time each day for this habit</Text>
              {/* <Text style={styles.tipText}>• Track your progress daily in the app</Text>
              <Text style={styles.tipText}>• Share your goals with friends for accountability</Text> */}
            </View>
            
            <TouchableOpacity 
              style={[styles.completeButton, { backgroundColor: habitColor }]}
              onPress={handlePress}
              //onPress={() => router.navigate('/habit/ActivityCaptureScreen')}
              activeOpacity={0.8}
              
            >
              <Text style={styles.completeButtonText}>Complete</Text>
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
    top: 18,
    left: 20,
    zIndex: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5D737A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 18,
    right: 20,
    zIndex: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 8,
    flexDirection: 'row',
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
  chartSubtitle: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
    color: '#FFFBF6',
    opacity: 0.8,
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFBF6',
    fontSize: 16,
    fontStyle: 'italic',
  },
});
