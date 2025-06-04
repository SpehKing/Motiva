import { db } from './index';
import { habits, completions } from './schema';
import { eq, and } from 'drizzle-orm';

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
        const today = new Date().toISOString().split('T')[0];
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
    
    // Add the "New Habit" card at the end
    uiHabits.push({
      id: -1, // Special ID that won't conflict with database auto-increment IDs
      iconName: 'add-outline',
      title: 'New Habit',
      status: 'No Habit',
      scanMethod: 'Null',
      color: '#5D737A'
    });
    
    return uiHabits;
  } catch (error) {
    console.error('Error getting habits from database:', error);
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

// Save a new habit to database
export async function saveHabit(habitData: Omit<HabitData, 'id' | 'status'>): Promise<number> {
  try {
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
    const today = new Date().toISOString().split('T')[0];
    
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
