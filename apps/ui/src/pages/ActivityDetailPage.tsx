import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from '@tanstack/react-router'
import { fetchExperience, fetchReviews } from '@/lib/api'
import { ArrowLeft, Heart, Check, Star, MapPin } from 'lucide-react'
import WriteReviewModal from '@/components/WriteReviewModal'
import BookNowModal from '@/components/BookNowModal'
import type { Review } from '@tropigo/types'

export default function ActivityDetailPage() {
  const { id } = useParams({ from: '/activities/$id' })
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)
  
  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => fetchExperience(id),
  })

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetchReviews(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pb-[100px]">
        <div className="text-center py-10 px-5 text-[#666] text-base">Loading activity...</div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pb-[100px]">
        <div className="text-center py-10 px-5 text-[#666] text-base">Activity not found</div>
      </div>
    )
  }

  const whatsIncluded = activity.whatsIncluded || [
    'Full diving equipment',
    'Boat transfers',
    'Professional dive guide',
  ]

  const formatReviewDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-[100px]">
      {/* Hero Image Section */}
      <div className="relative w-full h-[400px] overflow-hidden">
        {activity.images && activity.images.length > 0 ? (
          <img 
            src={activity.images[0]} 
            alt={activity.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#4fc3f7] to-[#29b6f6] flex items-center justify-center text-[80px]">
            <span>🏝️</span>
          </div>
        )}
        
        {/* Navigation buttons */}
        <Link 
          to="/explore" 
          className="absolute top-4 left-4 w-11 h-11 rounded-full bg-white/90 border-none flex items-center justify-center cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15)] text-[#1a3a2e] hover:bg-white hover:scale-105"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <button className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 border-none flex items-center justify-center cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15)] text-[#666] hover:bg-white hover:scale-105">
          <Heart className="w-6 h-6" />
        </button>
        
        {/* Image carousel dots */}
        {activity.images && activity.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {activity.images.map((_, index) => (
              <span 
                key={index} 
                className={`w-2 h-2 rounded-full transition-all ${
                  index === 0 
                    ? 'bg-white w-6 rounded' 
                    : 'bg-white/50 border border-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="px-4 py-6">
        {/* Title and Rating */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[28px] font-bold text-[#1a3a2e] m-0 flex-1">{activity.title}</h1>
            {activity.hostType && (
              <span className="px-3 py-1.5 rounded-[20px] bg-[#ffeb3b] text-[#1a3a2e] text-xs font-semibold whitespace-nowrap">
                {activity.hostType}
              </span>
            )}
          </div>
          {activity.rating && (
            <div className="flex items-center gap-1.5 text-[#666] text-sm">
              <span className="text-lg">⭐</span>
              <span className="font-semibold text-[#1a3a2e]">{activity.rating}</span>
              {activity.reviewCount && (
                <span className="text-[#999]">({activity.reviewCount} reviews)</span>
              )}
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-white rounded-xl p-4 text-center shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
            <div className="text-2xl mb-2">📍</div>
            <div className="text-sm font-medium text-[#1a3a2e]">{activity.island}</div>
          </div>
          {activity.duration && (
            <div className="flex-1 bg-white rounded-xl p-4 text-center shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
              <div className="text-2xl mb-2">🕐</div>
              <div className="text-sm font-medium text-[#1a3a2e]">{activity.duration}</div>
            </div>
          )}
          {activity.maxGroupSize && (
            <div className="flex-1 bg-white rounded-xl p-4 text-center shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium text-[#1a3a2e]">Max {activity.maxGroupSize}</div>
            </div>
          )}
        </div>

        {/* Location Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#1a3a2e] m-0 mb-3">Location</h2>
          <div className="bg-[#f9f9f9] rounded-xl p-5 flex items-center gap-3">
            <MapPin className="text-[#666] flex-shrink-0" size={24} />
            <span className="text-base text-[#666] font-medium">{activity.island}</span>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#1a3a2e] m-0 mb-3">About this experience</h2>
          <p className="text-sm leading-relaxed text-[#666] m-0">{activity.description}</p>
        </div>

        {/* What's Included */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#1a3a2e] m-0 mb-3">What's included</h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-3">
            {whatsIncluded.map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-sm text-[#1a3a2e]">
                <Check className="w-5 h-5 text-[#4caf50] flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-[#1a3a2e] m-0">Review ({reviews.length})</h2>
            <button 
              className="px-4 py-2 bg-transparent border-2 border-[#1A3A2F] rounded-xl text-[#1A3A2F] text-sm font-medium cursor-pointer transition-all hover:bg-[#1A3A2F] hover:text-white"
              onClick={() => setShowReviewModal(true)}
            >
              Write Review
            </button>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-5 px-5 text-[#666] text-sm">Loading reviews...</div>
          ) : reviews.length > 0 ? (
            <div className="flex flex-col gap-4 mt-4">
              {reviews.map((review: Review) => (
                <div key={review.id} className="bg-white rounded-xl p-4 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a5d6a7] to-[#c5e1a5] flex items-center justify-center font-semibold text-[#1a3a2e] text-base">
                        {review.userName ? review.userName[0].toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-semibold text-[#1a3a2e]">{review.userName || 'Anonymous'}</div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`${
                                star <= parseFloat(review.rating || '0') 
                                  ? 'text-[#ffeb3b] fill-[#ffeb3b]' 
                                  : 'text-[#ddd] fill-none'
                              }`}
                              size={14}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-[#999]">{formatReviewDate(review.createdAt)}</div>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed m-0">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 px-5 text-[#666] text-sm">No reviews yet. Be the first to review!</div>
          )}
        </div>
      </div>

      {/* Footer with Price and Book Button */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-between items-center px-5 py-4 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#666]">From</span>
          <span className="text-2xl font-bold text-[#1a3a2e]">${parseFloat(activity.price).toFixed(0)} / person</span>
        </div>
        <button 
          className="px-8 py-3.5 bg-[#D4FF00] border-none rounded-2xl text-[#1a3a2e] text-base font-semibold cursor-pointer transition-all shadow-[0_2px_8px_rgba(212,255,0,0.3)] hover:bg-[#C6F070] active:scale-95"
          onClick={() => setShowBookModal(true)}
        >
          Book Now
        </button>
      </div>

      {/* Modals */}
      <WriteReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        experienceId={id}
      />
      <BookNowModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        experienceId={id}
        price={activity.price}
        activityTitle={activity.title}
      />
    </div>
  )
}
