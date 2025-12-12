import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/figma/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="bg-white min-h-screen max-w-[402px] mx-auto p-5 pb-32">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p className="text-gray">Coming soon - User profile and settings</p>
    </div>
  )
}
