import { createFileRoute } from '@tanstack/react-router'
import MaldyPage from '../../components/dev/MaldyPage'

export const Route = createFileRoute('/dev/maldy')({
    component: MaldyPage,
})
