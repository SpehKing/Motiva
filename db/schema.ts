import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const habits = sqliteTable('habits', {
  id:     integer('id').primaryKey({ autoIncrement: true }),
  name:   text('name').notNull(),
  color:  text('color').notNull(),
  icon:   text('icon').notNull(),
  freq:   text('freq').notNull(),           // "daily" | "weekly"
});

export const completions = sqliteTable('completions', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  habitId:   integer('habit_id').references(() => habits.id),
  dateISO:   text('date_iso').notNull(),
  imageUri:  text('image_uri'),
  conf:      integer('conf'),
});
