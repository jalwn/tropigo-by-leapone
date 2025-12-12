import { createFileRoute, Outlet } from '@tanstack/react-router'
import BottomNav from '@/components/BottomNav'

export const Route = createFileRoute('/dev')({
    component: () => (
        <div className="min-h-screen bg-[#ffffff]">
            <Outlet />
            <BottomNav />
        </div>
    ),
})
