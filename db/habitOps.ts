import { db } from './index';
import { habits, completions } from './schema';
import { eq } from 'drizzle-orm';

export async function deleteHabit(id: number) {
  await db.delete(completions).where(eq(completions.habitId, id)); // clean children
  await db.delete(habits).where(eq(habits.id, id));
}
