# TanStack Query (React Query) Guide

Complete guide to data fetching, caching, and state management with TanStack Query.

## What is TanStack Query?

**TanStack Query manages server state (API data) automatically.**

Instead of manually handling loading/error states, caching, and refetching, TanStack Query does it for you.

## Our Setup

**Location:** `apps/ui/src/main.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // Data fresh for 1 minute
      gcTime: 5 * 60 * 1000,       // Keep unused data for 5 minutes
      retry: 1,                     // Retry failed requests once
      refetchOnWindowFocus: false,  // Don't refetch on window focus
    },
  },
})
```

**Integrated with Router:**
- QueryClient passed to router context
- Enables prefetching in route loaders

## Basic Usage

### Fetching Data

**API Function** (`apps/ui/src/api/experiences.ts`):
```typescript
export const experiencesQueryOptions = {
  queryKey: ['experiences'],
  queryFn: fetchExperiences,
}
```

**In Component:**
```typescript
import { useQuery } from '@tanstack/react-query'
import { experiencesQueryOptions } from '../api/experiences'

function MyComponent() {
  const { data, isLoading, error } = useQuery(experiencesQueryOptions)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data?.data?.map(...)}</div>
}
```

## Two Patterns: Prefetch vs Normal

### Pattern 1: WITH Prefetch (Recommended for main pages)

**Route with loader:**
```typescript
// apps/ui/src/routes/experiences/index.tsx
export const Route = createFileRoute('/experiences/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(experiencesQueryOptions),
  component: ExperiencesPage,
})

function ExperiencesPage() {
  const { data } = useQuery(experiencesQueryOptions)
  // Data already loaded - no loading state needed!
  return <div>{data?.data?.map(...)}</div>
}
```

**What happens:**
1. User clicks "/experiences"
2. Loader prefetches data
3. Route renders when data ready
4. Component shows data instantly

**Pros:**
- No loading spinner
- Instant page load
- Better UX

### Pattern 2: WITHOUT Prefetch (Normal useQuery)

**Route without loader:**
```typescript
// apps/ui/src/routes/experiences/new.tsx
export const Route = createFileRoute('/experiences/new')({
  component: NewExperiencePage,
})

function NewExperiencePage() {
  const { data, isLoading, error } = useQuery(experiencesQueryOptions)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data?.data?.map(...)}</div>
}
```

**What happens:**
1. User clicks "/experiences/new"
2. Route renders immediately
3. Component mounts
4. useQuery starts fetching
5. Shows loading spinner
6. Data appears

**Pros:**
- Simpler code
- Good for less important pages

## Caching

### How Caching Works

TanStack Query automatically caches data:

```typescript
queryKey: ['experiences']  // Cache identifier
```

**First request:**
```
Component A → useQuery(['experiences']) → Fetches from API → Caches result
```

**Subsequent requests:**
```
Component B → useQuery(['experiences']) → Returns from cache (instant!)
```

### Cache Configuration

**In QueryClient:**
```typescript
{
  staleTime: 60 * 1000,      // Data fresh for 1 minute
  gcTime: 5 * 60 * 1000,     // Keep in memory for 5 minutes after unused
}
```

**What these mean:**

| Option | What It Does | Example |
|--------|--------------|---------|
| `staleTime` | How long data stays fresh | `60 * 1000` = 1 minute |
| `gcTime` | How long to keep unused data | `5 * 60 * 1000` = 5 minutes |

**Timeline:**
```
Fetch → Fresh (0-1min) → Stale (1-5min) → Garbage Collected (>5min)
          ↓                  ↓                    ↓
      Served instantly   Served + refetch    Fetch again
```

### Cache Keys

**Simple key:**
```typescript
queryKey: ['experiences']
```

**Key with parameters:**
```typescript
queryKey: ['experience', experienceId]
queryKey: ['experiences', { category: 'fishing', island: 'Male' }]
```

**Why this matters:**
- Different keys = different cache entries
- Same key = shared cache across components

## Invalidating Cache

### When to Invalidate

Invalidate cache when data changes on the server:
- After creating new item
- After updating item
- After deleting item

### How to Invalidate

**Using invalidateQueries:**
```typescript
import { useQueryClient } from '@tanstack/react-query'

function MyComponent() {
  const queryClient = useQueryClient()

  const handleCreate = async () => {
    // Create new experience
    await createExperience(...)

    // Invalidate cache - triggers refetch
    queryClient.invalidateQueries({ queryKey: ['experiences'] })
  }
}
```

**What happens:**
1. Data changes on server
2. Invalidate queries
3. TanStack Query refetches automatically
4. UI updates with new data

### Invalidate Examples

**Invalidate all experiences:**
```typescript
queryClient.invalidateQueries({ queryKey: ['experiences'] })
```

**Invalidate specific experience:**
```typescript
queryClient.invalidateQueries({ queryKey: ['experience', experienceId] })
```

**Invalidate multiple:**
```typescript
await queryClient.invalidateQueries({ queryKey: ['experiences'] })
await queryClient.invalidateQueries({ queryKey: ['users'] })
```

## Mutations (Creating/Updating Data)

### Using useMutation

