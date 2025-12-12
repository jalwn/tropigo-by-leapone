import type { ApiResponse, Experience, Booking, Review, User, Landmark } from '@tropigo/types'

const API_BASE = 'http://localhost:8060/api'

export async function fetchCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE}/user/current`)
  const data: ApiResponse<User> = await response.json()
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch current user')
  }
  
  return data.data
}

export async function fetchExperiences(category?: string): Promise<Experience[]> {
  const url = category && category !== 'all' 
    ? `${API_BASE}/experiences?category=${category}`
    : `${API_BASE}/experiences`
  
  const response = await fetch(url)
  const data: ApiResponse<Experience[]> = await response.json()
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch experiences')
  }
  
  return data.data
}

export async function fetchExperience(id: string): Promise<Experience> {
  const response = await fetch(`${API_BASE}/experiences/${id}`)
  const data: ApiResponse<Experience> = await response.json()
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch experience')
  }
  
  return data.data
}

export async function fetchBookings(userId: string = 'user1'): Promise<Booking[]> {
  const response = await fetch(`${API_BASE}/bookings?userId=${userId}`)
  const data: ApiResponse<Booking[]> = await response.json()
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch bookings')
  }
  
  return data.data
}

export async function fetchWishlist(userId: string = 'user1'): Promise<Experience[]> {
  const response = await fetch(`${API_BASE}/wishlist?userId=${userId}`)
  const data: ApiResponse<Experience[]> = await response.json()
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch wishlist')
  }
  
  return data.data
}

export async function addToWishlist(userId: string, experienceId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, experienceId }),
  })
  
  const data: ApiResponse<unknown> = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to add to wishlist')
  }
}

export async function fetchReviews(experienceId: string): Promise<Review[]> {
  const response = await fetch(`${API_BASE}/experiences/${experienceId}/reviews`)
  const data: ApiResponse<Review[]> = await response.json()
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch reviews')
  }
  
  return data.data
}

export async function createReview(userId: string, experienceId: string, rating: number, comment: string): Promise<void> {
  const response = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, experienceId, rating, comment }),
  })
  
  const data: ApiResponse<unknown> = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create review')
  }
}

export async function createBooking(userId: string, experienceId: string, bookingDate: string, numberOfGuests: string): Promise<void> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, experienceId, bookingDate, numberOfGuests }),
  })
  
  const data: ApiResponse<unknown> = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create booking')
  }
}

export interface FetchLandmarksParams {
  lat?: number
  lng?: number
  radiusKm?: number
  lang?: string
}

export async function fetchLandmarks(params: FetchLandmarksParams = {}): Promise<Landmark[]> {
  const url = new URL(`${API_BASE}/landmarks`)

  if (params.lat != null && params.lng != null) {
    url.searchParams.set('lat', params.lat.toString())
    url.searchParams.set('lng', params.lng.toString())
  }

  if (params.radiusKm != null) {
    url.searchParams.set('radius', params.radiusKm.toString())
  }

  if (params.lang) {
    url.searchParams.set('lang', params.lang)
  }

  const response = await fetch(url.toString())
  const data: ApiResponse<Landmark[]> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch landmarks')
  }

  return data.data
}

export async function fetchLandmark(id: string, lang?: string): Promise<Landmark> {
  const url = new URL(`${API_BASE}/landmarks/${id}`)
  if (lang) {
    url.searchParams.set('lang', lang)
  }

  const response = await fetch(url.toString())
  const data: ApiResponse<Landmark> = await response.json()

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch landmark')
  }

  return data.data
}

