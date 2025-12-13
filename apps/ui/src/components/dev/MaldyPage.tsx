import { useState, useEffect } from 'react'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { getUserId } from '../../api/auth'
import { getOrCreateConversation, startNewConversation } from '../../api/conversations'
import { ActivityCard } from '../ActivityCard'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const QUICK_PROMPTS = [
    {
        id: 'adventure',
        title: '5 Days Adventure',
        description: 'Action-packed itinerary with diving, water sports & island hopping',
        icon: '🧭',
    },
    {
        id: 'honeymoon',
        title: 'Honeymoon Trip',
        description: 'Romantic experiences with sunset cruises & private islands',
        icon: '💕',
    },
    {
        id: 'budget',
        title: 'Budget Friendly',
        description: 'Affordable local experiences without compromising on fun',
        icon: '💰',
    },
    {
        id: 'cultural',
        title: 'Cultural Immersion',
        description: 'Authentic local experiences, cooking, fishing & traditions',
        icon: '📅',
    },
]

interface Activity {
    id: string
    title: string
    description: string
    category: string
    price: number
    island: string
    duration?: string | null
    rating?: number | null
    reviewCount?: string | null
    images: string[]
}

export default function MaldyPage() {
    const [userId, setUserId] = useState<string | null>(null)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [isInitializing, setIsInitializing] = useState(true)
    const [recommendedActivities, setRecommendedActivities] = useState<Activity[]>([])
    const [inputMessage, setInputMessage] = useState('')

    const { messages, status, error, sendMessage } = useChat({
        transport: new TextStreamChatTransport({
            api: `${API_BASE}/maldy/chat`,
        }),
    })

    const isLoading = status === 'streaming' || status === 'submitted'

    // Initialize user and conversation on mount
    useEffect(() => {
        async function initialize() {
            try {
                // Get or create guest user
                const uid = await getUserId()
                setUserId(uid)

                // Get or create active conversation
                const conv = await getOrCreateConversation(uid)
                setConversationId(conv.id)

                console.log('✅ Initialized:', { userId: uid, conversationId: conv.id })
            } catch (error) {
                console.error('Failed to initialize:', error)
            } finally {
                setIsInitializing(false)
            }
        }

        initialize()
    }, [])

    // Parse activities from AI response (simple JSON extraction)
    useEffect(() => {
        const lastMessage = messages[messages.length - 1]
        if (lastMessage && lastMessage.role === 'assistant') {
            const content = lastMessage.parts
                .filter(part => part.type === 'text')
                .map(part => part.text)
                .join('')

            parseActivitiesFromResponse(content)
        }
    }, [messages])

    const parseActivitiesFromResponse = (content: string) => {
        try {
            // Look for JSON blocks containing activity data
            const jsonMatch = content.match(/\{[\s\S]*"activities"[\s\S]*\}/g)
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0])
                if (data.activities && Array.isArray(data.activities)) {
                    setRecommendedActivities(prev => [...prev, ...data.activities])
                }
            }
        } catch (error) {
            // Silent fail - not all responses will have activities
        }
    }

    // Strip JSON from message text for display
    const stripJsonFromText = (text: string) => {
        try {
            // Remove JSON blocks containing activities
            return text.replace(/\{[\s\S]*"activities"[\s\S]*\}/g, '').trim()
        } catch (error) {
            return text
        }
    }

    const handlePromptClick = (prompt: typeof QUICK_PROMPTS[0]) => {
        setInputMessage(prompt.description)
    }

    const handleNewChat = async () => {
        if (!userId) return

        try {
            const newConv = await startNewConversation(userId)
            setConversationId(newConv.id)
            setRecommendedActivities([])
            console.log('✅ Started new chat:', newConv.id)
            // Note: messages will persist in UI, but new conversation in DB
            window.location.reload() // Simple way to reset chat UI
        } catch (error) {
            console.error('Failed to start new chat:', error)
        }
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId || !conversationId || !inputMessage.trim() || isLoading) return

        sendMessage(
            { text: inputMessage },
            {
                body: {
                    userId,
                    conversationId,
                },
            }
        )
        setInputMessage('')
    }

    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
                <div className="text-center">
                    <div className="text-4xl mb-4">✨</div>
                    <p className="text-[#666]">Initializing Maldy...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen px-4 py-5 pb-[100px] bg-[#f5f5f5]">
            {/* Header with New Chat button */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#a5d6a7] to-[#c5e1a5] rounded-xl flex items-center justify-center text-[28px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                        ✨
                    </div>
                    <div>
                        <h1 className="text-[28px] font-bold text-[#1a3a2e] m-0 mb-1">Maldy</h1>
                        <p className="text-sm text-[#666] m-0">Your AI Trip Planner</p>
                    </div>
                </div>
                <button
                    onClick={handleNewChat}
                    className="px-4 py-2 bg-white border-2 border-[#a5d6a7] rounded-full text-sm font-medium text-[#1a3a2e] cursor-pointer transition-all hover:bg-[#a5d6a7]"
                >
                    🔄 New Chat
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                    <strong>Error:</strong> {error.message}
                </div>
            )}

            {/* Quick Prompts (show only if no messages) */}
            {messages.length === 0 && (
                <div className="mb-6">
                    <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                        <p className="text-[#666] text-sm m-0">
                            Hi! I'm Maldy, your AI trip planner for the Maldives 🏝️
                            <br />
                            Tell me what kind of trip you're planning, or choose a quick prompt below!
                        </p>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-[#1a3a2e] mb-4">Quick prompts:</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {QUICK_PROMPTS.map(prompt => (
                                <button
                                    key={prompt.id}
                                    className="bg-white border-none rounded-2xl p-5 text-left cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
                                    onClick={() => handlePromptClick(prompt)}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#a5d6a7] to-[#c5e1a5] rounded-xl flex items-center justify-center text-2xl mb-3">
                                        {prompt.icon}
                                    </div>
                                    <h3 className="text-base font-semibold text-[#1a3a2e] m-0 mb-2">{prompt.title}</h3>
                                    <p className="text-xs text-[#666] m-0 leading-snug">{prompt.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Messages */}
            {messages.length > 0 && (
                <div className="mb-6">
                    {messages.map((msg: UIMessage) => (
                        <div key={msg.id} className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                            {msg.role === 'user' ? (
                                <div className="bg-[#a5d6a7] text-[#1a3a2e] px-4 py-3 rounded-2xl max-w-[80%] shadow-sm">
                                    <p className="m-0 text-sm">
                                        {msg.parts
                                            .filter(part => part.type === 'text')
                                            .map((part, idx) => <span key={idx}>{part.text}</span>)}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
                                    <div className="flex items-start gap-2 mb-2">
                                        <span className="text-xl">✨</span>
                                        <div className="flex-1">
                                            <p className="m-0 text-sm text-[#333] whitespace-pre-wrap leading-relaxed">
                                                {msg.parts
                                                    .filter(part => part.type === 'text')
                                                    .map((part, idx) => <span key={idx}>{stripJsonFromText(part.text)}</span>)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-[#666] text-sm">
                            <span className="animate-pulse">✨</span>
                            <span>Maldy is thinking...</span>
                        </div>
                    )}
                </div>
            )}

            {/* Recommended Activities */}
            {recommendedActivities.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#1a3a2e] mb-4">Recommended Activities</h2>
                    {recommendedActivities.map(activity => (
                        <ActivityCard key={activity.id} {...activity} />
                    ))}
                </div>
            )}

            {/* Input */}
            <form
                onSubmit={onSubmit}
                className="fixed bottom-20 left-4 right-4 flex gap-3 items-center bg-white p-3 rounded-[24px] shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10"
            >
                <input
                    type="text"
                    className="flex-1 border-none outline-none text-sm text-[#333] bg-transparent placeholder:text-[#999]"
                    placeholder="Describe your dream Maldives trip..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a5d6a7] to-[#c5e1a5] border-none flex items-center justify-center text-lg cursor-pointer transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:scale-105 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ✈️
                </button>
            </form>
        </div>
    )
}
