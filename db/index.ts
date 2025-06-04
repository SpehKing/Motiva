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
    
    // Check if tables exist
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      // Only create tables if they don't exist
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
    // Try to query the habits table
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

// For development: Reset database by dropping and recreating tables
export const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database...');
    
    // Alternative approach: Delete all data instead of dropping tables
    try {
      // Delete all completions first (child table)
      await db.run(sql`DELETE FROM completions`);
      console.log('🗑️ Cleared completions table');
      
      // Delete all habits (parent table)
      await db.run(sql`DELETE FROM habits`);
      console.log('🗑️ Cleared habits table');
      
      console.log('✅ Database reset successfully');
    } catch (deleteError) {
      // If delete approach fails, try the drop table approach
      console.log('Delete approach failed, trying drop tables...');
      
      // Disable foreign key constraints temporarily
      await db.run(sql`PRAGMA foreign_keys = OFF`);
      
      // Drop existing tables (order matters due to foreign keys)
      await db.run(sql`DROP TABLE IF EXISTS completions`);
      await db.run(sql`DROP TABLE IF EXISTS habits`);
      console.log('🗑️ Dropped existing tables');
      
      // Re-enable foreign key constraints
      await db.run(sql`PRAGMA foreign_keys = ON`);
      
      // Recreate tables
      await createTables();
      console.log('✅ Tables recreated successfully');
    }
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    // Make sure to re-enable foreign keys even if there's an error
    try {
      await db.run(sql`PRAGMA foreign_keys = ON`);
    } catch (pragmaError) {
      console.error('Failed to re-enable foreign keys:', pragmaError);
    }
    throw error;
  }
};

// Export schema tables for easy access
export { habits, completions };
