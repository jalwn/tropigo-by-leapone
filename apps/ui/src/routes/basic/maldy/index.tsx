// Maldy AI Trip Planner - Chat Interface
import { createFileRoute } from '@tanstack/react-router'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { useState } from 'react'

export const Route = createFileRoute('/basic/maldy/')({
  component: MaldyPage,
})

function MaldyPage() {
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [groupSize, setGroupSize] = useState('2')

  const API_URL = import.meta.env.VITE_API_URL || '/api'

  const { messages, status, error, sendMessage } = useChat({
    transport: new TextStreamChatTransport({
      api: `${API_URL}/maldy/plan`,
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!budget || !startDate || !endDate || interests.length === 0) {
      alert('Please fill in all fields')
      return
    }

    sendMessage(
      {
        text: `Plan a trip: Budget $${budget}, ${startDate} to ${endDate}, Interests: ${interests.join(', ')}, Group: ${groupSize}`,
      },
      {
        body: {
          budget: Number(budget),
          startDate,
          endDate,
          interests,
          groupSize: Number(groupSize),
        },
      }
    )
  }

  const interestOptions = ['fishing', 'diving', 'island-hopping', 'cultural']

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>🤖 Maldy - AI Trip Planner</h1>
      <p>Tell me your budget, dates, and interests. I'll create a personalized Maldives itinerary!</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label>Budget (USD)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="1000"
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
          </div>

          <div>
            <label>Group Size</label>
            <input
              type="number"
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              min="1"
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <div>
            <label>Interests</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    background: interests.includes(interest) ? '#007bff' : 'white',
                    color: interests.includes(interest) ? 'white' : 'black',
                    cursor: 'pointer',
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '1rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            {isLoading ? 'Planning...' : 'Plan My Trip 🏝️'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ padding: '1rem', background: '#fee', color: '#c00', borderRadius: '4px' }}>
          Error: {error.message}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        {messages.map((message: UIMessage) => (
          <div
            key={message.id}
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              background: message.role === 'user' ? '#f0f0f0' : '#e3f2fd',
              borderRadius: '8px',
            }}
          >
            <strong>{message.role === 'user' ? 'You' : 'Maldy'}:</strong>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
              {message.parts.map((part, index) =>
                part.type === 'text' ? <span key={index}>{part.text}</span> : null
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
            <em>Maldy is thinking...</em>
          </div>
        )}
      </div>
    </div>
  )
}
