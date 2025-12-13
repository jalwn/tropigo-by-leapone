// Conversation management API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8060'

export interface Conversation {
  id: string
  userId: string
  title: string | null
  messages: string // JSON string
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

interface ConversationResponse {
  success: boolean
  data?: Conversation
  error?: string
}

/**
 * Get or create active conversation for a user
 */
export async function getOrCreateConversation(userId: string): Promise<Conversation> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/maldy/conversation?userId=${userId}`)
    const data: ConversationResponse = await response.json()

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.error || 'Failed to get conversation')
  } catch (error) {
    console.error('Error getting conversation:', error)
    throw error
  }
}

/**
 * Start a new conversation (archives current active one)
 */
export async function startNewConversation(userId: string): Promise<Conversation> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/maldy/conversation/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    const data: ConversationResponse = await response.json()

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.error || 'Failed to create new conversation')
  } catch (error) {
    console.error('Error creating new conversation:', error)
    throw error
  }
}
