import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchExperiences } from '@/lib/api'
import { useI18n } from '@/lib/i18n/context'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import tropiLogo from '@/assets/tropi-logo.svg'

const CATEGORIES = [
  { id: 'all', emoji: '' },
  { id: 'island', emoji: '🏝️' },
  { id: 'diving', emoji: '🤿' },
  { id: 'boat-trip', emoji: '⛵' },
  { id: 'culture', emoji: '🎭' },
  { id: 'water-sport', emoji: '🏄' },
] as const

const getCategoryLabel = (category: string, t: ReturnType<typeof useI18n>['t']) => {
  const labels: Record<string, string> = {
    'island': t.categories.island,
    'diving': t.categories.diving,
    'boat-trip': t.categories.boatTrip,
    'culture': t.categories.culture,
    'water-sport': t.categories.waterSport,
  }
  return labels[category] || category
}

export default function ExplorePage() {
  const { t } = useI18n()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedNav, setSelectedNav] = useState('activities')
  const [showHeader, setShowHeader] = useState(true)
  const lastScrollY = useRef(0)

  const navButtons = [
    { id: 'my-booking', label: t.nav.myBookings },
    { id: 'bucketlist', label: t.nav.bucketlist },
    { id: 'events', label: t.nav.events },
    { id: 'esim', label: t.nav.esim },
    { id: 'activities', label: t.nav.activities },
    { id: 'all', label: t.nav.all },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const isScrollingDown = currentY > lastScrollY.current

      if (currentY < 10) {
        setShowHeader(true)
      } else if (isScrollingDown) {
        setShowHeader(false)
      } else {
        setShowHeader(true)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['experiences', selectedCategory],
    queryFn: () => fetchExperiences(selectedCategory === 'all' ? undefined : selectedCategory),
  })

  return (
    <div className="min-h-screen bg-[#ffffff] pb-20">
      {/* Header Section with Green Fade */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 w-full min-h-[70px] px-[21px] pt-[21px] pr-[50px] flex flex-col gap-3 transition-transform duration-300 ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{
          background: 'radial-gradient(141.86% 131.36% at 50% -28.81%, rgb(208 241 150) 0%, rgba(255, 255, 255, 0.5) 100%)',
          backdropFilter: 'blur(20px) blur(15px)',

        }}
      >
        <div className="flex flex-col items-center gap-3">
          {/* Logo and Language Switcher */}
          <div className="flex items-center justify-between w-full max-w-full">
            <div className="flex-1"></div>
            <div className="flex items-center justify-center flex-1">
              <img src={tropiLogo} alt="TROPI" className="h-10 w-auto" />
            </div>
            <div className="flex-1 flex justify-end">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-5 mt-[70px] max-w-full">
      <div className="flex gap-[16px] overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Navigation Buttons */}
          {navButtons.map(btn => (
            <button
              key={btn.id}
              className={`flex flex-col items-center gap-1 bg-transparent border-none text-[#1a3a2e] text-[11px] font-medium cursor-pointer p-0 transition-all hover:opacity-80 ${
                selectedNav === btn.id ? 'active' : ''
              }`}
              onClick={() => setSelectedNav(btn.id)}
            >
              <span 
                className={`w-[72px] h-[59px] rounded-full transition-all block ${
                  selectedNav === btn.id 
                    ? 'border-2 border-[#1a3a2e] bg-gray-200' 
                    : 'border-2 border-transparent bg-gray-200'
                }`}
              ></span>
              <span className="flex items-center justify-center mt-0 text-center text-[11px] font-medium">
                {btn.label}
              </span>
            </button>
          ))}
      </div>

        {/* Experience Section */}
        <div className="mb-5">
          {/* Experience Title */}
          <div className="w-full h-[25px] flex flex-row justify-start items-start gap-[10px] mb-2.5">
            <h2 className="text-2xl font-bold text-[#1a3a2e] mb-0 leading-[25px]">
              {t.explore.experience}
            </h2>
          </div>
          
          {/* Experience Cards - Horizontal Scroll */}
          <div className=" w-full h-[201px] flex flex-row justify-start items-center gap-[10px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {experiences.slice(0, 5).map((exp, index) => (
              <div
                key={exp.id || index}
                className="w-[113px] h-[201px] rounded-[20px] bg-[#F2F2F7] flex-shrink-0"
              />
            ))}
          </div>
        </div>

          {/* Categories */}
      <div className="flex gap-[16px] overflow-x-auto pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map(cat => {
          const label = cat.id === 'all' 
            ? t.categories.all 
            : cat.id === 'island' 
            ? t.categories.island
            : cat.id === 'diving'
            ? t.categories.diving
            : cat.id === 'boat-trip'
            ? t.categories.boatTrip
            : cat.id === 'culture'
            ? t.categories.culture
            : t.categories.waterSport
          
          return (
            <button
              key={cat.id}
              className={`flex items-center gap-1.5 px-[18px] py-2.5 border-none rounded-[20px] text-sm font-medium whitespace-nowrap cursor-pointer transition-all shadow-sm ${
                selectedCategory === cat.id
                  ? 'bg-[#c5f274] text-[#1a3a2e] font-semibold shadow-[0_2px_8px_rgba(208,241,150,0.3)]'
                  : 'bg-[#f2f2f7] text-[#333]'
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.emoji && <span className="text-base">{cat.emoji}</span>}
              {label}
            </button>
          )
        })}
        </div>

        {/* Activites Section */}
        <div className="mt-5">
          <h2 className="text-2xl font-bold text-[#1a3a2e] mb-4">{t.explore.discover}</h2>

          {/* Experience Cards Grid */}
          {isLoading ? (
            <div className="text-center py-10 px-5 text-[#666] text-base">{t.explore.loading}</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-5">
              {experiences.map(exp => (
                <Link 
                  key={exp.id} 
                  to="/activities/$id" 
                  params={{ id: exp.id }}
                  className="bg-white rounded-2xl overflow-hidden shadow-md transition-all cursor-pointer no-underline text-inherit block hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative w-full h-40 overflow-hidden">
                    {exp.images && exp.images.length > 0 ? (
                      <img 
                        src={exp.images[0]} 
                        alt={exp.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#e0f2f1] to-[#b2dfdb] flex items-center justify-center text-5xl">
                        <span>🏝️</span>
                      </div>
                    )}
                    <button 
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 border-none text-base cursor-pointer flex items-center justify-center transition-all shadow-sm p-0 hover:bg-white hover:scale-110"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        // TODO: Add to wishlist
                      }}
                      title={t.explore.addToWishlist}
                    >
                      ❤️
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="text-base font-semibold text-[#1a3a2e] mb-2 leading-tight line-clamp-2">{exp.title}</h3>
                    <div className="flex gap-1.5 mb-2.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-medium text-white bg-[#97C447]">{exp.island}</span>
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-medium text-white bg-[#4A90E2]">{getCategoryLabel(exp.category, t)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-[#1a3a2e]">${parseFloat(exp.price).toFixed(0)}</span>
                      {exp.rating && (
                        <div className="flex items-center gap-1 text-xs text-[#666] font-medium">
                          <span className="text-sm">⭐</span>
                          <span>{exp.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
