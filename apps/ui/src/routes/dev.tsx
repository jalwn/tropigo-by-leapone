import { createFileRoute, Outlet } from '@tanstack/react-router'
import BottomNav from '@/components/BottomNav'
import { I18nProvider } from '@/lib/i18n/context'

export const Route = createFileRoute('/dev')({
    component: () => (
        <div className="min-h-screen bg-[#ffffff]">
            <I18nProvider>
                <Outlet />
                <BottomNav />
            </I18nProvider>
        </div>
    ),
})
