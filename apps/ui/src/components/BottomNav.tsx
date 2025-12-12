import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Bot, Map, User } from 'lucide-react'

export default function BottomNav() {
    const router = useRouterState()
    const currentPath = router.location.pathname

    const navItems = [
        { path: '/dev/explore', icon: Home, label: 'Explore' },
        { path: '/dev/maldy', icon: Bot, label: 'Maldy' },
        { path: '/dev/map', icon: Map, label: 'Map' },
        { path: '/dev/profile', icon: User, label: 'Profile' },
    ]

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-5 pt-3 pointer-events-none bg-gradient-to-t from-[#212121] to-transparent"
        // style={{ backdropFilter: 'blur(10px) blur(0px)' }}
        >
            <div className="pointer-events-auto flex items-center justify-between w-[340px] h-[70px] rounded-full px-6 py-3 bg-white/25 shadow-[0px_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-[12px]">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path
                    const circleBg = isActive ? '#C5F274' : '#FFFFFF'
                    const textColor = isActive ? '#C5F274' : '#FFFFFF'

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="w-[73px] h-[53px] rounded-[30px] flex flex-col items-center justify-center"
                            style={{ color: textColor }}
                        >
                            <span
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: circleBg, aspectRatio: '1 / 1' }}
                            >
                                <item.icon size={18} color={isActive ? '#1A3A2E' : '#6B7280'} />
                            </span>
                            <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
