import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/basic/_layout')({
  component: BasicLayout,
})

function BasicLayout() {
  return (
    <>
      {/* Desktop-style Navigation */}
      <div className="p-2 flex gap-2">
        <Link to="/basic" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/basic/experiences" className="[&.active]:font-bold">
          Experiences
        </Link>{' '}
        <Link to="/basic/maldy" className="[&.active]:font-bold">
          Maldy AI
        </Link>{' '}
        <Link to="/basic/experiences/new" className="[&.active]:font-bold">
          Add Experience
        </Link>{' '}
        <Link to="/basic/about" className="[&.active]:font-bold">
          About
        </Link>
      </div>
      <hr />
      <Outlet />
    </>
  )
}
