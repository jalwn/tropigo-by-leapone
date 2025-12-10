// Database Schema - Example tables
import { pgTable, text, timestamp, decimal } from 'drizzle-orm/pg-core'

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'tourist' | 'host' | 'admin'
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Experiences table
export const experiences = pgTable('experiences', {
  id: text('id').primaryKey(),
  hostId: text('host_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // 'fishing' | 'diving' | 'island-hopping' | 'cultural'
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  island: text('island').notNull(),
  images: text('images').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============= Inferred Types =============
// These types are auto-generated from the schema above
// Use these throughout your app instead of manually defining types

export type User = typeof users.$inferSelect       // For reading from DB
export type NewUser = typeof users.$inferInsert    // For inserting to DB

export type Experience = typeof experiences.$inferSelect
export type NewExperience = typeof experiences.$inferInsert
