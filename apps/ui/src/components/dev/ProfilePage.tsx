
export default function ProfilePage() {
    const user = {
        name: 'Sarah Johnson',
        memberSince: 'January 2024',
        email: 'sarah.j@email.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, USA',
        stats: {
            bookings: 2,
            wishlisted: 5,
            reviews: 3,
        },
    }

    return (
        <div className="min-h-screen px-4 py-5 pb-[100px] bg-[#f5f5f5]">
            <div className="text-center mb-8">
                <div className="mb-4">
                    <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-[#a5d6a7] to-[#c5e1a5] flex items-center justify-center text-5xl mx-auto shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                        👤
                    </div>
                </div>
                <h1 className="text-[28px] font-bold text-[#1a3a2e] m-0 mb-2">{user.name}</h1>
                <p className="text-sm text-[#666] m-0">Member since {user.memberSince}</p>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                        <div className="flex items-start gap-4 py-3">
                            <span className="text-xl w-8 flex-shrink-0">✉️</span>
                            <div className="flex flex-col gap-1 flex-1">
                                <span className="text-xs text-[#999]">Email</span>
                                <span className="text-sm text-[#1a3a2e] font-medium">{user.email}</span>
                            </div>
                        </div>
                        <div className="h-px bg-[#e0e0e0] my-1"></div>
                        <div className="flex items-start gap-4 py-3">
                            <span className="text-xl w-8 flex-shrink-0">📞</span>
                            <div className="flex flex-col gap-1 flex-1">
                                <span className="text-xs text-[#999]">Phone</span>
                                <span className="text-sm text-[#1a3a2e] font-medium">{user.phone}</span>
                            </div>
                        </div>
                        <div className="h-px bg-[#e0e0e0] my-1"></div>
                        <div className="flex items-start gap-4 py-3">
                            <span className="text-xl w-8 flex-shrink-0">📍</span>
                            <div className="flex flex-col gap-1 flex-1">
                                <span className="text-xs text-[#999]">Location</span>
                                <span className="text-sm text-[#1a3a2e] font-medium">{user.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-[#1a3a2e] m-0">Your Stats</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-[#f0f8e8] to-[#fff9e6] rounded-2xl p-5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                            <div className="text-[32px] font-bold text-[#1a3a2e] mb-2">{user.stats.bookings}</div>
                            <div className="text-xs text-[#666] font-medium">Bookings</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#f0f8e8] to-[#fff9e6] rounded-2xl p-5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                            <div className="text-[32px] font-bold text-[#1a3a2e] mb-2">{user.stats.wishlisted}</div>
                            <div className="text-xs text-[#666] font-medium">Wishlisted</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#f0f8e8] to-[#fff9e6] rounded-2xl p-5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                            <div className="text-[32px] font-bold text-[#1a3a2e] mb-2">{user.stats.reviews}</div>
                            <div className="text-xs text-[#666] font-medium">Reviews</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-[#1a3a2e] m-0">Setting</h2>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                        <button className="w-full flex justify-between items-center px-5 py-4 bg-white border-none text-left text-sm text-[#1a3a2e] cursor-pointer transition-colors border-b border-[#f0f0f0] hover:bg-[#f9f9f9]">
                            <span>Account Setting</span>
                            <span className="text-[#999] text-lg">›</span>
                        </button>
                        <button className="w-full flex justify-between items-center px-5 py-4 bg-white border-none text-left text-sm text-[#1a3a2e] cursor-pointer transition-colors border-b border-[#f0f0f0] hover:bg-[#f9f9f9]">
                            <span>Edit Profile</span>
                            <span className="text-[#999] text-lg">›</span>
                        </button>
                        <button className="w-full flex justify-between items-center px-5 py-4 bg-white border-none text-left text-sm text-[#d32f2f] cursor-pointer transition-colors hover:bg-[#ffebee]">
                            <span>Log Out</span>
                            <span className="text-[#999] text-lg">›</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
