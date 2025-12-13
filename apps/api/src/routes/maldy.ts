// Maldy AI Trip Planner API Routes
import { Hono } from 'hono'
import { streamText, convertToModelMessages, type UIMessage, tool } from 'ai'
import { google } from '@ai-sdk/google'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { db, experiences, conversations } from '../db'
import { eq, and, or, gte, lte, like, sql } from 'drizzle-orm'

const maldy = new Hono()

// GET /api/maldy/conversation - Get or create active conversation for user
maldy.get('/conversation', async (c) => {
  try {
    const userId = c.req.query('userId')

    if (!userId) {
      return c.json({
        success: false,
        error: 'userId is required',
      }, 400)
    }

    // Try to get active conversation
    let conversation = await db.select()
      .from(conversations)
      .where(and(
        eq(conversations.userId, userId),
        eq(conversations.status, 'active')
      ))
      .limit(1)

    // If no active conversation, create one
    if (conversation.length === 0) {
      const newConversation = await db.insert(conversations).values({
        id: `conv_${nanoid()}`,
        userId,
        messages: '[]',
        status: 'active',
      }).returning()

      conversation = newConversation
    }

    return c.json({
      success: true,
      data: conversation[0],
    })
  } catch (error) {
    console.error('Error getting conversation:', error)
    return c.json({
      success: false,
      error: 'Failed to get conversation',
    }, 500)
  }
})

// POST /api/maldy/conversation/new - Start new conversation (archive current)
maldy.post('/conversation/new', async (c) => {
  try {
    const body = await c.req.json()
    const { userId } = body

    if (!userId) {
      return c.json({
        success: false,
        error: 'userId is required',
      }, 400)
    }

    // Archive any active conversations
    await db.update(conversations)
      .set({ status: 'archived' })
      .where(and(
        eq(conversations.userId, userId),
        eq(conversations.status, 'active')
      ))

    // Create new active conversation
    const newConversation = await db.insert(conversations).values({
      id: `conv_${nanoid()}`,
      userId,
      messages: '[]',
      status: 'active',
    }).returning()

    return c.json({
      success: true,
      data: newConversation[0],
    })
  } catch (error) {
    console.error('Error creating new conversation:', error)
    return c.json({
      success: false,
      error: 'Failed to create new conversation',
    }, 500)
  }
})

