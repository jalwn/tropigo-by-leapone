import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { createReview, fetchCurrentUser } from '@/lib/api'
import { Button } from './ui/button'
import { Modal } from './ui/modal'

interface WriteReviewModalProps {
  isOpen: boolean
  onClose: () => void
  experienceId: string
  userId?: string
}

export default function WriteReviewModal({ isOpen, onClose, experienceId, userId }: WriteReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const queryClient = useQueryClient()

  // Fetch current user if userId not provided
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    enabled: !userId && isOpen,
  })

  const effectiveUserId = userId || currentUser?.id

  const mutation = useMutation({
    mutationFn: (data: { rating: number; comment: string }) => {
      if (!effectiveUserId) {
        throw new Error('User ID not available')
      }
      return createReview(effectiveUserId, experienceId, data.rating, data.comment)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', experienceId] })
      queryClient.invalidateQueries({ queryKey: ['reviews', experienceId] })
      onClose()
      setRating(0)
      setComment('')
    },
    onError: (error) => {
      console.error('Failed to submit review:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit review. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!effectiveUserId) {
      alert('Please wait for user information to load')
      return
    }
    if (rating === 0) {
      alert('Please select a rating')
      return
    }
    if (!comment.trim()) {
      alert('Please write a review')
      return
    }
    mutation.mutate({ rating, comment })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Write Review"
    >
      <form onSubmit={handleSubmit} className="px-6 pb-6">
        <div className="mb-6">
          <label className="block text-base font-medium text-[#1a3a2e] mb-3">Rating:</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="bg-transparent border-none cursor-pointer p-1 transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <Star
                  className={`transition-colors ${
                    star <= (hoveredRating || rating) 
                      ? 'text-[#ffeb3b] fill-[#ffeb3b]' 
                      : 'text-[#ddd] fill-none'
                  }`}
                  size={32}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <textarea
            className="w-full p-4 border-2 border-[#e0e0e0] rounded-xl text-sm font-inherit resize-y min-h-[120px] outline-none transition-colors focus:border-[#1a3a2e] placeholder:text-[#999]"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-2 border-[#1a3a2e] text-[#1a3a2e] bg-transparent hover:bg-[#1a3a2e] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending || rating === 0 || !comment.trim() || !effectiveUserId}
            className="bg-[#D4FF00] text-[#1a3a2e] border-none rounded-2xl hover:bg-[#C6F070] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

