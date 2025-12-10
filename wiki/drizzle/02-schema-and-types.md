# Schema and Types

## Our Approach: Type Inference

We use **Drizzle's type inference** instead of manually defining types. This means:
- Define the schema once in `schema.ts`
- Types are auto-generated from the schema
- Single source of truth - no duplication
- Change the schema, types update everywhere

## Current Tables

### Users Table

**File:** `apps/api/src/db/schema.ts`

```typescript
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'tourist' | 'host' | 'admin'
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

**Generated SQL:**
```sql
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Experiences Table

```typescript
export const experiences = pgTable('experiences', {
  id: text('id').primaryKey(),
  hostId: text('host_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  island: text('island').notNull(),
  images: text('images').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

**Foreign Key:** `hostId` references `users.id`

## Inferred Types

At the bottom of `schema.ts`:

```typescript
// For SELECT queries (reading from DB)
export type User = typeof users.$inferSelect
export type Experience = typeof experiences.$inferSelect

// For INSERT queries (writing to DB)
export type NewUser = typeof users.$inferInsert
export type NewExperience = typeof experiences.$inferInsert
```

### What's the difference?

**$inferSelect** - Reading from database:
- Includes all fields with their actual types
- `createdAt` is a `Date` object
- Use this for query results

**$inferInsert** - Writing to database:
- Optional fields with defaults (like `id`, `createdAt`)
- Use this when inserting new rows

## Using Types in Your Code

### In the API

```typescript
import type { Experience, NewExperience } from './db/schema'

// Reading experiences
const experiences: Experience[] = await db.select().from(experiences)

// Inserting new experience
const newExp: NewExperience = {
  id: generateId(),
  hostId: 'user-123',
  title: 'Fishing Trip',
  // createdAt is optional (has default)
}
await db.insert(experiences).values(newExp)
```

### In the UI

```typescript
import type { Experience } from '../../api/src/db/schema'

const [experiences, setExperiences] = useState<Experience[]>([])
```

## Adding a New Table

1. **Define the schema:**

```typescript
// In apps/api/src/db/schema.ts
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id').references(() => experiences.id),
  touristId: text('tourist_id').references(() => users.id),
  date: timestamp('date').notNull(),
  guests: integer('guests').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
  status: text('status').notNull(), // 'pending' | 'confirmed' | 'cancelled'
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

2. **Export inferred types:**

```typescript
export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert
```

3. **Export from db/index.ts:**

```typescript
export * from './schema'
```

4. **Push to database:**

```bash
bun run db:push
```

Done! The table is created and types are available everywhere.

## Common Field Types

| Drizzle | PostgreSQL | TypeScript |
|---------|------------|------------|
| `text('name')` | TEXT | string |
| `integer('age')` | INTEGER | number |
| `decimal('price', { precision: 10, scale: 2 })` | DECIMAL(10,2) | string |
| `boolean('active')` | BOOLEAN | boolean |
| `timestamp('date')` | TIMESTAMP | Date |
| `text('tags').array()` | TEXT[] | string[] |
| `json('data')` | JSON | any |

## Important Notes

- **Decimal fields** return as `string` from PostgreSQL (for precision)
- Convert to number in UI: `Number(experience.price)`
- Use `generateId()` from `@tropigo/utils` for IDs
- Always export new types after adding tables
