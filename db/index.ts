import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import { habits, completions } from './schema';

const raw = SQLite.openDatabaseSync('motiva.db');
export const db = drizzle(raw, { schema });

// Simple table creation for first-run migration
export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      await createTables();
      console.log('✅ Database tables created successfully');
    } else {
      console.log('✅ Database tables already exist');
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Check if required tables exist
const checkTablesExist = async (): Promise<boolean> => {
  try {
    await db.run(sql`SELECT 1 FROM habits LIMIT 1`);
    await db.run(sql`SELECT 1 FROM completions LIMIT 1`);
    return true;
  } catch {
    return false;
  }
};

// Create tables with latest schema
const createTables = async () => {
  await db.run(sql`CREATE TABLE habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    freq TEXT NOT NULL,
    scan_method TEXT NOT NULL DEFAULT 'Take a picture'
  )`);

  await db.run(sql`CREATE TABLE completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER,
    date_iso TEXT NOT NULL,
    image_uri TEXT,
    conf INTEGER,
    FOREIGN KEY (habit_id) REFERENCES habits (id)
  )`);
};

// For development: Reset database by removing all habits and completions
export const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database...');
    
    await db.run(sql`DELETE FROM completions`);
    console.log('🗑️ Cleared all completions');
    
    await db.run(sql`DELETE FROM habits`);
    console.log('🗑️ Cleared all habits');
    
    console.log('✅ Database reset successfully - all habits and completions removed');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
};

export { habits, completions };
