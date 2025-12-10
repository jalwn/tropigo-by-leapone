# TropiGo

A marketplace connecting tourists with local Maldivian experiences.

## Monorepo Structure

```
tropigo/
├── apps/
│   ├── api/          # Hono backend API
│   └── ui/           # React frontend
└── packages/
    ├── types/        # Shared TypeScript types
    └── utils/        # Shared utilities
```

## Getting Started

### 1. Install dependencies
```bash
bun install
```

### 2. Start the database
```bash
docker compose up -d
```

### 3. Push database schema (creates tables)
```bash
bun run db:push
```

### 4. (Optional) Seed with sample data
```bash
bun run db:seed
```

### 5. Run both apps

**Option 1: Single command (recommended)**
```bash
bun run dev
# Runs both API (localhost:8060) and UI (localhost:8070)
```

**Option 2: Separate terminals**
```bash
# Terminal 1 - API (localhost:8060)
bun run dev:api

# Terminal 2 - UI (localhost:8070)
bun run dev:ui
```

### View/edit database with Drizzle Studio
```bash
bun run db:studio
# Opens at http://localhost:4983
```

## Database

**Tables:** `users`, `experiences` (see `apps/api/src/db/schema.ts`)

**Scripts:**
- `bun run db:push` - Push schema changes to database (fast, for development)
- `bun run db:seed` - Populate database with sample data (3 users, 4 experiences)
- `bun run db:generate` - Generate migration files
- `bun run db:migrate` - Run migrations
- `bun run db:studio` - Open Drizzle Studio GUI

**Example query:**
```typescript
import { db, experiences } from './db'

// Get all experiences
const allExperiences = await db.select().from(experiences)

// Insert new experience
await db.insert(experiences).values({
  id: generateId(),
  hostId: 'user-123',
  title: 'Fishing Trip',
  // ... other fields
})
```

## How to Add Features

### 1. Add new types to `packages/types`

```typescript
// packages/types/src/index.ts
export interface Booking {
  id: string;
  experienceId: string;
  // ... add your fields
}
```

### 2. Use types in API

```typescript
// apps/api/src/index.ts
import type { Booking } from '@tropigo/types'

app.post('/api/bookings', async (c) => {
  const booking: Booking = await c.req.json()
  // ... your logic
})
```

### 3. Use types in UI

```typescript
// apps/ui/src/SomeComponent.tsx
import type { Booking } from '@tropigo/types'

const [bookings, setBookings] = useState<Booking[]>([])
```

### 4. Add shared utilities

```typescript
// packages/utils/src/index.ts
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

## Project Ideas to Build

- User authentication (tourist/host login)
- Experience listing and search
- Booking system
- Review and rating system
- Community Q&A feed
- AI trip planner (Maldy)
- Real-time chat between tourists and hosts
- Image/video upload for experiences
- Payment integration

## Deployment (Coming Soon)

We'll add deployment scripts for VPS and GitHub Actions later!
