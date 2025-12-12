# Maldy AI Integration - Troubleshooting Guide

## The Issue We Encountered

### Problem
When implementing the Maldy AI trip planner with streaming responses, we encountered the error:

```
ERR_INCOMPLETE_CHUNKED_ENCODING 200 (OK)
```

The server would start streaming but the connection would end before the stream completed, causing the UI to fail.

---

## Root Cause Analysis

### 1. **Model Name Issues**
**Error:** `models/gemini-1.5-flash is not found for API version v1beta`

**Cause:** Gemini 1.5 models were retired on September 24, 2025.

**Solution:** Migrate to Gemini 2.x models:
- ❌ `gemini-1.5-flash` (retired)
- ❌ `gemini-1.5-pro` (retired)
- ✅ `gemini-2.5-flash` (recommended)
- ✅ `gemini-2.0-flash` (alternative)

**Reference:** [Gemini Models | Google AI](https://ai.google.dev/gemini-api/docs/models)

---

### 2. **Streaming Format Mismatch**
**Error:** `ERR_INCOMPLETE_CHUNKED_ENCODING`

**Cause:** The API and UI were using incompatible streaming protocols.

#### The Problem Chain:

```
API: result.toUIMessageStreamResponse()  (SSE format with structured events)
  ↓
Hono: Doesn't properly handle the Response object
  ↓
UI: DefaultChatTransport (expects SSE format)
  ↓
Result: Stream starts but doesn't complete properly
```

**Why it failed:**
1. `toUIMessageStreamResponse()` returns a Response with SSE (Server-Sent Events) format
2. Hono + Bun don't properly pipe this Response through without buffering/breaking
3. The stream ends prematurely, causing incomplete chunked encoding error

---

### 3. **Server Timeout**
**Error:** `[Bun.serve]: request timed out after 10 seconds`

**Cause:** Default Bun server timeout is 10 seconds, but AI responses can take longer.

**Solution:** Set `idleTimeout` in server config:

```typescript
export default {
  port: 8060,
  fetch: app.fetch,
  idleTimeout: 120, // 2 minutes for AI streaming
}
```

---

## The Solution

### What Works: Plain Text Streaming

**API Side** (`apps/api/src/routes/maldy.ts`):
```typescript
const result = streamText({
  model: google('gemini-2.5-flash'),
  system: systemPrompt,
  messages: convertToModelMessages(messages),
})

// ✅ Return plain text stream
return result.toTextStreamResponse()
```

**UI Side** (`apps/ui/src/routes/maldy/index.tsx`):
```typescript
const { messages, status, sendMessage } = useChat({
  transport: new TextStreamChatTransport({
    api: `${API_URL}/api/maldy/plan`,
  }),
})
```

**Why this works:**
- `toTextStreamResponse()` returns a standard Response with `text/plain` stream
- Works reliably with Hono + Bun
- `TextStreamChatTransport` on UI side matches the format
- Simple, predictable streaming behavior

---

## What We Tried (And Why They Failed)

### ❌ Attempt 1: UI Message Stream
```typescript
return result.toUIMessageStreamResponse()
```
**Failed:** Hono doesn't properly handle the SSE Response format, causing incomplete chunked encoding.

---

### ❌ Attempt 2: Manual Response with toDataStream()
```typescript
return new Response(result.toDataStream(), { ... })
```
**Failed:** `toDataStream()` doesn't exist on `StreamTextResult` type.

---

### ❌ Attempt 3: Manual Response with fullStream
```typescript
return new Response(result.fullStream, { ... })
```
**Failed:** `fullStream` contains structured event objects, not bytes. Bun's `write()` expects strings or buffers, got:
```
TypeError: write() expects a string, ArrayBufferView, or ArrayBuffer
```

---

### ❌ Attempt 4: Manual Response with textStream
```typescript
return new Response(result.textStream, {
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
  },
})
```
**Failed:** Response was buffered - entire text appeared at once instead of streaming word-by-word.

---

### ❌ Attempt 5: Hono's stream() helper
```typescript
return c.stream(async (stream) => {
  for await (const chunk of result.textStream) {
    await stream.write(chunk)
  }
})
```
**Failed:** `c.stream()` doesn't exist on Hono's Context type.

---

### ✅ Final Solution: Built-in Text Stream Response
```typescript
return result.toTextStreamResponse()
```
**Success:** Uses AI SDK's built-in method that creates a proper streaming Response object.

**Key insight:** The AI SDK's built-in methods handle all the edge cases. Don't try to manually create streaming responses unless absolutely necessary.

---

## Lessons Learned

### 1. Match Streaming Protocols
Ensure API response format matches UI transport:
- `toTextStreamResponse()` → `TextStreamChatTransport`
- `toUIMessageStreamResponse()` → `DefaultChatTransport` (doesn't work with Hono)
- `toDataStreamResponse()` → `DataStreamChatTransport` (old AI SDK v4)

### 2. Use Built-in Methods
The AI SDK provides response methods for a reason:
- ✅ `result.toTextStreamResponse()` - Simple, reliable
- ✅ `result.toUIMessageStreamResponse()` - Feature-rich (but has issues with Hono)
- ❌ Manual Response creation - Avoid unless necessary

### 3. Framework Compatibility Matters
- Next.js: All streaming methods work
- Hono + Bun: `toTextStreamResponse()` works best
- Express: Similar to Hono

### 4. Set Proper Timeouts
AI responses can take 30+ seconds for complex requests. Always configure:
```typescript
idleTimeout: 120 // seconds
```

---

## Debugging Checklist

When streaming doesn't work:

- [ ] Check model name is valid (Gemini 2.x, not 1.5)
- [ ] Verify API key is set: `console.log('API key:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY)`
- [ ] Confirm streaming format matches between API and UI
- [ ] Check server timeout is sufficient (`idleTimeout`)
- [ ] Look for errors in both API logs and browser console
- [ ] Test with simple prompt first before complex system prompts
- [ ] Verify CORS headers if API and UI on different ports

---

## Quick Reference

### Working Configuration

**API** (`apps/api/src/routes/maldy.ts`):
```typescript
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { google } from '@ai-sdk/google'

const result = streamText({
  model: google('gemini-2.5-flash'),
  system: systemPrompt,
  messages: convertToModelMessages(messages as UIMessage[]),
})

return result.toTextStreamResponse()
```

**UI** (`apps/ui/src/routes/maldy/index.tsx`):
```typescript
import { useChat, type UIMessage } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'

const { messages, status, sendMessage } = useChat({
  transport: new TextStreamChatTransport({
    api: `${API_URL}/api/maldy/plan`,
  }),
})
```

**Server Config** (`apps/api/src/index.ts`):
```typescript
export default {
  port: 8060,
  fetch: app.fetch,
  idleTimeout: 120,
}
```

---

## Further Reading

- [AI SDK Core: streamText](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text)
- [AI SDK UI: Stream Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)
- [Google Generative AI Provider](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)
- [Gemini Models Documentation](https://ai.google.dev/gemini-api/docs/models)
- [Hono Documentation](https://hono.dev/)
