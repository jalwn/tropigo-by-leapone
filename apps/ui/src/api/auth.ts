// User authentication and management

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const USER_ID_KEY = 'tropigo_guest_user_id'

interface GuestUserResponse {
  success: boolean
  data?: {
    id: string
    email: string
    name: string
  }
  error?: string
}

/**
 * Get the current user ID from localStorage or create a new guest user
 */
export async function getUserId(): Promise<string> {
  // Check if we already have a user ID
  let userId = localStorage.getItem(USER_ID_KEY)

  if (userId) {
    return userId
  }

  // Create a new guest user
  try {
    const response = await fetch(`${API_BASE}/users/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data: GuestUserResponse = await response.json()

    if (data.success && data.data) {
      userId = data.data.id
      localStorage.setItem(USER_ID_KEY, userId)
      return userId
    }

    throw new Error(data.error || 'Failed to create guest user')
  } catch (error) {
    console.error('Error creating guest user:', error)
    throw error
  }
}

/**
 * Clear the current user session (for testing)
 */
export function clearUserSession(): void {
  localStorage.removeItem(USER_ID_KEY)
}
