// Database connection
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Export schema for use in queries
export * from './schema'

// Connection string from docker-compose
const connectionString = process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/tropigo'

// Create postgres client
const client = postgres(connectionString)

// Create drizzle instance
export const db = drizzle(client, { schema })
