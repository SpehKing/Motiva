import { db, initializeDatabase } from '../db';
import { habits } from '../db/schema';

async function runSmokeTest() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Insert a test habit
    await db.insert(habits).values({
      name: 'Smoke Test',
      color: '#314146',
      icon: 'flame',
      freq: 'daily',
    });

    // Read all habits
    const rows = await db.select().from(habits);
    console.log('Habit rows:', rows.length);
    console.log('Test habit:', rows[rows.length - 1]);
    
    process.exit(0);
  } catch (error) {
    console.error('Smoke test failed:', error);
    process.exit(1);
  }
}

runSmokeTest();
