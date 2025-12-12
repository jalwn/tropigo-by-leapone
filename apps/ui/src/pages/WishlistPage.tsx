import { useQuery } from '@tanstack/react-query'
import { fetchWishlist } from '@/lib/api'

export default function WishlistPage() {
  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => fetchWishlist(),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-5 pb-[100px] bg-[#f5f5f5]">
        <div className="text-center py-10 px-5 text-[#666] text-base">Loading wishlist...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-5 pb-[100px] bg-[#f5f5f5]">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#e0e0e0]">
        <div className="w-14 h-14 bg-gradient-to-br from-[#a5d6a7] to-[#66bb6a] rounded-xl flex items-center justify-center text-[28px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          ❤️
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#1a3a2e] m-0 mb-1">My Wishlist</h1>
          <p className="text-sm text-[#666] m-0">{wishlistItems.length} experiences saved</p>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-5 py-10">
          <div className="w-[120px] h-[120px] rounded-full border-2 border-[#e0e0e0] bg-[#fafafa] flex items-center justify-center mb-6">
            <span className="text-[64px] text-[#666]">♡</span>
          </div>
          <h2 className="text-xl font-semibold text-[#1a3a2e] m-0 mb-3">No saved experiences yet.</h2>
          <p className="text-sm text-[#666] leading-relaxed max-w-[280px] m-0">
            Start exploring and tap the heart icon to save your favorite experiences for later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* TODO: Display wishlist items */}
        </div>
      )}
    </div>
  )
}
