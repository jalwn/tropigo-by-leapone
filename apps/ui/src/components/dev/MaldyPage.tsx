import { useState } from 'react'

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

export default function MaldyPage() {
    const [message, setMessage] = useState('')

    const handlePromptClick = (prompt: typeof QUICK_PROMPTS[0]) => {
        setMessage(prompt.description)
    }

    const handleSend = () => {
        if (message.trim()) {
            // TODO: Send message to AI
            console.log('Sending:', message)
            setMessage('')
        }
    }

    return (
        <div className="min-h-screen px-4 py-5 pb-[100px] bg-[#f5f5f5]">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#a5d6a7] to-[#c5e1a5] rounded-xl flex items-center justify-center text-[28px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                    ✨
                </div>
                <div>
                    <h1 className="text-[28px] font-bold text-[#1a3a2e] m-0 mb-1">Maldy</h1>
                    <p className="text-sm text-[#666] m-0">Your AI Trip Planner</p>
                </div>
            </div>

            <div className="mb-6">
                <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                    <p className="text-[#666] text-sm m-0">the quick prompts below!</p>
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

            <div className="fixed bottom-20 left-4 right-4 flex gap-3 items-center bg-white p-3 rounded-[24px] shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10">
                <input
                    type="text"
                    className="flex-1 border-none outline-none text-sm text-[#333] bg-transparent placeholder:text-[#999]"
                    placeholder="Describe your dream Maldives trip..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a5d6a7] to-[#c5e1a5] border-none flex items-center justify-center text-lg cursor-pointer transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:scale-105 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
                    onClick={handleSend}
                >
                    ✈️
                </button>
            </div>
        </div>
    )
}
