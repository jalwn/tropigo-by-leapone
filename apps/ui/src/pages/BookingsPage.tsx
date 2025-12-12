import { useQuery } from '@tanstack/react-query'
import { fetchBookings } from '@/lib/api'
import type { Booking } from '@tropigo/types'

export default function BookingsPage() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => fetchBookings(),
  })

  const upcomingBookings = bookings.filter(
    b => b.status === 'confirmed' || b.status === 'pending'
  )
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled')

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(0)}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-5 pb-[100px] bg-[#f5f5f5]">
        <div className="text-center py-10 px-5 text-[#666] text-base">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-5 pb-[100px] bg-[#f5f5f5]">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-[#ffeb3b] rounded-xl flex items-center justify-center text-[28px] shadow-[0_2px_8px_rgba(255,235,59,0.3)]">
          🎫
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#1a3a2e] m-0 mb-1">My Bookings</h1>
          <p className="text-sm text-[#666] m-0">{bookings.length} bookings total</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {upcomingBookings.length > 0 && (
          <div className="flex flex-col gap-4">
            {upcomingBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#e0e0e0]">
                <h3 className="text-xl font-semibold text-[#1a3a2e] m-0 mb-4">Adventure</h3>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-3 text-[#666] text-sm">
                    <span className="text-lg">📅</span>
                    <span>{formatDate(booking.bookingDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#666] text-sm">
                    <span className="text-lg">👥</span>
                    <span>{booking.numberOfGuests} guests</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#e0e0e0]">
                  <span className="text-[#666] text-sm">Total</span>
                  <span className="text-xl font-semibold text-[#1a3a2e]">{formatPrice(booking.totalPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {pastBookings.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-[#1a3a2e] mb-2">Past ({pastBookings.length})</h2>
            {pastBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#e0e0e0]">
                <div className="relative w-full h-[180px] bg-gradient-to-br from-[#4fc3f7] to-[#29b6f6] flex items-center justify-center">
                  <div className="text-[64px]">🏝️</div>
                  <span className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-medium ${
                    booking.status === 'completed' 
                      ? 'bg-[#4caf50] text-white' 
                      : 'bg-black/60 text-white'
                  }`}>
                    {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-[#1a3a2e] m-0 mb-4">Uninhabited Island Day Trip</h3>
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3 text-[#666] text-sm">
                      <span className="text-lg">📅</span>
                      <span>{formatDate(booking.bookingDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#666] text-sm">
                      <span className="text-lg">👥</span>
                      <span>{booking.numberOfGuests} guests</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-[#e0e0e0]">
                    <span className="text-[#666] text-sm">Total</span>
                    <span className="text-xl font-semibold text-[#1a3a2e]">{formatPrice(booking.totalPrice)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
