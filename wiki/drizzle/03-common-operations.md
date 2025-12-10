# Common Database Operations

Quick reference for the most common database operations you'll need.

## Setup

Always import from `./db`:

```typescript
import { db, users, experiences } from './db'
import { eq, and, or, like, gte, lte } from 'drizzle-orm'
import { generateId } from '@tropigo/utils'
```

## SELECT Queries

### Get all records

```typescript
const allExperiences = await db.select().from(experiences)
```

### Get by ID

```typescript
const user = await db
  .select()
  .from(users)
  .where(eq(users.id, 'user-123'))
  .limit(1)

// Get first result or undefined
const [firstUser] = user
```

### Get with conditions

```typescript
// Single condition
const hosts = await db
  .select()
  .from(users)
  .where(eq(users.role, 'host'))

// Multiple conditions (AND)
const cheapFishing = await db
  .select()
  .from(experiences)
  .where(
    and(
      eq(experiences.category, 'fishing'),
      lte(experiences.price, '50.00')
    )
  )

// Multiple conditions (OR)
const waterActivities = await db
  .select()
  .from(experiences)
  .where(
    or(
      eq(experiences.category, 'diving'),
      eq(experiences.category, 'snorkeling')
    )
  )
```

### Search with LIKE

```typescript
const searchResults = await db
  .select()
  .from(experiences)
  .where(like(experiences.title, '%island%'))
```

### Limit and offset (pagination)

```typescript
const page = 1
const pageSize = 10

const paginatedExperiences = await db
  .select()
  .from(experiences)
  .limit(pageSize)
  .offset((page - 1) * pageSize)
```

### Order by

```typescript
// Ascending
const cheapest = await db
  .select()
  .from(experiences)
  .orderBy(experiences.price)

// Descending
import { desc } from 'drizzle-orm'

const mostExpensive = await db
  .select()
  .from(experiences)
  .orderBy(desc(experiences.price))
```

## INSERT Queries

### Insert single record

```typescript
const newUser = await db
  .insert(users)
  .values({
    id: generateId(),
    email: 'newuser@example.com',
    name: 'New User',
    role: 'tourist',
  })
  .returning() // Returns the inserted row

console.log(newUser[0])
```

### Insert multiple records

```typescript
await db.insert(experiences).values([
  {
    id: generateId(),
    hostId: 'host-123',
    title: 'Fishing Trip',
    // ... other fields
  },
  {
    id: generateId(),
    hostId: 'host-456',
    title: 'Island Tour',
    // ... other fields
  },
])
```

## UPDATE Queries

### Update by ID

```typescript
await db
  .update(users)
  .set({ name: 'Updated Name' })
  .where(eq(users.id, 'user-123'))
```

### Update with conditions

```typescript
// Update all fishing experiences to lower price
await db
  .update(experiences)
  .set({ price: '40.00' })
  .where(eq(experiences.category, 'fishing'))
```

## DELETE Queries

### Delete by ID

```typescript
await db
  .delete(users)
  .where(eq(users.id, 'user-123'))
```

### Delete with conditions

```typescript
// Delete all inactive experiences
await db
  .delete(experiences)
  .where(eq(experiences.status, 'inactive'))
```

## JOIN Queries

### Get experiences with host info

```typescript
const experiencesWithHosts = await db
  .select({
    experience: experiences,
    host: users,
  })
  .from(experiences)
  .leftJoin(users, eq(experiences.hostId, users.id))
```

### Custom select fields

```typescript
const simplified = await db
  .select({
    id: experiences.id,
    title: experiences.title,
    hostName: users.name,
    hostEmail: users.email,
  })
  .from(experiences)
  .leftJoin(users, eq(experiences.hostId, users.id))
```

## Aggregations

### Count

```typescript
import { count } from 'drizzle-orm'

const totalExperiences = await db
  .select({ count: count() })
  .from(experiences)

console.log(totalExperiences[0].count)
```

### Group by

```typescript
const experiencesByCategory = await db
  .select({
    category: experiences.category,
    count: count(),
  })
  .from(experiences)
  .groupBy(experiences.category)
```

## Using in Hono API Routes

### Example: Get all experiences

```typescript
app.get('/api/experiences', async (c) => {
  try {
    const allExperiences = await db.select().from(experiences)

    return c.json({
      success: true,
      data: allExperiences,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch experiences',
    }, 500)
  }
})
```

### Example: Create new experience

```typescript
app.post('/api/experiences', async (c) => {
  try {
    const body = await c.req.json()

    const [newExperience] = await db
      .insert(experiences)
      .values({
        id: generateId(),
        ...body,
      })
      .returning()

    return c.json({
      success: true,
      data: newExperience,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to create experience',
    }, 500)
  }
})
```

### Example: Get by ID

```typescript
app.get('/api/experiences/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const [experience] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, id))
      .limit(1)

    if (!experience) {
      return c.json({
        success: false,
        error: 'Experience not found',
      }, 404)
    }

    return c.json({
      success: true,
      data: experience,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch experience',
    }, 500)
  }
})
```

## Operators Reference

| Operator | Usage | SQL Equivalent |
|----------|-------|----------------|
| `eq(field, value)` | Equals | `field = value` |
| `ne(field, value)` | Not equals | `field != value` |
| `gt(field, value)` | Greater than | `field > value` |
| `gte(field, value)` | Greater or equal | `field >= value` |
| `lt(field, value)` | Less than | `field < value` |
| `lte(field, value)` | Less or equal | `field <= value` |
| `like(field, pattern)` | Pattern match | `field LIKE pattern` |
| `and(...conditions)` | All true | `condition1 AND condition2` |
| `or(...conditions)` | Any true | `condition1 OR condition2` |
| `isNull(field)` | Is null | `field IS NULL` |
| `isNotNull(field)` | Not null | `field IS NOT NULL` |

## Tips

1. **Always use try/catch** in API routes
2. **Use `.returning()`** to get inserted/updated data
3. **Import operators** from `drizzle-orm` as needed
4. **Use `generateId()`** for new record IDs
5. **Convert decimals** to numbers in UI: `Number(price)`
6. **Test queries in Drizzle Studio** before adding to code
