import { createFileRoute } from '@tanstack/react-router'
import ExplorePage from '../../components/dev/ExplorePage'

export const Route = createFileRoute('/dev/explore')({
    component: ExplorePage,
})
