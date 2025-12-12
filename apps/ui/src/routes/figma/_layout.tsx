import { createFileRoute, Outlet } from '@tanstack/react-router'
import { BottomNavFromFigma } from '../components/BottomNavFromFigma'

export const Route = createFileRoute('/figma/_layout')({
  component: FigmaLayout,
})

function FigmaLayout() {
  return (
    <>
      <Outlet />
      <BottomNavFromFigma />
    </>
  )
}
