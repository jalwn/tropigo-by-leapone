import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => (
    <>
        <div className="p-2 flex gap-2">
            <Link to="/" className="[&.active]:font-bold">
                Home
            </Link>{' '}
            <Link to="/experiences" className="[&.active]:font-bold">
                Experiences
            </Link>{' '}
            <Link to="/maldy" className="[&.active]:font-bold">
                Maldy AI
            </Link>{' '}
            <Link to="/experiences/new" className="[&.active]:font-bold">
                Add Experience
            </Link>{' '}
            <Link to="/about" className="[&.active]:font-bold">
                About
            </Link>
        </div>
        <hr />
        <Outlet />
        <TanStackRouterDevtools />
    </>
)

export const Route = createRootRoute({ component: RootLayout })