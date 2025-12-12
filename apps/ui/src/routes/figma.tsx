import { createFileRoute, Outlet } from '@tanstack/react-router'
import { BottomNav } from '../components/BottomNav'

export const Route = createFileRoute('/figma')({
  component: FigmaLayout,
})

function FigmaLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}
