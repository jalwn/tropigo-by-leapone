import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/figma/')({
  component: FigmaHome,
})

function FigmaHome() {
  return (
    <div className="bg-white min-h-screen max-w-[402px] mx-auto p-5 pb-32">
      <h1 className="text-2xl font-bold mb-6">TropiGo Mobile</h1>
      <p className="text-gray mb-6">Explore the Maldives with our mobile-first experience</p>

      <div className="flex flex-col gap-4">
        <Link
          to="/figma/explore"
          className="bg-primary p-4 rounded-xl font-semibold text-center"
        >
          Start Exploring →
        </Link>
        <Link
          to="/figma/map"
          className="bg-gray-6 p-4 rounded-xl font-semibold text-center"
        >
          View Map
        </Link>
        <Link
          to="/figma/profile"
          className="bg-gray-6 p-4 rounded-xl font-semibold text-center"
        >
          My Profile
        </Link>
      </div>
    </div>
  )
}
