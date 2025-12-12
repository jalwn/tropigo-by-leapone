import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    return (
        <div>
            <h1>TropiGo</h1>
            <p>Discover Local Experiences in the Maldives</p>

            <div>
                <h2>Explore</h2>
                <Link to="/experiences">
                    Browse All Experiences →
                </Link>
            </div>

            <div>
                <h2>About</h2>
                <p>
                    TropiGo connects tourists with authentic local experiences across the Maldives.
                    Skip the resort bubble and discover the real Maldives with local hosts.
                </p>
            </div>
        </div>
    )
}