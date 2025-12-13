import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { fetchExperience, fetchReviews, fetchExperiences } from '@/lib/api'
import { ArrowLeft, Heart, Check, Star, MapPin, Share2, Crown, Shield, Clock, X, ChevronRight, Play } from 'lucide-react'
import WriteReviewModal from '@/components/WriteReviewModal'
import BookNowModal from '@/components/BookNowModal'
import type { Review, Experience } from '@tropigo/types'

export default function ActivityDetailPage() {
    const { id } = useParams({ from: '/dev/activities/$id' })
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [showBookModal, setShowBookModal] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState('dive-only')
    const [showFullDescription, setShowFullDescription] = useState(false)
    const [packagePrice, setPackagePrice] = useState(99)

    const { data: activity, isLoading } = useQuery({
        queryKey: ['activity', id],
        queryFn: () => fetchExperience(id),
    })

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
        queryKey: ['reviews', id],
        queryFn: () => fetchReviews(id),
        enabled: !!id,
    })

    // Fetch similar activities (same category, excluding current)
    const { data: similarActivities = [] } = useQuery({
        queryKey: ['similar-activities', activity?.category, id],
        queryFn: () => fetchExperiences(activity?.category),
        enabled: !!activity?.category && !!id,
        select: (data) => data.filter(exp => exp.id !== id).slice(0, 5),
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
        'Safety briefing',
        'Boat transfers',
        'Professional dive guide',
        'Full diving equipment',
        'Underwater photos',
    ]

    const whatsNotIncluded = ['Refreshments & snacks']

    const packages = [
        { id: 'dive-only', label: 'Dive Only', price: 99 },
        { id: 'hotel-pickup', label: 'Hotel Pickup + Dive', price: 145 },
        { id: 'hotel-pickup-bbq', label: 'Hotel Pickup + Dive + BBQ', price: 195 },
    ]

    const handlePackageSelect = (pkgId: string) => {
        setSelectedPackage(pkgId)
        const pkg = packages.find(p => p.id === pkgId)
        if (pkg) {
            setPackagePrice(pkg.price)
        }
    }

    const formatReviewDate = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date
        return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    }

    const shortDescription = "Dive with a 100% guarantee of encountering tiger sharks and a plethora of marine life"
    const fullDescription = "Explore a beautiful coral reef alongside thresher sharks, hammerheads, and whale sharks. This incredible diving experience offers you the chance to witness some of the ocean's most magnificent creatures in their natural habitat. Our professional guides ensure your safety while providing an unforgettable underwater adventure."

    return (
        <div className="min-h-screen bg-white pb-[100px]">
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
                    to="/dev/explore"
                    className="absolute top-4 left-4 w-11 h-11 rounded-full bg-white/90 border-none flex items-center justify-center cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15)] text-[#1a3a2e] hover:bg-white hover:scale-105 z-10"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                    <button 
                        className="w-11 h-11 rounded-full bg-white/90 border-none flex items-center justify-center cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:bg-white hover:scale-105"
                        onClick={() => setIsLiked(!isLiked)}
                    >
                        <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#f02327] text-[#f02327]' : 'text-[#666]'}`} />
                    </button>
                    <button className="w-11 h-11 rounded-full bg-white/90 border-none flex items-center justify-center cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15)] text-[#666] hover:bg-white hover:scale-105">
                        <Share2 className="w-6 h-6" />
                    </button>
                    <button className="w-11 h-11 rounded-full bg-white/90 border-none flex items-center justify-center cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15)] text-[#666] hover:bg-white hover:scale-105">
                        <Share2 className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-4 py-6 bg-white">
                {/* Popularity Indicators */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-[#4caf50]" />
                        <span className="text-sm font-medium text-[#1a3a2e]">Popular</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 fill-[#f02327] text-[#f02327]" />
                        <span className="text-sm font-medium text-[#1a3a2e]">254</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-[#fda400] text-[#fda400]" />
                        <span className="text-sm font-medium text-[#1a3a2e]">4.9</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-[28px] font-bold text-[#1a3a2e] m-0 mb-3">{activity.title}</h1>

                {/* Guide Name */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-base text-[#1a3a2e]">First Name</span>
                    <Check className="w-4 h-4 text-[#4caf50]" />
                </div>

                {/* Description Boxes */}
                <div className="mb-6">
                    <div className="bg-[#f9f9f9] rounded-xl p-4 mb-3">
                        <p className="text-sm text-[#1a3a2e] m-0 leading-relaxed">{shortDescription}</p>
                    </div>
                    <div className="bg-[#f9f9f9] rounded-xl p-4 relative">
                        <p className="text-sm text-[#1a3a2e] m-0 leading-relaxed">
                            {showFullDescription ? fullDescription : fullDescription.substring(0, 80) + '...'}
                        </p>
                        <button
                            className="absolute bottom-4 right-4 text-sm text-[#1a3a2e] font-medium underline bg-transparent border-none cursor-pointer"
                            onClick={() => setShowFullDescription(!showFullDescription)}
                        >
                            {showFullDescription ? 'view less' : 'view more'}
                        </button>
                    </div>
                </div>

                {/* Package Options */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-[#1a3a2e] m-0 mb-3">Package Options</h2>
                    <div className="flex flex-col gap-3">
                        {packages.map((pkg) => (
                            <button
                                key={pkg.id}
                                onClick={() => handlePackageSelect(pkg.id)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                    selectedPackage === pkg.id
                                        ? 'border-[#4caf50] bg-[#f1f8e9]'
                                        : 'border-[#e0e0e0] bg-white hover:border-[#4caf50]'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-medium text-[#1a3a2e]">{pkg.label}</span>
                                    <span className="text-lg font-bold text-[#1a3a2e]">${pkg.price}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* What's Included */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-[#1a3a2e] m-0 mb-3">What's included</h2>
                    <ul className="list-none p-0 m-0 flex flex-col gap-3">
                        {whatsIncluded.map((item, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm text-[#1a3a2e]">
                                <Check className="w-5 h-5 text-[#4caf50] flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                        {whatsNotIncluded.map((item, index) => (
                            <li key={`not-${index}`} className="flex items-center gap-3 text-sm text-[#1a3a2e]">
                                <X className="w-5 h-5 text-[#f02327] flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Logistics */}
                <div className="mb-6">
                    <div className="bg-[#f2f2f7] rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-[#666] flex-shrink-0" />
                            <span className="text-sm text-[#1a3a2e]">Blue Lagoon Snorkeling, B. Kendhoo</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-[#666] flex-shrink-0" />
                            <span className="text-sm text-[#1a3a2e]">08:15 - 20:10</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-[#666] flex-shrink-0" />
                            <span className="text-sm text-[#1a3a2e]">Free cancellation (24 hour notice)</span>
                        </div>
                    </div>
                </div>

                {/* Similar Activities */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-[#1a3a2e] m-0 mb-3">Similar Activities</h2>
                    <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {similarActivities.map((exp: Experience) => (
                            <Link
                                key={exp.id}
                                to="/dev/activities/$id"
                                params={{ id: exp.id }}
                                className="flex-shrink-0 w-[200px] bg-white rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md no-underline text-inherit"
                            >
                                <div className="relative w-full h-32 overflow-hidden">
                                    {exp.images && exp.images.length > 0 ? (
                                        <img
                                            src={exp.images[0]}
                                            alt={exp.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#e0f2f1] to-[#b2dfdb] flex items-center justify-center text-4xl">
                                            <span>🏝️</span>
                                        </div>
                                    )}
                                    <button
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border-none flex items-center justify-center cursor-pointer transition-all"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                    >
                                        <Heart className="w-4 h-4 text-[#666]" />
                                    </button>
                                </div>
                                <div className="p-3">
                                    <h3 className="text-sm font-semibold text-[#1a3a2e] mb-2 line-clamp-2 leading-tight">{exp.title}</h3>
                                    <div className="flex gap-1.5 mb-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium text-white bg-[#97C447]">{exp.island}</span>
                                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium text-white bg-[#4A90E2]">{exp.category}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-bold text-[#1a3a2e]">${parseFloat(exp.price).toFixed(0)}</span>
                                        {exp.rating && (
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-3 h-3 ${star <= parseFloat(exp.rating || '0')
                                                                ? 'text-[#fda400] fill-[#fda400]'
                                                                : 'text-[#ddd] fill-none'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Ratings & Reviews */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-semibold text-[#1a3a2e] m-0">Ratings & Reviews</h2>
                        <ChevronRight className="w-5 h-5 text-[#666]" />
                    </div>
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-bold text-[#1a3a2e]">4.9</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className="w-5 h-5 text-[#fda400] fill-[#fda400]"
                                    />
                                ))}
                            </div>
                        </div>
                        <span className="text-sm text-[#666]">154 Reviews</span>
                    </div>

                    {reviewsLoading ? (
                        <div className="text-center py-5 px-5 text-[#666] text-sm">Loading reviews...</div>
                    ) : reviews.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {reviews.slice(0, 2).map((review: Review) => (
                                <div key={review.id} className="bg-white rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a5d6a7] to-[#c5e1a5] flex items-center justify-center font-semibold text-[#1a3a2e] text-sm">
                                            {review.userName ? review.userName[0].toUpperCase() : 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-[#1a3a2e]">{review.userName || 'Username'}</div>
                                            <div className="text-xs text-[#666]">{formatReviewDate(review.createdAt)}</div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= parseFloat(review.rating || '0')
                                                            ? 'text-[#fda400] fill-[#fda400]'
                                                            : 'text-[#ddd] fill-none'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#1a3a2e] leading-relaxed m-0 mb-3">{review.comment}</p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="w-20 h-20 rounded-lg bg-[#f2f2f7] flex items-center justify-center">
                                                <Play className="w-6 h-6 text-[#666]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5 px-5 text-[#666] text-sm">No reviews yet. Be the first to review!</div>
                    )}
                </div>
            </div>

            {/* Footer with Price and Book Button */}
            <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center px-5 py-4 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10">
                <div>
                    <span className="text-3xl font-bold text-[#1a3a2e]">${packagePrice}</span>
                </div>
                <button
                    className="px-10 py-4 bg-[#73c6f0] border-none text-white text-base font-semibold cursor-pointer transition-all shadow-[0_2px_8px_rgba(115,198,240,0.3)] hover:bg-[#5ab8e0] active:scale-95 relative"
                    onClick={() => setShowBookModal(true)}
                    style={{
                        borderRadius: '30px 30px 30px 30px',
                        clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
                    }}
                >
                    Book
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
                price={packagePrice.toString()}
                activityTitle={activity.title}
            />
        </div>
    )
}
