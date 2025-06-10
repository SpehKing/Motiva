import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { populateDatabase } from '../utils/databaseTest';
import { initializeDatabase, resetDatabase } from '../db';
import { 
  getAllHabits, 
  saveHabit, 
  updateHabitStatus, 
  initializeDefaultHabits,
  getHabitCount,
  type HabitData 
} from '../db/habitOps';
import { AppStorage } from '../utils/storage';
import { resetOpenAIClient } from '../utils/aiService';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MainScreen() {
  const [cardData, setCardData] = useState<HabitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [processedNewHabit, setProcessedNewHabit] = useState<string | null>(null);

  const [isPanelOpen, setPanelOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const router = useRouter();
  const params = useLocalSearchParams();

  // Function to add a new habit
  const addNewHabit = async (newHabit: Omit<HabitData, 'status' | 'id'>) => {
    try {
      console.log('Adding new habit:', newHabit.title, 'Database initialized:', isInitialized);
      
      if (!isInitialized) {
        console.log('Database not ready, waiting for initialization...');
        let attempts = 0;
        const maxAttempts = 100; 
        
        while (!isInitialized && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
          if (attempts % 10 === 0) {
            console.log(`Still waiting for database initialization... attempt ${attempts}`);
          }
        }
        
        if (!isInitialized) {
          console.error('Database initialization timeout after 10 seconds');
          Alert.alert('Error', 'Database is taking too long to initialize. Please restart the app and try again.');
          return;
        }
      }
      
      // Check habit count before saving
      const currentCount = await getHabitCount();
      if (currentCount >= 6) {
        Alert.alert(
          'Maximum Habits Reached', 
          'You can only have up to 6 habits. Please delete an existing habit to add a new one.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.log('Database is ready, saving habit...');
      await saveHabit(newHabit);
      console.log('Habit saved, reloading habits list...');
      await loadHabits(); 
      console.log('New habit added successfully');
      Alert.alert('Success', `"${newHabit.title}" habit created successfully!`);
    } catch (error) {
      console.error('Error adding new habit:', error);
      if (error instanceof Error && error.message.includes('Maximum number of habits')) {
        Alert.alert(
          'Maximum Habits Reached', 
          'You can only have up to 6 habits. Please delete an existing habit to add a new one.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to save new habit. Please try again.');
      }
    }
  };

  // Function to update habit status
  const updateHabitStatusLocal = async (habitTitle: string, newStatus: string) => {
    try {
      const habit = cardData.find(h => h.title === habitTitle);
      if (habit && habit.id) {
        const completed = newStatus === 'Done';
        await updateHabitStatus(habit.id, completed);
        await loadHabits(); 
      }
    } catch (error) {
      console.error('Error updating habit status:', error);
      Alert.alert('Error', 'Failed to update habit status. Please try again.');
    }
  };

  // Function to load habits from database
  const loadHabits = async (skipInitCheck = false) => {
    try {
      if (!skipInitCheck && !isInitialized) {
        console.warn('Database not initialized yet, skipping loadHabits');
        return;
      }
      setIsLoading(true);
      const habits = await getAllHabits();
      setCardData(habits);
    } catch (error) {
      console.error('Error loading habits:', error);
      Alert.alert('Error', 'Failed to load habits from database.');
    } finally {
      setIsLoading(false);
    }
  };

  // Wrapper for button press
  const handleRefreshHabits = () => loadHabits();

  // Listen for new habit data from the NewHabit screen
  useEffect(() => {
    const processNewHabit = async () => {
      if (params.newHabit && typeof params.newHabit === 'string' && params.newHabit !== processedNewHabit) {
        try {
          console.log('Processing new habit from params:', params.newHabit);
          const newHabitData = JSON.parse(params.newHabit);
          setProcessedNewHabit(params.newHabit);
          await addNewHabit(newHabitData);
        } catch (error) {
          console.error('Error parsing new habit data:', error);
          Alert.alert('Error', 'Failed to process new habit data.');
        }
      }
    };
    
    if (isInitialized) {
      processNewHabit();
    }
  }, [params.newHabit, isInitialized, processedNewHabit]);

  // Listen for refresh requests
  useEffect(() => {
    if (params.refresh && isInitialized) {
      loadHabits();
    }
  }, [params.refresh, isInitialized]);

  // Initialize database on app startup
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('🚀 Starting database setup...');
        setIsLoading(true);
        setIsInitialized(false); 
        
        await initializeDatabase();
        console.log('📊 Database initialized, loading default habits...');
        
        await initializeDefaultHabits();
        console.log('🏠 Default habits loaded, setting initialization flag...');
        
        setIsInitialized(true); 
        console.log('✅ Database setup complete, loading habits...');
        
        await loadHabits(true); 
        console.log('✅ Database initialized and habits loaded on app startup');
      } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        setIsInitialized(false);
        Alert.alert('Database Error', 'Failed to initialize database. Please restart the app.');
      }
    };
    
    setupDatabase();
  }, []); 

  // Calculate progress based on completed habits
  const calculateProgress = () => {
    const habitsWithoutNewHabit = cardData.filter(card => card.title !== 'New Habit');
    const completedHabits = habitsWithoutNewHabit.filter(card => card.status === 'Done');
    const totalHabits = habitsWithoutNewHabit.length;
    
    if (totalHabits === 0) return { percentage: 0, completed: 0 };
    
    const percentage = Math.round((completedHabits.length / totalHabits) * 100);
    return { percentage, completed: completedHabits.length };
  };

  const progress = calculateProgress();

