import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar } from 'lucide-react'
import { createBooking, fetchCurrentUser } from '@/lib/api'
import { Button } from './ui/button'
import { Modal } from './ui/modal'

interface BookNowModalProps {
  isOpen: boolean
  onClose: () => void
  experienceId: string
  price: string
  activityTitle?: string
  userId?: string
}

export default function BookNowModal({ isOpen, onClose, experienceId, price, activityTitle, userId }: BookNowModalProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [numberOfGuests, setNumberOfGuests] = useState('1')
  const [step, setStep] = useState<'date' | 'guests' | 'confirm'>('date')
  const queryClient = useQueryClient()

  // Fetch current user if userId not provided
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    enabled: !userId && isOpen,
  })

  const effectiveUserId = userId || currentUser?.id

  const mutation = useMutation({
    mutationFn: (data: { date: string; guests: string }) => {
      if (!effectiveUserId) {
        throw new Error('User ID not available')
      }
      return createBooking(effectiveUserId, experienceId, data.date, data.guests)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setStep('confirm')
    },
    onError: (error) => {
      console.error('Failed to create booking:', error)
      alert(error instanceof Error ? error.message : 'Failed to create booking. Please try again.')
    },
  })

  // Generate available dates (next 30 days)
  const generateDates = () => {
    const dates: Date[] = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const dates = generateDates()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0])
    setStep('guests')
  }

  const handleContinue = () => {
    if (step === 'guests') {
      if (!selectedDate || !numberOfGuests) return
      mutation.mutate({ date: selectedDate, guests: numberOfGuests })
    }
  }

  const handleClose = () => {
    setStep('date')
    setSelectedDate(null)
    setNumberOfGuests('1')
    onClose()
  }

  const totalPrice = (parseFloat(price) * parseInt(numberOfGuests || '1')).toFixed(2)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Book Experience"
      subtitle={activityTitle || 'Experience'}
      maxWidth="600px"
    >
      {step === 'confirm' && mutation.isSuccess ? (
        <div className="py-10 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#4caf50] text-white text-[32px] font-semibold flex items-center justify-center mx-auto mb-5">
            ✓
          </div>
          <h3 className="text-2xl font-semibold text-[#1a3a2e] m-0 mb-2">Booking Confirmed!</h3>
          <p className="text-sm text-[#666] m-0 mb-6">Your booking has been successfully created.</p>
          <Button 
            onClick={handleClose} 
            className="bg-[#ffeb3b] text-[#1a3a2e] border-none px-8 py-3 hover:bg-[#c6f070]"
          >
            Close
          </Button>
        </div>
      ) : (
        <>
          {step === 'date' && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto py-2">
                {dates.map((date, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`flex items-center gap-3 p-4 bg-white border-2 rounded-xl cursor-pointer transition-all text-left ${
                      selectedDate === date.toISOString().split('T')[0]
                        ? 'border-[#ffeb3b] bg-[#fff9e6]'
                        : 'border-[#e0e0e0] hover:border-[#1a3a2e] hover:bg-[#f9f9f9]'
                    }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    <Calendar className="text-[#666] flex-shrink-0" size={20} />
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm font-semibold text-[#1a3a2e]">{formatDate(date).split(' ')[0]}</div>
                      <div className="text-xs text-[#666]">{formatDate(date).split(' ').slice(1).join(' ')}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'guests' && (
            <div className="px-6 pb-6">
              <div className="mb-6">
                <label className="block text-base font-medium text-[#1a3a2e] mb-3">Number of Guests</label>
                <div className="flex items-center gap-3 justify-center">
                  <button
                    type="button"
                    className="w-11 h-11 rounded-full border-2 border-[#1a3a2e] bg-white text-[#1a3a2e] text-2xl font-semibold cursor-pointer transition-all flex items-center justify-center hover:bg-[#1a3a2e] hover:text-white"
                    onClick={() => setNumberOfGuests(Math.max(1, parseInt(numberOfGuests || '1') - 1).toString())}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="w-20 p-3 border-2 border-[#e0e0e0] rounded-xl text-lg font-semibold text-center outline-none transition-colors focus:border-[#1a3a2e]"
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(e.target.value)}
                    min="1"
                  />
                  <button
                    type="button"
                    className="w-11 h-11 rounded-full border-2 border-[#1a3a2e] bg-white text-[#1a3a2e] text-2xl font-semibold cursor-pointer transition-all flex items-center justify-center hover:bg-[#1a3a2e] hover:text-white"
                    onClick={() => setNumberOfGuests((parseInt(numberOfGuests || '1') + 1).toString())}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-[#f9f9f9] rounded-xl p-5 mt-6">
                <div className="flex justify-between items-center py-2 text-sm text-[#666]">
                  <span>Price per person</span>
                  <span>${parseFloat(price).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm text-[#666]">
                  <span>Number of guests</span>
                  <span>{numberOfGuests}</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-[#e0e0e0] text-lg font-semibold text-[#1a3a2e]">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 px-6 pb-6 pt-5 border-t border-[#e0e0e0] justify-end">
            {step === 'guests' && (
              <Button
                onClick={() => setStep('date')}
                variant="outline"
                className="border-2 border-[#1a3a2e] text-[#1a3a2e] bg-transparent hover:bg-[#1a3a2e] hover:text-white"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleContinue}
              disabled={mutation.isPending || (step === 'date' && !selectedDate) || (step === 'guests' && !numberOfGuests) || !effectiveUserId}
              className="bg-[#D4FF00] text-[#1a3a2e] border-none flex-1 max-w-[200px] rounded-2xl hover:bg-[#C6F070] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Processing...' : step === 'guests' ? 'Confirm Booking' : 'Continue'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}

