import { createFileRoute } from '@tanstack/react-router'
import ActivityDetailPage from '@/components/dev/ActivityDetailPage'

export const Route = createFileRoute('/dev/activities/$id')({
    component: ActivityDetailPage,
})
