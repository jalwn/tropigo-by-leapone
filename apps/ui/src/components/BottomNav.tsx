import { Link, useRouterState } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useRef, useEffect, useState, useMemo, useCallback } from 'react'

// Icon Components
const ExploreIcon = ({ isActive }: { isActive: boolean }) => {
    const fillColor = isActive ? '#D4FF87' : '#404040'
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-300 ease-in-out">
            <path d="M12 24C8.8174 24 5.76516 22.7357 3.51472 20.4853C1.26428 18.2348 0 15.1826 0 12C0 8.8174 1.26428 5.76516 3.51472 3.51472C5.76516 1.26428 8.8174 0 12 0C15.1826 0 18.2348 1.26428 20.4853 3.51472C22.7357 5.76516 24 8.8174 24 12C24 15.1826 22.7357 18.2348 20.4853 20.4853C18.2348 22.7357 15.1826 24 12 24ZM9.456 9.456L5.208 18.792L14.544 14.544L18.792 5.208L9.456 9.456ZM12 13.2C11.6817 13.2 11.3765 13.0736 11.1515 12.8485C10.9264 12.6235 10.8 12.3183 10.8 12C10.8 11.6817 10.9264 11.3765 11.1515 11.1515C11.3765 10.9264 11.6817 10.8 12 10.8C12.3183 10.8 12.6235 10.9264 12.8485 11.1515C13.0736 11.3765 13.2 11.6817 13.2 12C13.2 12.3183 13.0736 12.6235 12.8485 12.8485C12.6235 13.0736 12.3183 13.2 12 13.2Z" fill={fillColor} className="transition-colors duration-300 ease-in-out"/>
        </svg>
    )
}

const MaldyIcon = ({ isActive }: { isActive: boolean }) => {
    const fillColor = isActive ? '#D4FF87' : '#404040'
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-300 ease-in-out">
            <g clipPath="url(#clip0_468_1510)">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.130662 2.31858C0.61519 0.633574 2.30386 -0.352605 3.90254 0.117014C5.44784 0.571222 6.96965 1.24635 8.30566 2.15608C8.47578 1.8415 8.71069 1.55712 9.00723 1.32795C10.1378 0.454718 11.7359 0.700948 12.576 1.87638C13.4518 3.10234 14.2126 4.59626 14.526 6.16389C15.3757 5.2485 16.3355 4.42755 17.34 3.71858C18.7394 2.73117 20.6138 3.1003 21.5259 4.54358C22.4379 5.98757 22.0426 7.96059 20.6432 8.94827C20.0515 9.36587 19.5525 9.78102 19.1354 10.1873C19.9032 10.7231 20.3632 11.6774 20.2494 12.6983C20.0947 14.0816 18.9419 15.0917 17.6259 15.042C18.1946 16.0122 19.4656 17.08 21.851 17.7811C23.4496 18.251 24.3526 19.9974 23.8682 21.6826C23.3835 23.3677 21.695 24.3525 20.0963 23.8826C18.471 23.4048 16.8714 22.684 15.4869 21.7014C15.3282 21.9502 15.1259 22.1755 14.8822 22.3638C13.7517 23.237 12.1535 22.9923 11.3135 21.817C10.502 20.6811 9.78982 19.3146 9.44003 17.8733C8.59846 18.7744 7.65038 19.583 6.65878 20.2826C5.25931 21.2702 3.38509 20.8997 2.47285 19.456C1.56116 18.0122 1.95638 16.0406 3.35566 15.0529C4.02058 14.5837 4.56878 14.1163 5.01504 13.6623C4.09387 13.1731 3.51424 12.1263 3.64003 10.9951C3.79067 9.64466 4.89339 8.64926 6.16973 8.64827C5.52432 7.7671 4.28118 6.84718 2.14786 6.22014C0.549442 5.75006 -0.353435 4.00349 0.130662 2.31858ZM12.9291 7.16546C12.6887 6.14669 11.2398 6.14669 10.9994 7.16546L10.401 9.69982C10.3146 10.0651 10.0288 10.3509 9.66347 10.4373L7.1291 11.0358C6.11034 11.2761 6.11034 12.725 7.1291 12.9655L9.66347 13.5639C10.0287 13.6504 10.3147 13.936 10.401 14.3014L10.9994 16.8358C11.2401 17.8541 12.6886 17.8542 12.9291 16.8358L13.5275 14.3014C13.6139 13.9359 13.8996 13.6503 14.265 13.5639L16.801 12.9655C17.8181 12.7243 17.8179 11.277 16.801 11.0358L14.265 10.4373C13.8997 10.351 13.614 10.0651 13.5275 9.69982L12.9291 7.16546Z" fill={fillColor} className="transition-colors duration-300 ease-in-out"/>
            </g>
            <defs>
                <clipPath id="clip0_468_1510">
                    <rect width="24" height="24" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    )
}

