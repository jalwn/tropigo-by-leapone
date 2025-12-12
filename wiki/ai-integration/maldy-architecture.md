# Maldy AI Integration - Architecture & Developer Guide

Complete guide to the AI-powered trip planner implementation in TropiGo.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [How It Works](#how-it-works)
5. [Request Flow](#request-flow)
6. [Key Concepts](#key-concepts)
7. [API Reference](#api-reference)
8. [UI Integration](#ui-integration)
9. [Best Practices](#best-practices)
10. [Extending Maldy](#extending-maldy)

---

## Overview

Maldy is an AI-powered trip planner that uses Google's Gemini 2.5 Flash model to generate personalized Maldives itineraries based on:
- Budget constraints
- Travel dates
- User interests (diving, fishing, cultural, island-hopping)
- Group size
- Available experiences from the database

---

## Setup

### Prerequisites

1. **Get a Gemini API Key** (free):
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key (starts with `AIza...`)

2. **Configure Environment Variables**:
   ```bash
   # Copy example files
   cp apps/api/.env.example apps/api/.env
   cp apps/ui/.env.example apps/ui/.env
   ```

3. **Add your API key** to `apps/api/.env`:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=AIza...your_actual_key_here
   ```

4. **Verify setup**:
   ```bash
   # Start dev server
   bun run dev

   # Check API logs for "API key set: true"
   ```

**For full environment setup guide, see:** [Environment Variables Guide](../deployment/environment-variables.md)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser (UI)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /maldy Route (React + TanStack Router)             │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  useChat Hook (@ai-sdk/react)                │   │   │
│  │  │  - Manages message state                     │   │   │
│  │  │  - Handles streaming                         │   │   │
│  │  │  - Sends messages via TextStreamTransport   │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST /api/maldy/plan
                              │ (Budget, Dates, Interests, Messages)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Server (Hono + Bun)                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /api/maldy/plan Endpoint                           │   │
│  │  1. Receive user request                            │   │
│  │  2. Fetch experiences from DB                       │   │
│  │  3. Build system prompt with context                │   │
│  │  4. Call Gemini API via streamText()                │   │
│  │  5. Stream response back to UI                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ streamText() call
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Google Gemini API                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  gemini-2.5-flash Model                             │   │
│  │  - Processes system prompt + messages               │   │
│  │  - Generates itinerary                              │   │
│  │  - Streams response chunks                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Text chunks
                              ↓
                    Browser displays streaming text
```

---

## Tech Stack

### Backend (API)

| Package | Version | Purpose |
|---------|---------|---------|
| `ai` | ^5.0.110 | Vercel AI SDK - Core streaming utilities |
| `@ai-sdk/google` | Latest | Google Gemini provider for AI SDK |
| `hono` | Latest | Lightweight web framework |
| `drizzle-orm` | Latest | Database ORM for fetching experiences |

**Runtime:** Bun (fast JavaScript runtime)

### Frontend (UI)

| Package | Version | Purpose |
|---------|---------|---------|
| `@ai-sdk/react` | ^2.0.112 | React hooks for AI SDK |
| `ai` | ^5.0.110 | AI SDK core (for transports) |
| `react` | ^19.2.0 | UI framework |
| `@tanstack/react-router` | ^1.140.5 | Routing |

**Build Tool:** Vite

---

## How It Works

### 1. User Input (UI)

User fills out form with:
- Budget (USD)
- Start date
- End date
- Interests (multi-select)
- Group size

```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()

  sendMessage(
    { text: 'Plan a trip: Budget $1234...' },
    {
      body: {
        budget: Number(budget),
        startDate,
        endDate,
        interests,
        groupSize: Number(groupSize),
      },
    }
  )
}
```

### 2. Request Transport (UI → API)

`TextStreamChatTransport` sends POST request to `/api/maldy/plan`:

```json
{
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "parts": [{ "type": "text", "text": "Plan a trip..." }]
    }
  ],
  "budget": 1234,
  "startDate": "2025-12-17",
  "endDate": "2025-12-29",
  "interests": ["diving", "cultural"],
  "groupSize": 2
}
```

### 3. API Processing

```typescript
// 1. Extract data from request
const { messages, budget, startDate, endDate, interests, groupSize } = body

// 2. Fetch available experiences from database
const allExperiences = await db.select().from(experiences)

// 3. Build context-aware system prompt
const systemPrompt = `You are Maldy, an AI trip planner...
Budget: $${budget}
Dates: ${startDate} to ${endDate}
Available Experiences:
${allExperiences.map(exp => `- ${exp.title}...`).join('\n')}
...`

// 4. Stream AI response
const result = streamText({
  model: google('gemini-2.5-flash'),
  system: systemPrompt,
  messages: convertToModelMessages(messages),
})

// 5. Return streaming response
return result.toTextStreamResponse()
```

### 4. Streaming Response (API → UI)

- API streams text chunks as Gemini generates them
- UI receives chunks in real-time via `useChat` hook
- UI displays chunks immediately (word-by-word streaming effect)

```tsx
{messages.map((message) => (
  <div>
    <strong>{message.role === 'user' ? 'You' : 'Maldy'}:</strong>
    <div>
      {message.parts.map((part, i) =>
        part.type === 'text' ? <span key={i}>{part.text}</span> : null
      )}
    </div>
  </div>
))}

{status === 'streaming' && <em>Maldy is thinking...</em>}
```

---

## Request Flow

### Detailed Step-by-Step

```
1. User clicks "Plan My Trip 🏝️"
   ↓
2. UI validates inputs (budget, dates, interests)
   ↓
3. sendMessage() called with text + custom body
   ↓
4. TextStreamChatTransport sends HTTP POST
   ↓
5. API endpoint /api/maldy/plan receives request
   ↓
6. Drizzle ORM queries database for experiences
   ↓
7. System prompt built with user requirements + experiences
   ↓
8. streamText() calls Gemini API with prompt
   ↓
9. Gemini starts generating response
   ↓
10. First text chunk received from Gemini
    ↓
11. Chunk streamed to UI via Response stream
    ↓
12. useChat hook updates messages state
    ↓
13. UI re-renders with new text
    ↓
14. Steps 10-13 repeat until generation complete
    ↓
15. Stream closes, status = 'ready'
    ↓
16. Final itinerary displayed in UI
```

---

## Key Concepts

### 1. Streaming vs Non-Streaming

**Non-Streaming (Traditional):**
```typescript
const response = await generateText({ model, prompt })
// Wait 30 seconds...
return response.text // All at once
```

**Streaming (Our Approach):**
```typescript
const result = streamText({ model, prompt })
return result.toTextStreamResponse()
// Chunks appear immediately as generated
```

**Benefits:**
- ✅ Better UX (immediate feedback)
- ✅ Perceived performance improvement
- ✅ Works for long responses
- ✅ User can read while AI generates

---

### 2. AI SDK Architecture

The Vercel AI SDK has 3 layers:

#### **Layer 1: Core (`ai` package)**
- `streamText()` - Generate streaming text
- `generateText()` - Generate text (non-streaming)
- Model-agnostic abstractions

#### **Layer 2: Providers (`@ai-sdk/*` packages)**
- `@ai-sdk/google` - Google Gemini
- `@ai-sdk/openai` - OpenAI GPT
- `@ai-sdk/anthropic` - Claude
- Each implements core interfaces

#### **Layer 3: UI (`@ai-sdk/react` package)**
- `useChat()` - Chat interface hook
- `useCompletion()` - Completion hook
- React-specific helpers

---

### 3. Transport Types

| Transport | Content-Type | Use Case |
|-----------|--------------|----------|
| `TextStreamChatTransport` | `text/plain` | Simple text streaming (our choice) |
| `DefaultChatTransport` | `text/event-stream` | SSE with tool calls, metadata |
| `DataStreamChatTransport` | `text/event-stream` | Legacy AI SDK v4 format |

**We use `TextStreamChatTransport` because:**
- ✅ Works reliably with Hono + Bun
- ✅ Simple, predictable
- ✅ Sufficient for our use case (no tools/function calling)

---

### 4. System Prompts vs Messages

**System Prompt:**
```typescript
system: "You are Maldy, an AI trip planner..."
```
- Sets AI's role/behavior
- Provides context (budget, dates, experiences)
- Not visible in conversation history

**Messages:**
```typescript
messages: [
  { role: 'user', content: 'Plan a trip...' },
  { role: 'assistant', content: 'Here is your itinerary...' },
]
```
- Conversation history
- User requests + AI responses
- Visible in UI

---

## API Reference

### Endpoint: `POST /api/maldy/plan`

**Request Body:**
```typescript
{
  messages: UIMessage[]        // Chat history
  budget: number              // USD amount
  startDate: string           // ISO date (YYYY-MM-DD)
  endDate: string             // ISO date (YYYY-MM-DD)
  interests: string[]         // ['diving', 'cultural', ...]
  groupSize: number           // Number of travelers
}
```

**Response:**
- **Content-Type:** `text/plain; charset=utf-8`
- **Format:** Streaming text chunks
- **Headers:**
  - `Cache-Control: no-cache`
  - `Connection: keep-alive`

**Example Response Stream:**
```
🏝️ Your Maldives Adventure
Day 1: Arrival
- Morning: ...
[chunks continue streaming...]
```

---

### streamText Configuration

```typescript
const result = streamText({
  // Model selection
  model: google('gemini-2.5-flash'),

  // System instructions (context)
  system: string,

  // Conversation history
  messages: Array<{ role: 'user' | 'assistant', content: string }>,

  // Optional: Error handler
  onError: (error) => console.error(error),

  // Optional: Temperature (creativity)
  // temperature: 0.7,

  // Optional: Max tokens
  // maxTokens: 1000,
})
```

**Response Methods:**
- `result.toTextStreamResponse()` - Plain text stream (we use this)
- `result.toUIMessageStreamResponse()` - SSE with metadata
- `result.textStream` - Raw ReadableStream

---

## UI Integration

### useChat Hook

```typescript
const { messages, status, error, sendMessage } = useChat({
  transport: new TextStreamChatTransport({
    api: `${API_URL}/api/maldy/plan`,
  }),
})
```

**Returned Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `messages` | `UIMessage[]` | All messages in conversation |
| `status` | `'ready' \| 'submitted' \| 'streaming' \| 'error'` | Current state |
| `error` | `Error \| undefined` | Error object if failed |
| `sendMessage` | `(msg, opts) => void` | Send new message |

**Status States:**
- `ready` - Idle, waiting for user input
- `submitted` - Request sent, waiting for response
- `streaming` - Receiving chunks from API
- `error` - Request failed

---

### Sending Messages with Custom Data

```typescript
sendMessage(
  { text: 'User message text' },  // Message content
  {
    body: {                        // Custom data sent to API
      budget: 1234,
      startDate: '2025-12-17',
      // ... other fields
    },
  }
)
```

**Important:** Custom body fields are available in API via `req.json()`.

---

### Message Rendering

```tsx
{messages.map((message) => (
  <div key={message.id}>
    <strong>{message.role === 'user' ? 'You' : 'Maldy'}:</strong>
    {message.parts.map((part, index) =>
      part.type === 'text' ? <span key={index}>{part.text}</span> : null
    )}
  </div>
))}
```

**UIMessage Structure:**
```typescript
{
  id: string
  role: 'user' | 'assistant'
  parts: Array<{
    type: 'text' | 'image' | 'tool-call' | ...
    text?: string
    // ... other fields based on type
  }>
}
```

---

## Best Practices

### 1. Prompt Engineering

**✅ Good Prompt:**
```typescript
const systemPrompt = `You are Maldy, an AI trip planner for the Maldives.

User Requirements:
- Budget: $${budget}
- Dates: ${startDate} to ${endDate}
- Interests: ${interests.join(', ')}
- Group size: ${groupSize}

Available Experiences:
${allExperiences.map(exp =>
  `- ${exp.title} ($${exp.price}) - ${exp.description}`
).join('\n')}

Create a day-by-day itinerary that:
1. Fits within the budget
2. Matches user interests
3. Uses specific experiences from the list above
4. Provides cost estimates

Format: Clear, structured with emojis.`
```

**❌ Bad Prompt:**
```typescript
const systemPrompt = 'Plan a trip to Maldives'
// Too vague, no context, poor results
```

**Tips:**
- Be specific about requirements
- Provide all relevant context
- Specify output format
- Include examples if needed
- Test with edge cases (low budget, short trip)

---

### 2. Error Handling

```typescript
try {
  const result = streamText({ ... })
  return result.toTextStreamResponse()
} catch (error) {
  console.error('Maldy error:', error)

  // Return user-friendly error
  return c.json({
    error: 'Failed to generate plan',
    details: error instanceof Error ? error.message : String(error)
  }, 500)
}
```

**Also handle in UI:**
```tsx
{error && (
  <div style={{ color: 'red' }}>
    Error: {error.message}
  </div>
)}
```

---

### 3. Rate Limiting

Consider implementing rate limiting for API calls:

```typescript
// Example with Hono middleware
import { rateLimiter } from 'hono-rate-limiter'

app.use('/api/maldy/*', rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // 5 requests per minute
  message: 'Too many requests, please try again later'
}))
```

---

### 4. Caching

For similar requests, consider caching:

```typescript
// Simple in-memory cache
const cache = new Map<string, string>()

const cacheKey = JSON.stringify({ budget, startDate, endDate, interests })

if (cache.has(cacheKey)) {
  return c.text(cache.get(cacheKey)!)
}

// ... generate response ...
cache.set(cacheKey, fullResponse)
```

**Warning:** Cached responses won't stream. Consider trade-offs.

---

### 5. Validation

Always validate user input:

```typescript
// API-side validation
if (!budget || budget <= 0) {
  return c.json({ error: 'Invalid budget' }, 400)
}

if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
  return c.json({ error: 'Invalid dates' }, 400)
}

if (!interests || interests.length === 0) {
  return c.json({ error: 'Select at least one interest' }, 400)
}
```

---

## Extending Maldy

### Adding New Features

#### 1. **Multi-turn Conversations**

Enable follow-up questions:

```typescript
// Already supported via messages array!
// User can ask: "Make it cheaper" or "Add more diving"
// AI has full context from previous messages
```

#### 2. **Tool/Function Calling**

Let AI query database or APIs:

```typescript
const result = streamText({
  model: google('gemini-2.5-flash'),
  system: systemPrompt,
  messages: convertToModelMessages(messages),
  tools: {
    searchExperiences: {
      description: 'Search for experiences by category',
      parameters: z.object({
        category: z.string(),
        maxPrice: z.number(),
      }),
      execute: async ({ category, maxPrice }) => {
        return await db.select()
          .from(experiences)
          .where(
            and(
              eq(experiences.category, category),
              lte(experiences.price, maxPrice)
            )
          )
      },
    },
  },
})

// Must use DefaultChatTransport for tool calling!
```

**Reference:** [AI SDK Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)

---

#### 3. **Image Generation**

Add images to itineraries:

```typescript
import { google } from '@ai-sdk/google'

const imageResult = await google('imagen-4.0-generate-001').generate({
  prompt: 'Maldives beach at sunset',
})

// Include image URL in itinerary
```

---

#### 4. **Structured Output**

Get JSON instead of text:

```typescript
import { generateObject } from 'ai'

const result = await generateObject({
  model: google('gemini-2.5-flash'),
  schema: z.object({
    itinerary: z.array(z.object({
      day: z.number(),
      activities: z.array(z.string()),
      cost: z.number(),
    })),
    totalCost: z.number(),
  }),
  prompt: systemPrompt,
})

// result.object.itinerary is typed!
```

**Note:** `generateObject` doesn't stream. Consider UX trade-offs.

---

#### 5. **Different Models**

Compare models for your use case:

| Model | Speed | Cost | Quality | Use Case |
|-------|-------|------|---------|----------|
| `gemini-2.5-flash` | ⚡ Fast | 💰 Cheap | ⭐⭐⭐ Good | Production (current) |
| `gemini-2.5-pro` | 🐢 Slow | 💰💰💰 Expensive | ⭐⭐⭐⭐⭐ Excellent | Complex planning |
| `gemini-2.0-flash` | ⚡⚡ Very Fast | 💰 Cheap | ⭐⭐ OK | Simple queries |

**Switching models:**
```typescript
model: google('gemini-2.5-pro') // Just change the name!
```

---

### Monitoring & Analytics

Track AI usage:

```typescript
maldy.post('/plan', async (c) => {
  const startTime = Date.now()

  try {
    const result = streamText({ ... })

    // Log request
    console.log('Maldy request:', {
      budget,
      interests,
      timestamp: new Date().toISOString(),
    })

    return result.toTextStreamResponse()
  } finally {
    const duration = Date.now() - startTime
    console.log(`Request completed in ${duration}ms`)
  }
})
```

**Future:** Integrate with analytics (PostHog, Mixpanel, etc.)

---

## References & Resources

### Official Documentation

- **AI SDK Documentation:** https://ai-sdk.dev/
  - [Core API Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core)
  - [React Hooks](https://ai-sdk.dev/docs/reference/ai-sdk-ui)
  - [streamText Guide](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text)

- **Google Gemini:**
  - [Model List](https://ai.google.dev/gemini-api/docs/models)
  - [API Documentation](https://ai.google.dev/gemini-api/docs)
  - [Pricing](https://ai.google.dev/pricing)

- **Hono Framework:**
  - [Documentation](https://hono.dev/)
  - [Streaming Guide](https://hono.dev/docs/guides/streaming)

### Example Projects

- [AI SDK Examples](https://github.com/vercel/ai/tree/main/examples)
- [Next.js Chatbot](https://github.com/vercel/ai-chatbot)
- [AI SDK Playground](https://sdk.vercel.ai/)

### Learning Resources

- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [LLM University](https://llmuniversity.com/)
- [Google AI Studio](https://makersuite.google.com/) - Test prompts

---

## Troubleshooting

See [Maldy Troubleshooting Guide](./maldy-troubleshooting.md) for:
- Common errors and solutions
- Debugging checklist
- What we tried and why it failed
- Quick fixes

---

## Contributing

When modifying Maldy:

1. **Test streaming behavior** - Ensure word-by-word streaming works
2. **Validate inputs** - Check budget, dates, interests
3. **Handle errors gracefully** - Show user-friendly messages
4. **Log important events** - Help with debugging
5. **Update documentation** - Keep this guide current
6. **Consider costs** - Gemini API calls cost money

**Questions?** Check the [AI SDK Discord](https://discord.gg/vercel) or [GitHub Discussions](https://github.com/vercel/ai/discussions).
