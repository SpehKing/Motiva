// Database population utility for development
import { resetDatabase } from '../db';
import { getAllHabits, initializeDefaultHabits } from '../db/habitOps';

export const populateDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔄 Populating database with default habits...');
    
    // First reset the database to clear all existing data
    await resetDatabase();
    console.log('🗑️ Database cleared');
    
    // Initialize default habits
    await initializeDefaultHabits();
    console.log('🌱 Default habits added');

    // Verify the population worked
    const habits = await getAllHabits();
    console.log(`✅ Database populated successfully! Added ${habits.length - 1} habit(s)`); // -1 to exclude "New Habit" card
    
    if (habits.length > 1) {
      const realHabits = habits.filter(h => h.title !== 'New Habit');
      console.log('📋 Populated habits:', realHabits.map(h => h.title).join(', '));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database population failed:', error);
    return false;
  }
};
