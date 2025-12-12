import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ApiResponse } from '@tropigo/types'
import { db, experiences, bookings, wishlist, reviews, users, landmarks, landmarkTranslations } from './db'
import { eq, and, inArray, desc } from 'drizzle-orm'

const app = new Hono()

// Enable CORS for frontend to connect
app.use('/*', cors())

const toRadians = (degrees: number) => degrees * (Math.PI / 180)

const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 // Earth radius in km
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const normalizeLanguage = (lang?: string | null) => {
  if (!lang) return 'en'
  return lang.split(',')[0]?.split('-')[0]?.toLowerCase() || 'en'
}

// Get all experiences, optionally filtered by category
app.get('/api/experiences', async (c) => {
  try {
    const category = c.req.query('category')
    
    let allExperiences
    if (category && category !== 'all') {
      allExperiences = await db.select().from(experiences).where(eq(experiences.category, category))
    } else {
      allExperiences = await db.select().from(experiences)
    }

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

// Get single experience by ID
app.get('/api/experiences/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const experience = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1)
    
    if (experience.length === 0) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Experience not found',
      }
      return c.json(response, 404)
    }

    const response: ApiResponse<typeof experience[0]> = {
      success: true,
      data: experience[0],
    }

    return c.json(response)
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch experience',
    }
    return c.json(response, 500)
  }
})

// Get current user (first tourist user for demo purposes)
app.get('/api/user/current', async (c) => {
  try {
    const user = await db.select().from(users).where(eq(users.role, 'tourist')).limit(1)
    
    if (user.length === 0) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'No tourist user found',
      }
      return c.json(response, 404)
    }

    const response: ApiResponse<typeof user[0]> = {
      success: true,
      data: user[0],
    }

    return c.json(response)
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch current user',
    }
    return c.json(response, 500)
  }
})

// Get bookings for a user
app.get('/api/bookings', async (c) => {
  try {
    const userId = c.req.query('userId') || 'user1' // TODO: Get from auth
    const allBookings = await db.select().from(bookings).where(eq(bookings.userId, userId))

    const response: ApiResponse<typeof allBookings> = {
      success: true,
      data: allBookings,
    }

    return c.json(response)
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch bookings',
    }
    return c.json(response, 500)
  }
})

// Get wishlist for a user
app.get('/api/wishlist', async (c) => {
  try {
    const userId = c.req.query('userId') || 'user1' // TODO: Get from auth
    const wishlistItems = await db.select().from(wishlist).where(eq(wishlist.userId, userId))

    // Get experience details for each wishlist item
    const experienceIds = wishlistItems.map(item => item.experienceId)
    let wishlistExperiences: typeof experiences.$inferSelect[] = []
    
    if (experienceIds.length > 0) {
      wishlistExperiences = await db.select().from(experiences).where(inArray(experiences.id, experienceIds))
    }

    const response: ApiResponse<typeof wishlistExperiences> = {
      success: true,
      data: wishlistExperiences,
    }

    return c.json(response)
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch wishlist',
    }
    return c.json(response, 500)
  }
})

// Get nearby landmarks (supports location + language)
app.get('/api/landmarks', async (c) => {
  try {
    const lang = normalizeLanguage(c.req.query('lang') || c.req.header('accept-language'))
    const lat = parseFloat(c.req.query('lat') || '')
    const lng = parseFloat(c.req.query('lng') || '')
    const hasCoordinates = !Number.isNaN(lat) && !Number.isNaN(lng)
    const radiusKm = parseFloat(c.req.query('radius') || '') || 20

    const baseLandmarks = await db.select().from(landmarks)
    const landmarkIds = baseLandmarks.map((l) => l.id)

    const translations = landmarkIds.length
      ? await db.select().from(landmarkTranslations).where(inArray(landmarkTranslations.landmarkId, landmarkIds))
      : []

    const enriched = baseLandmarks
      .map((l) => {
        const preferred =
          translations.find((t) => t.landmarkId === l.id && t.language === lang) ||
          translations.find((t) => t.landmarkId === l.id && t.language === l.defaultLanguage) ||
          translations.find((t) => t.landmarkId === l.id)

        const distanceKm = hasCoordinates
          ? haversineDistanceKm(lat, lng, Number(l.latitude), Number(l.longitude))
          : null

        return {
          ...l,
          name: preferred?.name || l.name,
          description: preferred?.description || null,
          language: preferred?.language || l.defaultLanguage,
          distanceKm,
        }
      })
      .filter((l) => {
        if (!hasCoordinates) return true
        return typeof l.distanceKm === 'number' && l.distanceKm <= radiusKm
      })
      .sort((a, b) => {
        if (!hasCoordinates) return 0
        return (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER)
      })

    const response: ApiResponse<typeof enriched> = {
      success: true,
      data: enriched,
    }

    return c.json(response)
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch landmarks',
    }
    return c.json(response, 500)
  }
})

