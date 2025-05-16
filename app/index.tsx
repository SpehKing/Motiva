import { StyleSheet, View, Text, ScrollView, SafeAreaView } from 'react-native';
import Card from '../components/Card';

export default function MainScreen() {
  const cardData = [
    { iconName: 'calendar-outline', title: 'Calendar', status: 'Active', color: '#2ecc71' },
    { iconName: 'fitness-outline', title: 'Fitness', status: 'In Progress', color: '#e74c3c' },
    { iconName: 'water-outline', title: 'Hydration', status: 'Great', color: '#3498db' },
    { iconName: 'bed-outline', title: 'Sleep', status: 'Needs Attention', color: '#f39c12' },
    { iconName: 'restaurant-outline', title: 'Nutrition', status: 'Good', color: '#9b59b6' },
    { iconName: 'heart-outline', title: 'Health', status: 'Excellent', color: '#16a085' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Motiva Dashboard</Text>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%', // Just under 50% to account for spacing
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
