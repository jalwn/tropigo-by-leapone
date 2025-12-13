// Database Schema - TropiGo
import { pgTable, text, timestamp, decimal, boolean, doublePrecision } from 'drizzle-orm/pg-core'

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'tourist' | 'host' | 'admin' | 'guest'
  isGuest: boolean('is_guest').default(false).notNull(), // Mark guest users
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Experiences table (Activities)
export const experiences = pgTable('experiences', {
  id: text('id').primaryKey(),
  hostId: text('host_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // 'island' | 'diving' | 'boat-trip' | 'culture' | 'water-sport'
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  island: text('island').notNull(),
  images: text('images').array().notNull().default([]),
  rating: decimal('rating', { precision: 3, scale: 2 }), // 0.00 to 5.00
  reviewCount: text('review_count').default('0'),
  duration: text('duration'), // e.g., "4 hours"
  maxGroupSize: text('max_group_size'), // e.g., "8"
  hostType: text('host_type').default('local'), // 'local' | 'freelance' | 'company'
  whatsIncluded: text('whats_included').array().default([]), // Array of included items
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Wishlist table
export const wishlist = pgTable('wishlist', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  experienceId: text('experience_id').notNull().references(() => experiences.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Bookings table
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  experienceId: text('experience_id').notNull().references(() => experiences.id),
  bookingDate: timestamp('booking_date').notNull(),
  numberOfGuests: text('number_of_guests').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Reviews table
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  experienceId: text('experience_id').notNull().references(() => experiences.id),
  rating: decimal('rating', { precision: 3, scale: 2 }).notNull(), // 1.00 to 5.00
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// AI Trip Plans table (for Maldy feature)
export const aiTripPlans = pgTable('ai_trip_plans', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  itinerary: text('itinerary').notNull(), // JSON string of the itinerary
  preferences: text('preferences'), // JSON string of user preferences
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Conversations table (for Maldy AI chat)
export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title'), // Auto-generated from first message
  messages: text('messages').notNull().default('[]'), // JSON array of messages
  status: text('status').notNull().default('active'), // 'active' | 'archived'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Landmarks table
export const landmarks = pgTable('landmarks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'historic' | 'cultural' | 'nature' | 'viewpoint'
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  defaultLanguage: text('default_language').notNull().default('en'),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Landmark translations for multi-language support
export const landmarkTranslations = pgTable('landmark_translations', {
  id: text('id').primaryKey(),
  landmarkId: text('landmark_id').notNull().references(() => landmarks.id),
  language: text('language').notNull(), // e.g., 'en', 'dv'
  name: text('name').notNull(),
  description: text('description').notNull(),
})

// ============= Inferred Types =============
// These types are auto-generated from the schema above
// Use these throughout your app instead of manually defining types

export type User = typeof users.$inferSelect       // For reading from DB
export type NewUser = typeof users.$inferInsert    // For inserting to DB

export type Experience = typeof experiences.$inferSelect
export type NewExperience = typeof experiences.$inferInsert

export type WishlistItem = typeof wishlist.$inferSelect
export type NewWishlistItem = typeof wishlist.$inferInsert

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert

export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert

export type AITripPlan = typeof aiTripPlans.$inferSelect
export type NewAITripPlan = typeof aiTripPlans.$inferInsert

export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert

export type Landmark = typeof landmarks.$inferSelect
export type NewLandmark = typeof landmarks.$inferInsert

export type LandmarkTranslation = typeof landmarkTranslations.$inferSelect
export type NewLandmarkTranslation = typeof landmarkTranslations.$inferInsert