const MapIcon = ({ isActive }: { isActive: boolean }) => {
    const fillColor = isActive ? '#D4FF87' : '#404040'
    const opacityFill = isActive ? '#D4FF87' : '#000000'
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-300 ease-in-out">
            <path d="M3 8.70988V16.8379C3 17.8809 3 18.4029 3.283 18.7959C3.566 19.1889 4.061 19.3539 5.051 19.6839L6.216 20.0719C7.583 20.5279 8.266 20.7559 8.955 20.6629L9 20.6569V6.65688C8.88735 6.67366 8.77383 6.68401 8.66 6.68788C8.12 6.70688 7.586 6.52788 6.519 6.17288C5.121 5.70688 4.422 5.47388 3.89 5.71088C3.70147 5.79476 3.53228 5.91664 3.393 6.06888C3 6.49988 3 7.23588 3 8.70988ZM21 15.2899V7.16288C21 6.11988 21 5.59788 20.717 5.20488C20.434 4.81188 19.939 4.64688 18.949 4.31688L17.784 3.92888C16.417 3.47288 15.734 3.24488 15.045 3.33788L15 3.34288V17.3429C15.1133 17.3262 15.2267 17.3159 15.34 17.3119C15.88 17.2929 16.414 17.4719 17.481 17.8269C18.879 18.2929 19.578 18.5259 20.11 18.2889C20.2985 18.205 20.4677 18.0831 20.607 17.9309C21 17.4999 21 16.7639 21 15.2899Z" fill={fillColor} className="transition-colors duration-300 ease-in-out"/>
            <path opacity="0.5" d="M9.247 6.61002C9.165 6.62802 9.08267 6.64368 9 6.65702V20.657C9.67 20.553 10.269 20.154 11.442 19.372L12.824 18.45C13.76 17.826 14.228 17.514 14.754 17.39C14.834 17.37 14.916 17.3544 15 17.343V3.34302C14.33 3.44602 13.731 3.84602 12.558 4.62702L11.176 5.54902C10.24 6.17302 9.772 6.48502 9.246 6.60902" fill={opacityFill} className="transition-colors duration-300 ease-in-out"/>
        </svg>
    )
}

const ProfileIcon = ({ isActive }: { isActive: boolean }) => {
    const fillColor = isActive ? '#D4FF87' : '#404040'
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-300 ease-in-out">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C13.3132 1.99999 14.6136 2.25865 15.8269 2.76119C17.0401 3.26373 18.1425 4.00033 19.0711 4.92891C19.9997 5.8575 20.7363 6.95989 21.2388 8.17315C21.7414 9.3864 22 10.6868 22 12C22 17.5228 17.5229 22 12 22C6.4772 22 2.00003 17.5228 2.00003 12C2.00003 6.47717 6.4772 2 12 2ZM13 13H11C8.52433 13 6.39887 14.4994 5.48214 16.6398C6.93264 18.6737 9.31145 20 12 20C14.6886 20 17.0674 18.6737 18.5179 16.6396C17.6012 14.4994 15.4757 13 13 13ZM12 5C10.3432 5 9.00002 6.34316 9.00002 8C9.00002 9.65684 10.3432 11 12 11C13.6569 11 15 9.65684 15 8C15 6.34316 13.6569 5 12 5Z" fill={fillColor} className="transition-colors duration-300 ease-in-out"/>
        </svg>
    )
}

