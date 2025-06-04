// Simple database test that can be run in the Expo environment
import { eq } from 'drizzle-orm';
import { initializeDatabase } from '../db';
import { saveHabit, getAllHabits } from '../db/habitOps';

export const runDatabaseTest = async (): Promise<boolean> => {
  try {
    console.log('🔄 Initializing database...');
    await initializeDatabase();
    
    console.log('🔄 Inserting test habit...');
    await saveHabit({
      iconName: 'flame-outline',
      title: 'Smoke Test Habit',
      scanMethod: 'Take a picture for testing',
      color: '#314146'
    });

    console.log('🔄 Reading habits from database...');
    const habits = await getAllHabits();
    console.log(`✅ Database test successful! Found ${habits.length} habit(s)`);
    
    if (habits.length > 0) {
      console.log('📋 Last habit:', habits[habits.length - 1]);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};