// Get single landmark with translations
app.get('/api/landmarks/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const lang = normalizeLanguage(c.req.query('lang') || c.req.header('accept-language'))

    const landmark = await db.select().from(landmarks).where(eq(landmarks.id, id)).limit(1)
    if (!landmark.length) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Landmark not found',
      }
      return c.json(response, 404)
    }

    const translations = await db
      .select()
      .from(landmarkTranslations)
      .where(eq(landmarkTranslations.landmarkId, id))

    const preferred =
      translations.find((t) => t.language === lang) ||
      translations.find((t) => t.language === landmark[0].defaultLanguage) ||
      translations[0]

    const detailed = {
      ...landmark[0],
      name: preferred?.name || landmark[0].name,
      description: preferred?.description || null,
      language: preferred?.language || landmark[0].defaultLanguage,
    }

    const response: ApiResponse<typeof detailed> = {
      success: true,
      data: detailed,
    }

    return c.json(response)
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch landmark',
    }
    return c.json(response, 500)
  }
})

// Add to wishlist
app.post('/api/wishlist', async (c) => {
  try {
    const body = await c.req.json()
    const { userId, experienceId } = body

    // Check if already in wishlist
    const existing = await db.select().from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.experienceId, experienceId)))
      .limit(1)

    if (existing.length > 0) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Already in wishlist',
      }
      return c.json(response, 400)
    }

    const newItem = await db.insert(wishlist).values({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      experienceId,
    }).returning()

    const response: ApiResponse<typeof newItem[0]> = {
      success: true,
      data: newItem[0],
    }

    return c.json(response, 201)
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to add to wishlist',
    }
    return c.json(response, 500)
  }
})

// Get reviews for an experience
app.get('/api/experiences/:id/reviews', async (c) => {
  try {
    const experienceId = c.req.param('id')
    const allReviews = await db.select({
      id: reviews.id,
      userId: reviews.userId,
      experienceId: reviews.experienceId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      userName: users.name,
    })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.experienceId, experienceId))
      .orderBy(desc(reviews.createdAt))

    const response: ApiResponse<typeof allReviews> = {
      success: true,
      data: allReviews,
    }

    return c.json(response)
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch reviews',
    }
    return c.json(response, 500)
  }
})

// Create a review
app.post('/api/reviews', async (c) => {
  try {
    const body = await c.req.json()
    const { userId, experienceId, rating, comment } = body

    if (!userId || !experienceId || !rating || !comment) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required fields: userId, experienceId, rating, comment',
      }
      return c.json(response, 400)
    }

    const newReview = await db.insert(reviews).values({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      experienceId,
      rating: rating.toString(),
      comment,
    }).returning()

    // Update experience rating (calculate average)
    const allReviews = await db.select().from(reviews).where(eq(reviews.experienceId, experienceId))
    const avgRating = allReviews.reduce((sum, r) => sum + parseFloat(r.rating || '0'), 0) / allReviews.length

    await db.update(experiences)
      .set({ 
        rating: avgRating.toFixed(2),
        reviewCount: allReviews.length.toString(),
      })
      .where(eq(experiences.id, experienceId))

    const response: ApiResponse<typeof newReview[0]> = {
      success: true,
      data: newReview[0],
    }

    return c.json(response, 201)
  } catch (error: any) {
    console.error('Error creating review:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: error?.message || 'Failed to create review',
    }
    return c.json(response, 500)
  }
})

// Create a booking
app.post('/api/bookings', async (c) => {
  try {
    const body = await c.req.json()
    const { userId, experienceId, bookingDate, numberOfGuests } = body

    if (!userId || !experienceId || !bookingDate || !numberOfGuests) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required fields: userId, experienceId, bookingDate, numberOfGuests',
      }
      return c.json(response, 400)
    }

    // Get experience price
    const experience = await db.select().from(experiences).where(eq(experiences.id, experienceId)).limit(1)
    if (experience.length === 0) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Experience not found',
      }
      return c.json(response, 404)
    }

    const pricePerPerson = parseFloat(experience[0].price)
    const totalPrice = (pricePerPerson * parseInt(numberOfGuests)).toFixed(2)

    const newBooking = await db.insert(bookings).values({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      experienceId,
      bookingDate: new Date(bookingDate),
      numberOfGuests: numberOfGuests.toString(),
      totalPrice,
      status: 'pending',
    }).returning()

    const response: ApiResponse<typeof newBooking[0]> = {
      success: true,
      data: newBooking[0],
    }

    return c.json(response, 201)
  } catch (error: any) {
    console.error('Error creating booking:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: error?.message || 'Failed to create booking',
    }
    return c.json(response, 500)
  }
})

export default {
  port: 8060,
  fetch: app.fetch,
}
