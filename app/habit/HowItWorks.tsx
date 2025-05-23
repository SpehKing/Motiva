import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';

const CARD_WIDTH = Dimensions.get('window').width * 0.8;

export default function HowItWorksScreen() {
  const cards = [
  { id: 1, title: 'Step 1', text: 'Create a new habit.' },
  { id: 2, title: 'Step 2', text: 'Completed habits are shown in the main menu.' },
  { id: 3, title: 'Step 3', text: 'Scan activity to show that you completed your habit.\n\nCheck statistics of done habits.' },
  { id: 4, title: 'Step 4', text: 'Level up to create new habits.' },
];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>
            <Text style={styles.title}>How it works</Text>
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardScroll}
        >
          {cards.map((card, index) => (
            <View
                key={card.id}
                style={[
                styles.card,
                index < cards.length - 1 && { marginRight: 24 },
                ]}
            >
                <Text style={styles.cardTitle}>{card.title}</Text>
                <View style={styles.cardBody}>
                <Text style={styles.cardText}>{card.text}</Text>
                </View>
            </View>
            ))}

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 32,
    flexDirection: 'row',
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFBF6',
  },
  cardScroll: {
    paddingHorizontal: '10%',
  },
  card: {
  width: CARD_WIDTH,
  padding: 20,
  backgroundColor: '#FFFBF6',
  borderRadius: 16,
  borderLeftWidth: 6,
  borderColor: '#FFF47B',
  flexDirection: 'column',
},

cardTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#314146',
  textAlign: 'center',
  marginTop: 16,
},

cardBody: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 8,
},

cardText: {
  fontSize: 16,
  color: '#314146',
  textAlign: 'center',
},
  footer: {
    alignItems: 'center',
    height: 'auto',
    margin: 32,
  },
  button: {
    backgroundColor: '#FFF47B',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#314146',
  },
});
