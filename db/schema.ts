// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const applications = sqliteTable('training_applications', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  experience: text('experience').notNull(),
  course: text('course').notNull(),
  schedule: text('schedule').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('Requested'),
  consentVersion: text('consent_version').notNull(),
  createdAt: integer('created_at').notNull(),
});
