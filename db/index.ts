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
    await db.run(sql`CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      freq TEXT NOT NULL
    )`);

    await db.run(sql`CREATE TABLE IF NOT EXISTS completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER,
      date_iso TEXT NOT NULL,
      image_uri TEXT,
      conf INTEGER,
      FOREIGN KEY (habit_id) REFERENCES habits (id)
    )`);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Export schema tables for easy access
export { habits, completions };
