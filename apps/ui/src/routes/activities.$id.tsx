import { createFileRoute } from '@tanstack/react-router'
import ActivityDetailPage from '@/pages/ActivityDetailPage'

export const Route = createFileRoute('/activities/$id')({
  component: ActivityDetailPage,
})

