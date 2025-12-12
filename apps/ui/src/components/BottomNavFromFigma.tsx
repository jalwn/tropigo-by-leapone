import { Link, useLocation } from '@tanstack/react-router'

export function BottomNavFromFigma() {
  return (
    <div
      className="fixed bottom-0 left-0 w-full backdrop-blur-[5px] flex flex-col items-center px-12 py-2.5 h-[113px]"
      style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 65.865%, #000000 100%)' }}
    >
      <div className="bg-white/25 flex gap-0.5 items-start overflow-hidden px-1 py-0.5 rounded-2xl shadow-[0px_14px_40.5px_0px_rgba(0,0,0,0.3)] w-full max-w-[309px]">
        <NavItem to="/figma/explore" label="Explore" />
        <NavItem to="/maldy" label="Maldy" />
        <NavItem to="/figma/map" label="Map" />
        <NavItem to="/figma/profile" label="Profile" />
      </div>
    </div>
  )
}

function NavItem({ to, label }: { to: string; label: string }) {
  const location = useLocation()
  const active = location.pathname === to

  return (
    <Link
      to={to}
      className={`flex items-center justify-center overflow-hidden px-5 py-2 rounded-2xl h-[53px] w-[73px] ${active ? 'bg-[rgba(72,105,12,0.5)]' : ''
        }`}
    >
      <div className="flex flex-col gap-0.5 items-center justify-center">
        <div
          className={`h-7 rounded-full w-7.5 ${active ? 'bg-primary-light' : 'bg-white'
            }`}
        ></div>
        <p
          className={`font-normal text-[11px] text-center tracking-[0.06px] ${active ? 'text-primary-light' : 'text-white'
            }`}
        >
          {label}
        </p>
      </div>
    </Link>
  )
}
