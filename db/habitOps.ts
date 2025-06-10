import { db } from './index';
import { habits, completions } from './schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// Utility function to get current date in local timezone
function getTodayLocal(): string {
  const now = new Date();
  // Use local date by getting year, month, day in user's timezone
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Utility function to get a date offset by days in local timezone
function getDateLocal(daysOffset: number = 0): string {
  const now = new Date();
  // Create a new date with the offset
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysOffset);
  
  // Get the date components in local timezone
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    
    const uiHabits: HabitData[] = await Promise.all(
      dbHabits.map(async (habit) => {
        const today = getTodayLocal();
        console.log('Checking completions for habit:', habit.name, 'on date:', today);
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
        id: -1,
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
    return [
      {
        id: -1,
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
    const currentCount = await getHabitCount();
    if (currentCount >= 6) {
      throw new Error('Maximum number of habits (6) already reached');
    }

    const result = await db.insert(habits).values({
      name: habitData.title,
      color: habitData.color,
      icon: habitData.iconName,
      freq: 'daily',
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
    const today = getTodayLocal();
    console.log(today)
    
    if (completed) {
      await db.insert(completions).values({
        habitId: habitId,
        dateISO: today,
        imageUri: null,
        conf: null,
      });
    } else {
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

// Get weekly completion data for a specific habit (current week: Monday to Sunday)
export async function getWeeklyCompletionData(habitId: number): Promise<number[]> {
  try {
    const today = new Date();
    
    // Get the start of this week (Monday)
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);
    
    // Get the end of this week (Sunday)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    // Format dates to ISO strings
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const startDate = formatDate(monday);
    const endDate = formatDate(sunday);
    
    console.log(`Getting weekly data for habit ${habitId} from ${startDate} to ${endDate}`);
    
    const weeklyCompletions = await db.select()
      .from(completions)
      .where(and(
        eq(completions.habitId, habitId),
        gte(completions.dateISO, startDate),
        lte(completions.dateISO, endDate)
      ));
    
    const weeklyData: number[] = [];
    
    // Generate completion counts for each day of the week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);
      const dateISO = formatDate(currentDay);
      
      const completionsForDay = weeklyCompletions.filter(c => c.dateISO === dateISO).length;
      weeklyData.push(completionsForDay);
    }
    
    console.log(`Weekly data for habit ${habitId}:`, weeklyData);
    return weeklyData;
  } catch (error) {
    console.error('Error getting weekly completion data:', error);
    return [0, 0, 0, 0, 0, 0, 0];
  }
}

export async function deleteHabit(id: number) {
  try {
    console.log('🗑️ Deleting habit with ID:', id);
    
    const deletedCompletions = await db.delete(completions).where(eq(completions.habitId, id));
    console.log('🗑️ Deleted completions for habit:', id);
    
    const deletedHabit = await db.delete(habits).where(eq(habits.id, id));
    console.log('🗑️ Deleted habit:', id);
    
    console.log('✅ Habit deletion completed successfully');
  } catch (error) {
    console.error('❌ Error deleting habit:', error);
    throw error;
  }
}