const openPanel = () => {
  setPanelOpen(true);
  Animated.timing(slideAnim, {
    toValue: 0,
    duration: 300,
    useNativeDriver: false,
  }).start();
};

const closePanel = () => {
  Animated.timing(slideAnim, {
    toValue: SCREEN_HEIGHT,
    duration: 300,
    useNativeDriver: false,
  }).start(() => {
    setPanelOpen(false);
  });
};

// Database populate function for development
const handleDatabasePopulate = async () => {
  try {
    const success = await populateDatabase();
    if (success) {
      await loadHabits(true); 
      Alert.alert('Database Populated', 'Database populated with default habits successfully!');
    } else {
      Alert.alert('Database Populate', 'Database population failed. Check console for details.');
    }
  } catch (error) {
    console.error('Database populate error:', error);
    Alert.alert('Database Populate', 'Database populate encountered an error. Check console for details.');
  }
};

// Database reset function for development
const handleDatabaseReset = async () => {
  try {
    Alert.alert(
      'Reset Database',
      'This will delete all habits and data. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              setIsInitialized(false);
              await resetDatabase();
              setIsInitialized(true);
              await loadHabits(true); 
              Alert.alert('Success', 'Database reset successfully! All habits have been removed.');
            } catch (error) {
              console.error('Error resetting database:', error);
              Alert.alert('Error', 'Failed to reset database.');
              setIsLoading(false);
            }
          },
        },
      ]
    );
  } catch (error) {
    console.error('Database reset error:', error);
    Alert.alert('Error', 'Database reset encountered an error.');
  }
};

  // Load API key on component mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const storedApiKey = await AppStorage.getApiKey();
        const hasKey = await AppStorage.hasApiKey();
        setHasApiKey(hasKey);
        if (storedApiKey) {
          setApiKey(storedApiKey);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };
    loadApiKey();
  }, []);

  // Function to save API key
  const handleSaveApiKey = async () => {
    try {
      if (!apiKey.trim()) {
        Alert.alert('Error', 'Please enter a valid API key');
        return;
      }
      
      if (!AppStorage.validateApiKey(apiKey.trim())) {
        Alert.alert(
          'Invalid API Key', 
          'Please enter a valid OpenAI API key. It should start with "sk-" and be at least 20 characters long.'
        );
        return;
      }
      
      await AppStorage.saveApiKey(apiKey.trim());
      resetOpenAIClient(); // Reset the OpenAI client to use the new key
      setHasApiKey(true);
      setShowApiKeyInput(false);
      Alert.alert('Success', 'OpenAI API key saved successfully!');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    }
  };

  // Function to remove API key
  const handleRemoveApiKey = () => {
    Alert.alert(
      'Remove API Key',
      'Are you sure you want to remove the OpenAI API key? AI verification will not work without it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await AppStorage.removeApiKey();
              resetOpenAIClient();
              setApiKey('');
              setHasApiKey(false);
              setShowApiKeyInput(false);
              Alert.alert('Success', 'API key removed successfully');
            } catch (error) {
              console.error('Error removing API key:', error);
              Alert.alert('Error', 'Failed to remove API key');
            }
          },
        },
      ]
    );
  };

  // Function to toggle API key input visibility
  const handleApiKeyToggle = () => {
    if (hasApiKey) {
      handleRemoveApiKey();
    } else {
      setShowApiKeyInput(!showApiKeyInput);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Motiva Dashboard</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressWrapper}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
            </View>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{progress.completed}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading habits...</Text>
            </View>
          ) : (
            <View style={styles.cardGrid}>
              {cardData.map((card, index) => (
                <View key={card.id !== undefined ? `habit-${card.id}` : `card-${index}`} style={styles.cardWrapper}>
                  <Card
                    iconName={card.iconName}
                    title={card.title}
                    status={card.status}
                    color={card.color}
                    scanMethod={card.scanMethod}
                    id={card.id?.toString() || card.title.toLowerCase().replace(/\s+/g, '-')}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Dark overlay */}
        {isPanelOpen && (
          <TouchableWithoutFeedback onPress={closePanel}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}

        {/* Sliding Panel */}
        <Animated.View style={[styles.sidePanel, { transform: [{ translateY: slideAnim }] }]}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={closePanel}>
            <Ionicons name="close" size={24} color="#FFFBF6" />
          </TouchableOpacity>
          
          <ScrollView style={styles.panelScrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.panelTitle}>Settings</Text>
            
            {/* OpenAI API Key Section */}
            <View style={styles.apiKeySection}>
              <View style={styles.apiKeyHeader}>
                <Text style={styles.apiKeyTitle}>OpenAI API Key</Text>
                <Text style={styles.apiKeyStatus}>
                  {hasApiKey ? '✅ Configured' : '❌ Not Set'}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.panelButton, { backgroundColor: hasApiKey ? '#e74c3c' : '#3498db' }]}
                onPress={handleApiKeyToggle}
              >
                <Text style={styles.panelButtonText}>
                  {hasApiKey ? 'Remove API Key' : 'Set API Key'}
                </Text>
              </TouchableOpacity>
              
              {showApiKeyInput && (
                <View style={styles.apiKeyInputContainer}>
                  <Text style={styles.apiKeyHelper}>
                    Enter your OpenAI API key (starts with "sk-"). You can get one from the OpenAI website.
                  </Text>
                  <TextInput
                    style={styles.apiKeyInput}
                    placeholder="sk-..."
                    placeholderTextColor="#888"
                    value={apiKey}
                    onChangeText={setApiKey}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <View style={styles.apiKeyButtonRow}>
                    <TouchableOpacity
                      style={[styles.apiKeyButton, styles.cancelButton]}
                      onPress={() => {
                        setShowApiKeyInput(false);
                        setApiKey('');
                      }}
                    >
                      <Text style={styles.apiKeyButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.apiKeyButton, styles.saveButton]}
                      onPress={handleSaveApiKey}
                    >
                      <Text style={styles.apiKeyButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.panelButton}
              onPress={() => router.navigate('/habit/HowItWorks')}>
              <Text style={styles.panelButtonText}>How it works</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.panelButton}
              onPress={handleRefreshHabits}>
              <Text style={styles.panelButtonText}>Refresh Habits</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.panelButton}
              onPress={handleDatabasePopulate}>
              <Text style={styles.panelButtonText}>Populate Database</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.panelButton}
              onPress={handleDatabaseReset}>
              <Text style={styles.panelButtonText}>Reset Database</Text>
            </TouchableOpacity>
            
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Enable Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                thumbColor={notificationsEnabled ? '#314146' : '#f4f3f4'}
                trackColor={{ false: '#ccc', true: '#FFF47B' }}
              />
            </View>
          </ScrollView>
        </Animated.View>

        {/* Settings button */}
        <TouchableOpacity style={styles.settingsButton} onPress={openPanel}>
          <Ionicons name="settings-outline" size={28} color="#FFFBF6" />
        </TouchableOpacity>
        
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
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  title: {
    paddingTop: 32,
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#FFFBF6',
  },
  settingsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 5,
    backgroundColor: '#5D737A',
    borderRadius: 30,
    padding: 12,
  },
  progressContainer: {
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  progressWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: 30,
    backgroundColor: '#5D737A',
    borderRadius: 15,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF47B',
    borderRadius: 15,
  },
  circle: {
    position: 'absolute',
    right: -5,
    top: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFBF6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  circleText: {
    fontWeight: 'bold',
    fontSize: 30,
    color: '#314146',
  },
  scrollContent: {
    flexGrow: 1,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#314146',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#314146',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFBF6',
    fontWeight: '500',
  },

  // Overlay and Panel
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 5,
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#5D737A',
    zIndex: 10,
    elevation: 6,
    paddingTop: 60, // Add top padding for status bar
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 11,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelScrollView: {
    flex: 1,
    paddingTop: 20,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFBF6',
  },
  panelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  panelButtonText: {
    fontSize: 16,
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#314146',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFBF6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 16,
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#314146',
  },
  
  // API Key styles
  apiKeySection: {
    marginBottom: 16,
    backgroundColor: '#FFFBF6',
    borderRadius: 10,
    padding: 12,
  },
  apiKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  apiKeyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#314146',
  },
  apiKeyStatus: {
    fontSize: 12,
    color: '#666',
  },
  apiKeyInputContainer: {
    marginTop: 12,
  },
  apiKeyHelper: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  apiKeyInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#314146',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  apiKeyButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  apiKeyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  apiKeyButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
});
