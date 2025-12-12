import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ApiResponse } from '@tropigo/types'
import { db, experiences } from './db'
import maldy from './routes/maldy'

const app = new Hono()

// Enable CORS for frontend to connect
app.use('/*', cors())

// Mount routes
app.route('/api/maldy', maldy)

// Example: Get all experiences from database
app.get('/api/experiences', async (c) => {
  try {
    const allExperiences = await db.select().from(experiences)

    const response: ApiResponse<typeof allExperiences> = {
      success: true,
      data: allExperiences,
    }

    return c.json(response)
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch experiences',
    }
    return c.json(response, 500)
  }
})

export default {
  port: 8060,
  fetch: app.fetch,
  idleTimeout: 120, // 2 minutes for AI streaming
}
