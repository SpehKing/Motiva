import { StyleSheet, View, Text, ScrollView, SafeAreaView } from 'react-native';
import Card from '../components/Card';

export default function MainScreen() {
const cardData = [
  { iconName: 'walk-outline', title: 'Running', status: 'Improving', color: '#27ae60' },
  { iconName: 'trending-up-outline', title: 'Climbing', status: 'Getting Started', color: '#e67e22' },
  { iconName: 'book-outline', title: 'Reading', status: 'Consistent', color: '#2980b9' },
  { iconName: 'brush-outline', title: 'Cleaning', status: 'Good Effort', color: '#8e44ad' },
  { iconName: 'leaf-outline', title: 'Meditation', status: 'Growing', color: '#16a085' },
  { iconName: 'nutrition-outline', title: 'Healthy Eating', status: 'Stable', color: '#c0392b' },
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
    paddingTop: 32,
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
