// Maldy AI Trip Planner API Routes
import { Hono } from 'hono'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { google } from '@ai-sdk/google'
import { db, experiences } from '../db'

const maldy = new Hono()

// POST /api/maldy/plan - Generate trip plan
maldy.post('/plan', async (c) => {
  console.log('🎯 Maldy /plan endpoint hit!')

  const body = await c.req.json()
  console.log('📦 Request body:', JSON.stringify(body, null, 2))

  const { messages, budget, startDate, endDate, interests, groupSize } = body

  // Fetch experiences from database to include in prompt
  const allExperiences = await db.select().from(experiences)
  console.log(`📊 Found ${allExperiences.length} experiences`)

  // Build system prompt with context
  const systemPrompt = `You are Maldy, an AI trip planner for the Maldives.

User Requirements:
- Budget: $${budget}
- Dates: ${startDate} to ${endDate}
- Interests: ${interests?.join(', ')}
- Group size: ${groupSize} people

Available Experiences:
${allExperiences.map(exp =>
  `- ${exp.title} ($${exp.price}) on ${exp.island} - ${exp.description}`
).join('\n')}

Create a day-by-day itinerary that:
1. Fits within the budget
2. Matches the user's interests
3. Includes specific experiences from the list above
4. Provides estimated costs per day
5. Suggests islands to visit

Format the output as a clear, structured itinerary with emojis.`

  try {
    console.log('🤖 Calling Gemini API...')
    console.log('Using model: gemini-2.5-flash')
    console.log('API key set:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY)

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: convertToModelMessages(messages as UIMessage[]),
      onError: (error) => {
        console.error('❌ Stream error:', error)
      },
    })

    console.log('✅ Streaming response...')

    // Return the AI SDK's built-in streaming response
    return result.toTextStreamResponse()
  } catch (error) {
    console.error('❌ Maldy error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return c.json({ error: 'Failed to generate plan', details: String(error) }, 500)
  }
})

export default maldy
