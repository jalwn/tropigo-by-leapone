import { createFileRoute } from '@tanstack/react-router'
import ProfilePage from '../../components/dev/ProfilePage'

export const Route = createFileRoute('/dev/profile')({
    component: ProfilePage,
})
