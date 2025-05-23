import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';

const CARD_WIDTH = Dimensions.get('window').width * 0.8;

export default function HowItWorksScreen() {
  const cards = [
    { id: 1, text: 'Step 1: Choose a habit to improve.' },
    { id: 2, text: 'Step 2: Track your progress daily.' },
    { id: 3, text: 'Step 3: Get motivated with insights.' },
    { id: 4, text: 'Step 4: Celebrate your growth!' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>How it works</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardScroll}
        >
          {cards.map((card) => (
            <View key={card.id} style={styles.card}>
              <Text style={styles.cardText}>{card.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.button}>
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
    paddingHorizontal: 16,
    paddingTop: 32,
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFBF6',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardScroll: {
    paddingHorizontal: 8,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: 16,
    padding: 20,
    backgroundColor: '#FFFBF6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    color: '#314146',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
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