// POST /api/maldy/chat - Chat with Maldy AI using tool calling
maldy.post('/chat', async (c) => {
  console.log('💬 Maldy /chat endpoint hit!')

  const body = await c.req.json()
  const { messages, conversationId, userId } = body

  if (!messages || !userId) {
    return c.json({ error: 'Missing required fields: messages, userId' }, 400)
  }

  try {
    // Track found activities to inject into response
    let foundActivities: any[] = []

    // Define AI tools for searching activities
    const tools = {
      searchActivities: tool({
        description: 'Search for Maldives activities and experiences based on user preferences. Returns a list of matching activities with details.',
        parameters: z.object({
          category: z.enum(['island', 'diving', 'boat-trip', 'culture', 'water-sport', 'all']).optional().describe('Activity category'),
          maxPrice: z.number().optional().describe('Maximum price per person in USD'),
          minPrice: z.number().optional().describe('Minimum price per person in USD'),
          island: z.string().optional().describe('Specific island or atoll'),
          interests: z.array(z.string()).optional().describe('Keywords to match in title or description (e.g., romantic, adventure, snorkeling)'),
          limit: z.number().default(5).describe('Maximum number of results to return (default 5)'),
        }),
        execute: async ({ category, maxPrice, minPrice, island, interests, limit = 5 }) => {
          console.log('🔍 Searching activities:', { category, maxPrice, minPrice, island, interests, limit })

          let query = db.select().from(experiences)
          const conditions = []

          // Filter by category
          if (category && category !== 'all') {
            conditions.push(eq(experiences.category, category))
          }

          // Filter by price range
          if (maxPrice) {
            conditions.push(sql`CAST(${experiences.price} AS DECIMAL) <= ${maxPrice}`)
          }
          if (minPrice) {
            conditions.push(sql`CAST(${experiences.price} AS DECIMAL) >= ${minPrice}`)
          }

          // Filter by island
          if (island) {
            conditions.push(like(experiences.island, `%${island}%`))
          }

          // Filter by interests (search in title and description)
          if (interests && interests.length > 0) {
            const interestConditions = interests.flatMap(interest => [
              like(experiences.title, `%${interest}%`),
              like(experiences.description, `%${interest}%`),
            ])
            conditions.push(or(...interestConditions))
          }

          // Apply all conditions
          if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any
          }

          const results = await query.limit(limit)

          console.log(`✅ Found ${results.length} activities`)

          const activities = results.map(exp => ({
            id: exp.id,
            title: exp.title,
            description: exp.description,
            category: exp.category,
            price: parseFloat(exp.price),
            island: exp.island,
            duration: exp.duration,
            rating: exp.rating ? parseFloat(exp.rating) : null,
            reviewCount: exp.reviewCount,
            images: exp.images,
          }))

          // Store activities to inject into final response
          foundActivities.push(...activities)

          // Return structured result for the AI
          return {
            count: results.length,
            summary: `Found ${results.length} great activities for you!`,
            activities: activities.map(a => `${a.title} ($${a.price}) - ${a.island}`),
          }
        },
      }),

      getActivityDetails: tool({
        description: 'Get full details of a specific activity by ID',
        parameters: z.object({
          activityId: z.string().describe('The ID of the activity to get details for'),
        }),
        execute: async ({ activityId }) => {
          console.log('📋 Getting activity details:', activityId)

          const result = await db.select()
            .from(experiences)
            .where(eq(experiences.id, activityId))
            .limit(1)

          if (result.length === 0) {
            return { error: 'Activity not found' }
          }

          const exp = result[0]
          console.log(`✅ Found activity: ${exp.title}`)

          return {
            id: exp.id,
            title: exp.title,
            description: exp.description,
            category: exp.category,
            price: parseFloat(exp.price),
            island: exp.island,
            duration: exp.duration,
            maxGroupSize: exp.maxGroupSize,
            whatsIncluded: exp.whatsIncluded,
            rating: exp.rating ? parseFloat(exp.rating) : null,
            reviewCount: exp.reviewCount,
            images: exp.images,
            hostType: exp.hostType,
          }
        },
      }),
    }

    // System prompt for Maldy
    const systemPrompt = `You are Maldy, an enthusiastic AI trip planner specializing in the Maldives! 🏝️

Your role:
- Help users discover amazing activities and create personalized itineraries
- Use your searchActivities tool to find relevant activities based on user preferences
- Recommend activities with enthusiasm and helpful details
- Be friendly, helpful, and use emojis naturally

Guidelines:
- ALWAYS use the searchActivities tool when users ask about activities
- Describe the activities you found in an engaging way
- Mention key details like prices, locations, and what makes each activity special
- Ask clarifying questions if needed (budget, interests, dates, group size)
- Keep responses conversational and exciting!

Note: The system will automatically display activity cards with images, so just focus on being helpful and enthusiastic!`

    console.log('🤖 Calling Gemini with tools...')

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: convertToModelMessages(messages as UIMessage[]),
      tools,
      onError: (error) => {
        console.error('❌ Stream error:', error)
      },
      onFinish: async ({ text, toolCalls, toolResults }) => {
        console.log('🎯 AI Response:', text)
        console.log('🔧 Tool calls:', toolCalls?.length || 0)
        console.log('📊 Tool results:', toolResults?.length || 0)
      },
    })

    console.log('✅ Streaming response with tools...')

    // Transform the stream to append activity JSON at the end
    const stream = result.textStream
    const transformedStream = new ReadableStream({
      async start(controller) {
        // Stream all AI text first
        for await (const chunk of stream) {
          controller.enqueue(chunk)
        }

        // Append activity JSON if any were found
        if (foundActivities.length > 0) {
          const jsonBlock = `\n\n${JSON.stringify({ activities: foundActivities })}`
          controller.enqueue(jsonBlock)
          console.log('📦 Injected activities JSON into stream')
        }

        controller.close()
      },
    })

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('❌ Maldy chat error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return c.json({ error: 'Failed to chat', details: String(error) }, 500)
  }
})

// POST /api/maldy/plan - Generate trip plan (DEPRECATED - use /chat instead)
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
