import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import BottomNav from '@/components/BottomNav'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-[#ffffff]">
      <Outlet />
      <BottomNav />
      {<TanStackRouterDevtools />}
    </div>
  ),
})