export default function BottomNav() {
    const router = useRouterState()
    const currentPath = router.location.pathname
    const containerRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 76 })

    // Memoize navItems array to prevent recreation on every render
    const navItems = useMemo(() => [
        { path: '/dev/explore', icon: ExploreIcon, label: 'Explore' },
        { path: '/dev/maldy', icon: MaldyIcon, label: 'Maldy' },
        { path: '/dev/map', icon: MapIcon, label: 'Map' },
        { path: '/dev/profile', icon: ProfileIcon, label: 'Profile' },
    ], [])

    // Memoize active index calculation
    const activeIndex = useMemo(() => 
        navItems.findIndex(item => currentPath === item.path),
        [navItems, currentPath]
    )

    // Memoize indicator position update function
    const updateIndicatorPosition = useCallback(() => {
        if (activeIndex >= 0 && itemRefs.current[activeIndex] && containerRef.current) {
            const activeButton = itemRefs.current[activeIndex]
            const container = containerRef.current
            
            const buttonRect = activeButton.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()
            
            const left = buttonRect.left - containerRect.left
            const width = buttonRect.width
            
            setIndicatorStyle({ left, width })
        }
    }, [activeIndex])

    // Update indicator position based on active button
    useEffect(() => {
        updateIndicatorPosition()
        
        // Update on window resize
        window.addEventListener('resize', updateIndicatorPosition)
        
        return () => {
            window.removeEventListener('resize', updateIndicatorPosition)
        }
    }, [updateIndicatorPosition])

    // Memoize search click handler
    const handleSearchClick = useCallback(() => {
        // TODO: Implement search functionality
        console.log('Search clicked')
    }, [])

    // Check if we're on an activity page - hide BottomNav on activity pages
    const isActivityPage = useMemo(() => 
        currentPath.startsWith('/dev/activities/'),
        [currentPath]
    )

    // Don't render BottomNav on activity pages
    if (isActivityPage) {
        return null
    }

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center items-end gap-3 px-4 pb-5 pt-3 pointer-events-none bg-gradient-to-t from-[#212121] to-transparent"
        >
            {/* Main Navigation Items Container */}
            <div 
                ref={containerRef}
                className="pointer-events-auto relative flex items-center justify-center h-[62px] rounded-full px-2 py-3 bg-white/10 backdrop-blur-xl shadow-[0px_8px_32px_rgba(0,0,0,0.3)] border border-white/20"
            >
                {/* Sliding Active Background Indicator */}
                <div
                    className="absolute top-[6px] bottom-[6px] bg-[#0C5940] rounded-[60px]"
                    style={{
                        left: `${indicatorStyle.left}px`,
                        width: `${indicatorStyle.width}px`,
                        transition: 'left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }}
                />

                {navItems.map((item, index) => {
                    const isActive = currentPath === item.path
                    const textColor = isActive ? '#D4FF87' : '#404040'
                    const IconComponent = item.icon

                    return (
                        <Link
                            key={item.path}
                            ref={(el) => { itemRefs.current[index] = el }}
                            to={item.path}
                            className="relative z-10 flex flex-col items-center justify-center w-[76px] py-[6px] px-2 rounded-[60px] transition-colors duration-300 ease-in-out"
                            style={{ 
                                color: textColor,
                            }}
                        >
                            <span className="w-6 h-6 flex items-center justify-center transition-transform duration-300 ease-in-out">
                                <IconComponent isActive={isActive} />
                            </span>
                            <span className="text-[11px] font-medium leading-tight transition-colors duration-300 ease-in-out">{item.label}</span>
                        </Link>
                    )
                })}
            </div>

            {/* Separate Search Button */}
            <button
                onClick={handleSearchClick}
                className="pointer-events-auto h-[62px] w-[62px] rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl shadow-[0px_8px_32px_rgba(0,0,0,0.3)] border border-white/20 hover:bg-white/20 transition-all active:scale-95"
            >
                <Search size={20} color="#FFFFFF" strokeWidth={2} />
            </button>
        </nav>
    )
}