**For creating/updating/deleting data:**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function CreateExperienceForm() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (newExperience) => {
      return fetch('http://localhost:8060/api/experiences', {
        method: 'POST',
        body: JSON.stringify(newExperience),
      })
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['experiences'] })
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutation.mutate({ title: '...', ... })
    }}>
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
      {mutation.isSuccess && <div>Created!</div>}
    </form>
  )
}
```

### Mutation States

```typescript
mutation.isPending    // Request in progress
mutation.isError      // Request failed
mutation.isSuccess    // Request succeeded
mutation.error        // Error object
mutation.data         // Response data
```

### Optimistic Updates

**Update UI before server responds:**

```typescript
const mutation = useMutation({
  mutationFn: updateExperience,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['experiences'] })

    // Snapshot current data
    const previousData = queryClient.getQueryData(['experiences'])

    // Optimistically update UI
    queryClient.setQueryData(['experiences'], (old) => {
      return old?.data?.map(exp =>
        exp.id === newData.id ? newData : exp
      )
    })

    // Return snapshot for rollback
    return { previousData }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['experiences'], context.previousData)
  },
  onSettled: () => {
    // Refetch to sync
    queryClient.invalidateQueries({ queryKey: ['experiences'] })
  },
})
```

## Refetching Data

### Manual Refetch

**Refetch in component:**
```typescript
const { data, refetch } = useQuery(experiencesQueryOptions)

<button onClick={() => refetch()}>
  Refresh
</button>
```

**Refetch using QueryClient:**
```typescript
const queryClient = useQueryClient()

queryClient.refetchQueries({ queryKey: ['experiences'] })
```

### Automatic Refetch

**TanStack Query refetches automatically:**
- When data becomes stale (after `staleTime`)
- When window regains focus (if enabled)
- On network reconnection
- At intervals (if configured)

**Configure refetch behavior:**
```typescript
useQuery({
  ...experiencesQueryOptions,
  refetchInterval: 5000,           // Refetch every 5 seconds
  refetchOnWindowFocus: true,      // Refetch when window focused
  refetchOnReconnect: true,        // Refetch when network reconnects
})
```

## Real-World Example: Full CRUD

```typescript
// Create experience
const createMutation = useMutation({
  mutationFn: (newExp) => fetch('/api/experiences', {
    method: 'POST',
    body: JSON.stringify(newExp),
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['experiences'] })
  },
})

// Update experience
const updateMutation = useMutation({
  mutationFn: ({ id, data }) => fetch(`/api/experiences/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['experiences'] })
    queryClient.invalidateQueries({ queryKey: ['experience', id] })
  },
})

// Delete experience
const deleteMutation = useMutation({
  mutationFn: (id) => fetch(`/api/experiences/${id}`, {
    method: 'DELETE',
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['experiences'] })
  },
})

// Usage
createMutation.mutate(newExperience)
updateMutation.mutate({ id: '123', data: updatedExp })
deleteMutation.mutate('123')
```

## DevTools

**React Query DevTools are enabled in development:**
- View all queries and their states
- See cached data
- Manually trigger refetch
- Debug cache issues

**Access:**
- Look for floating icon in bottom-right
- Click to open DevTools panel

## Common Patterns

### Loading Multiple Queries

```typescript
const experiencesQuery = useQuery(experiencesQueryOptions)
const usersQuery = useQuery(usersQueryOptions)

if (experiencesQuery.isLoading || usersQuery.isLoading) {
  return <div>Loading...</div>
}
```

### Dependent Queries

```typescript
const { data: experience } = useQuery({
  queryKey: ['experience', id],
  queryFn: () => fetchExperience(id),
})

const { data: host } = useQuery({
  queryKey: ['user', experience?.hostId],
  queryFn: () => fetchUser(experience.hostId),
  enabled: !!experience?.hostId,  // Only run when we have hostId
})
```

### Pagination

```typescript
const [page, setPage] = useState(1)

const { data } = useQuery({
  queryKey: ['experiences', page],
  queryFn: () => fetchExperiences(page),
  keepPreviousData: true,  // Keep old data while fetching new page
})
```

## Best Practices

1. **Use query options objects** - Reusable and type-safe
   ```typescript
   export const experiencesQueryOptions = {
     queryKey: ['experiences'],
     queryFn: fetchExperiences,
   }
   ```

2. **Invalidate after mutations** - Keep data fresh
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['experiences'] })
   }
   ```

3. **Use prefetch for main pages** - Better UX
   ```typescript
   loader: ({ context: { queryClient } }) =>
     queryClient.ensureQueryData(experiencesQueryOptions)
   ```

4. **Structure query keys consistently**
   ```typescript
   ['experiences']              // All experiences
   ['experience', id]          // Single experience
   ['experiences', { filters }] // Filtered experiences
   ```

5. **Handle loading and error states**
   ```typescript
   if (isLoading) return <Spinner />
   if (error) return <Error error={error} />
   ```

## Summary

| Feature | How | Why |
|---------|-----|-----|
| **Caching** | Automatic with `queryKey` | Reduce API calls, instant data |
| **Prefetch** | Use `loader` in routes | No loading spinners |
| **Invalidate** | `invalidateQueries()` | Refetch after changes |
| **Mutations** | `useMutation` hook | Create/update/delete data |
| **Refetch** | `refetch()` or automatic | Keep data up-to-date |
| **Optimistic Updates** | Update UI before server | Instant feedback |

## Next Steps

- Read [TanStack Query Docs](https://tanstack.com/query/latest)
- Check `apps/ui/src/routes/experiences/` for examples
- Experiment with DevTools
- Try optimistic updates for better UX
