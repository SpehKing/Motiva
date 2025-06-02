const { db, initializeDatabase } = require('../db');
const { habits } = require('../db/schema');
const { deleteHabit } = require('../db/habitOps');

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

    /* delete-test */
    if (rows.length > 0) {
      await deleteHabit(rows[rows.length - 1].id);
      const rowsAfter = await db.select().from(habits).all();
      console.log('Rows after delete:', rowsAfter.length); // expect 0
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Smoke test failed:', error);
    process.exit(1);
  }
}

runSmokeTest();
