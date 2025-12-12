import { createFileRoute } from '@tanstack/react-router'
import MapPage from '../../components/dev/MapPage'

export const Route = createFileRoute('/dev/map')({
    component: MapPage,
})
