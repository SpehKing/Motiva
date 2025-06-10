import { db } from './index';
import { habits, completions } from './schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// Utility function to get current date in UTC+2 timezone
function getTodayInUTCPlus2(): string {
  const now = new Date();
  // Add 2 hours to get UTC+2
  const utcPlus2 = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  return utcPlus2.toISOString().split('T')[0];
}

// Utility function to get a date offset by days in UTC+2 timezone
function getDateInUTCPlus2(daysOffset: number = 0): string {
  const now = new Date();
  // Add 2 hours to get UTC+2
  const utcPlus2 = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  // Apply the day offset
  utcPlus2.setDate(utcPlus2.getDate() + daysOffset);
  return utcPlus2.toISOString().split('T')[0];
}

// Type for habit data matching the UI requirements
export type HabitData = {
  id?: number;
  iconName: string;
  title: string;
  status: string;
  scanMethod: string;
  color: string;
};

// Type for database habit record
export type DbHabit = {
  id: number;
  name: string;
  color: string;
  icon: string;
  freq: string;
  scanMethod: string;
};

// Get all habits from database
export async function getAllHabits(): Promise<HabitData[]> {
  try {
    const dbHabits = await db.select().from(habits);
    
    // Convert database habits to UI format
    const uiHabits: HabitData[] = await Promise.all(
      dbHabits.map(async (habit) => {
        // Check if habit is completed today
        const today = getTodayInUTCPlus2();
        const todayCompletions = await db.select()
          .from(completions)
          .where(and(
            eq(completions.habitId, habit.id),
            eq(completions.dateISO, today)
          ));
        
        return {
          id: habit.id,
          iconName: habit.icon,
          title: habit.name,
          status: todayCompletions.length > 0 ? 'Done' : 'Not Done',
          scanMethod: habit.scanMethod || 'Take a picture',
          color: habit.color,
        };
      })
    );
    
    // Only add the "New Habit" card if there are fewer than 6 habits
    if (uiHabits.length < 6) {
      uiHabits.push({
        id: -1, // Special ID that won't conflict with database auto-increment IDs
        iconName: 'add-outline',
        title: 'New Habit',
        status: 'No Habit',
        scanMethod: 'Null',
        color: '#5D737A'
      });
    }
    
    return uiHabits;
  } catch (error) {
    console.error('Error getting habits from database:', error);
    // Only show "New Habit" card in error state if we can't verify the count
    return [
      {
        id: -1, // Special ID that won't conflict with database auto-increment IDs
        iconName: 'add-outline',
        title: 'New Habit',
        status: 'No Habit',
        scanMethod: 'Null',
        color: '#5D737A'
      }
    ];
  }
}

// Get the count of habits in the database
export async function getHabitCount(): Promise<number> {
  try {
    const dbHabits = await db.select().from(habits);
    return dbHabits.length;
  } catch (error) {
    console.error('Error getting habit count from database:', error);
    return 0;
  }
}

// Save a new habit to database
export async function saveHabit(habitData: Omit<HabitData, 'id' | 'status'>): Promise<number> {
  try {
    // Check if we already have 6 habits
    const currentCount = await getHabitCount();
    if (currentCount >= 6) {
      throw new Error('Maximum number of habits (6) already reached');
    }

    const result = await db.insert(habits).values({
      name: habitData.title,
      color: habitData.color,
      icon: habitData.iconName,
      freq: 'daily', // Default frequency
      scanMethod: habitData.scanMethod,
    }).returning({ id: habits.id });
    
    console.log('Habit saved successfully:', result[0].id);
    return result[0].id;
  } catch (error) {
    console.error('Error saving habit to database:', error);
    throw error;
  }
}

// Update habit status (mark as complete/incomplete)
export async function updateHabitStatus(habitId: number, completed: boolean): Promise<void> {
  try {
    const today = getTodayInUTCPlus2();
    
    if (completed) {
      // Add completion record for today
      await db.insert(completions).values({
        habitId: habitId,
        dateISO: today,
        imageUri: null,
        conf: null,
      });
    } else {
      // Remove completion record for today
      await db.delete(completions)
        .where(and(
          eq(completions.habitId, habitId),
          eq(completions.dateISO, today)
        ));
    }
    
    console.log(`Habit ${habitId} status updated: ${completed ? 'completed' : 'not completed'}`);
  } catch (error) {
    console.error('Error updating habit status:', error);
    throw error;
  }
}

// Initialize with default habits if database is empty
export async function initializeDefaultHabits(): Promise<void> {
  try {
    const existingHabits = await db.select().from(habits);
    
    if (existingHabits.length === 0) {
      console.log('🌱 Initializing default habits...');
      const defaultHabits = [
        { name: 'Running', icon: 'walk-outline', color: '#27ae60', scanMethod: 'Take a picture of the path' },
        { name: 'Climbing', icon: 'trending-up-outline', color: '#e67e22', scanMethod: 'Take a picture of the climbing wall/climbing gym' },
        { name: 'Reading', icon: 'book-outline', color: '#2980b9', scanMethod: 'Take a picture of the book' },
        { name: 'Cleaning', icon: 'brush-outline', color: '#8e44ad', scanMethod: 'Take a picture of a clean apartment' },
      ];
      
      for (const habit of defaultHabits) {
        await db.insert(habits).values({
          name: habit.name,
          color: habit.color,
          icon: habit.icon,
          freq: 'daily',
          scanMethod: habit.scanMethod,
        });
      }
      
      console.log('✅ Default habits initialized');
    } else {
      console.log('📋 Existing habits found, skipping default initialization');
    }
  } catch (error) {
    console.error('❌ Error initializing default habits:', error);
    throw error;
  }
}

// Get weekly completion data for a specific habit
export async function getWeeklyCompletionData(habitId: number): Promise<number[]> {
  try {
    // Get the last 7 days including today in UTC+2
    const today = getTodayInUTCPlus2();
    const weekAgo = getDateInUTCPlus2(-6); // 6 days ago + today = 7 days
    
    // Use the UTC+2 dates directly
    const startDate = weekAgo;
    const endDate = today;
    
    // Get all completions for this habit in the last 7 days
    const weeklyCompletions = await db.select()
      .from(completions)
      .where(and(
        eq(completions.habitId, habitId),
        gte(completions.dateISO, startDate),
        lte(completions.dateISO, endDate)
      ));
    
    // Create an array for the last 7 days with completion counts
    const weeklyData: number[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const dateISO = getDateInUTCPlus2(-i); // Get date i days ago in UTC+2
      
      // Count completions for this date (should be 0 or 1 for daily habits)
      const completionsForDay = weeklyCompletions.filter(c => c.dateISO === dateISO).length;
      weeklyData.push(completionsForDay);
    }
    
    return weeklyData;
  } catch (error) {
    console.error('Error getting weekly completion data:', error);
    // Return empty data on error
    return [0, 0, 0, 0, 0, 0, 0];
  }
}

export async function deleteHabit(id: number) {
  try {
    console.log('🗑️ Deleting habit with ID:', id);
    
    // First delete related completions
    const deletedCompletions = await db.delete(completions).where(eq(completions.habitId, id));
    console.log('🗑️ Deleted completions for habit:', id);
    
    // Then delete the habit itself
    const deletedHabit = await db.delete(habits).where(eq(habits.id, id));
    console.log('🗑️ Deleted habit:', id);
    
    console.log('✅ Habit deletion completed successfully');
  } catch (error) {
    console.error('❌ Error deleting habit:', error);
    throw error;
  }
}
