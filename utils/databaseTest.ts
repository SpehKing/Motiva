// Simple database test that can be run in the Expo environment
import { eq } from 'drizzle-orm';
import { db, initializeDatabase, habits } from '../db';

export const runDatabaseTest = async (): Promise<boolean> => {
  try {
    console.log('🔄 Initializing database...');
    await initializeDatabase();
    
    console.log('🔄 Inserting test habit...');
    await db.insert(habits).values({
      name: 'Smoke Test Habit',
      color: '#314146',
      icon: 'flame-outline',
      freq: 'daily',
    });

    console.log('🔄 Reading habits from database...');
    const rows = await db.select().from(habits);
    console.log(`✅ Database test successful! Found ${rows.length} habit(s)`);
    
    if (rows.length > 0) {
      console.log('📋 Last habit:', rows[rows.length - 1]);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};

export const clearTestData = async (): Promise<void> => {
  try {
    // Remove any test habits
    await db.delete(habits).where(eq(habits.name, 'Smoke Test Habit'));
    console.log('🧹 Test data cleared');
  } catch (error) {
    console.error('Error clearing test data:', error);
  }
};
