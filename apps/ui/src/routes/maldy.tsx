import { createFileRoute } from '@tanstack/react-router'
import MaldyPage from '@/pages/MaldyPage'

export const Route = createFileRoute('/maldy')({
  component: MaldyPage,
})

