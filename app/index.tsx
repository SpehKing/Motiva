import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { Switch } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MainScreen() {
  const cardData = [
    { iconName: 'walk-outline', title: 'Running', status: 'Improving', color: '#27ae60' },
    { iconName: 'trending-up-outline', title: 'Climbing', status: 'Getting Started', color: '#e67e22' },
    { iconName: 'book-outline', title: 'Reading', status: 'Consistent', color: '#2980b9' },
    { iconName: 'brush-outline', title: 'Cleaning', status: 'Good Effort', color: '#8e44ad' },
    { iconName: 'leaf-outline', title: 'Meditation', status: 'Growing', color: '#16a085' },
    { iconName: 'nutrition-outline', title: 'Healthy Eating', status: 'Stable', color: '#c0392b' },
  ];

  const [isPanelOpen, setPanelOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const PANEL_HEIGHT = 250;
  const slideAnim = useRef(new Animated.Value(-PANEL_HEIGHT)).current;

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
    toValue: -PANEL_HEIGHT,
    duration: 300,
    useNativeDriver: false,
  }).start(() => {
    setPanelOpen(false);
  });
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Settings button */}
        <TouchableOpacity style={styles.settingsButton} onPress={openPanel}>
          <Ionicons name="settings-outline" size={28} color="#FFFBF6" />
        </TouchableOpacity>

        <Text style={styles.title}>Motiva Dashboard</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressWrapper}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '60%' }]} />
            </View>
            <View style={styles.circle}>
              <Text style={styles.circleText}>2</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.cardGrid}>
            {cardData.map((card, index) => (
              <View key={index} style={styles.cardWrapper}>
                <Card
                  iconName={card.iconName}
                  title={card.title}
                  status={card.status}
                  color={card.color}
                  id={card.title.toLowerCase().replace(/\s+/g, '-')}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Dark overlay */}
        {isPanelOpen && (
          <TouchableWithoutFeedback onPress={closePanel}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}

        {/* Sliding Panel */}
        <Animated.View style={[styles.sidePanel, { bottom: slideAnim }]}>
          <Text style={styles.panelTitle}>Settings</Text>
          <TouchableOpacity style={styles.panelButton}>
            <Text style={styles.panelButtonText}>How it works</Text>
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
        </Animated.View>
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
  zIndex: 10,
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
  left: 0,
  right: 0,
  height: 250,
  backgroundColor: '#5D737A',
  zIndex: 10,
  elevation: 6,
  padding: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
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
});
