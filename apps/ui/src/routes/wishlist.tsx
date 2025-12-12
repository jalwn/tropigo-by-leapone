import { createFileRoute } from '@tanstack/react-router'
import WishlistPage from '@/pages/WishlistPage'

export const Route = createFileRoute('/wishlist')({
  component: WishlistPage,
})

