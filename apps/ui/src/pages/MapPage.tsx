import { useEffect, useMemo, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Circle, MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Landmark } from '@tropigo/types'
import { fetchLandmarks, fetchOSRMRoute } from '@/lib/api'

const FALLBACK_POSITION = { lat: 4.175, lng: 73.509 } // Male, Maldives

// Pin-shaped marker for landmarks
const createPin = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      position: relative;
      width: 0;
      height: 0;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: -13px;
        width: 26px;
        height: 26px;
        border-radius: 50% 50% 50% 0;
        background: ${color};
        transform: rotate(-45deg);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          transform: rotate(45deg);
          display: block;
        "></span>
      </div>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  })

// Circle marker for user location (different style)
const createUserIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #0ea5e9;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: white;
        display: block;
      "></span>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  })

const pinIcons: Record<string, L.DivIcon> = {
  historic: createPin('#f97316'),
  cultural: createPin('#6366f1'),
  viewpoint: createPin('#0ea5e9'),
  special: createPin('#d946ef'),
  default: createPin('#22c55e'),
}

const userIcon = createUserIcon()

function RecenterMap({ position, zoom }: { position: { lat: number; lng: number }; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView([position.lat, position.lng], zoom, {
      animate: true,
      duration: 0.5,
    })
  }, [map, position, zoom])

  return null
}

function FitRouteBounds({ routeLine }: { routeLine: [number, number][] | null }) {
  const map = useMap()

  useEffect(() => {
    if (!routeLine || routeLine.length === 0) return

    // Create bounds from route coordinates
    const bounds = L.latLngBounds(routeLine)
    
    // Fit bounds with padding and animation
    map.fitBounds(bounds, {
      padding: [80, 80], // Add padding so route isn't at the edge
      animate: true,
      duration: 0.8,
      maxZoom: 16, // Don't zoom in too much
    })
  }, [map, routeLine])

  return null
}

function AnimatedPolyline({ positions, pathOptions }: { positions: [number, number][]; pathOptions: L.PolylineOptions }) {
  const animationFrameRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
  const pathRef = useRef<SVGPathElement | null>(null)

  useEffect(() => {
    const findAndAnimate = () => {
      // Find the SVG path element
      const svg = document.querySelector('.leaflet-overlay-pane svg')
      if (!svg) {
        setTimeout(findAndAnimate, 50)
        return
      }

      const paths = Array.from(svg.querySelectorAll('path')) as SVGPathElement[]
      
      // Find the path with our dark green color and dash array (the animated one)
      // We look for the path that has both the color and dashArray set
      const routePath = paths.find((path) => {
        const computedStyle = window.getComputedStyle(path)
        const hasDashArray = computedStyle.strokeDasharray !== 'none' && computedStyle.strokeDasharray.includes('20')
        const hasColor = computedStyle.stroke === 'rgb(22, 101, 52)' || 
                         path.getAttribute('stroke') === '#166534' ||
                         computedStyle.stroke.includes('rgb(22, 101, 52)')
        return hasDashArray && hasColor && computedStyle.strokeWidth === '6px'
      })

      if (!routePath) {
        setTimeout(findAndAnimate, 50)
        return
      }

      pathRef.current = routePath

      // Start animation (slower speed)
      const animate = () => {
        if (!pathRef.current) return
        
        offsetRef.current -= 0.1  // Slower: was -1, now -0.3
        if (offsetRef.current <= -30) {
          offsetRef.current = 0
        }
        pathRef.current.style.strokeDashoffset = `${offsetRef.current}px`
        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start finding and animating after a short delay
    const timeoutId = setTimeout(findAndAnimate, 300)

    return () => {
      clearTimeout(timeoutId)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [positions])

  return <Polyline positions={positions} pathOptions={pathOptions} />
}

export default function MapPage() {
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [selected, setSelected] = useState<Landmark | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showDirections, setShowDirections] = useState<Landmark | null>(null)

  useEffect(() => {
    if (!navigator?.geolocation) {
      setTimeout(() => {
        setLocationError('Geolocation is not supported in this browser.')
      }, 0)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setLocationError(null)
      },
      (err) => {
        console.warn('Geolocation error', err)
        setLocationError('Unable to access your location. Showing nearby highlights in Male.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  const language = useMemo(() => {
    if (typeof navigator === 'undefined') return 'en'
    return navigator.language?.split('-')[0] || 'en'
  }, [])

  const searchPosition = currentPosition ?? FALLBACK_POSITION

  const { data: landmarks = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['landmarks', searchPosition.lat, searchPosition.lng, language],
    queryFn: () =>
      fetchLandmarks({
        lat: searchPosition.lat,
        lng: searchPosition.lng,
        radiusKm: 25,
        lang: language,
      }),
  })

  const activeCenter = selected
    ? { lat: Number(selected.latitude), lng: Number(selected.longitude) }
    : searchPosition

  // Zoom level: higher when a landmark is selected, default otherwise
  const activeZoom = selected ? 16 : 14

  // Function to toggle directions on the app's map
  const toggleDirections = (landmark: Landmark) => {
    if (showDirections?.id === landmark.id) {
      // Hide directions if already showing for this landmark
      setShowDirections(null)
    } else {
      // Show directions on the map
      setShowDirections(landmark)
      setSelected(landmark)
    }
  }

  // Fetch route from OSRM when directions are shown
  const origin = currentPosition || searchPosition
  const destination = showDirections
    ? { lat: Number(showDirections.latitude), lng: Number(showDirections.longitude) }
    : null

  const { data: routeLine } = useQuery({
    queryKey: ['osrm-route', origin.lat, origin.lng, destination?.lat, destination?.lng],
    queryFn: () => {
      if (!destination) return null
      return fetchOSRMRoute(origin, destination, 'walking')
    },
    enabled: !!showDirections && !!destination,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full-page Map */}
      <div className="absolute inset-0 w-full h-full z-0">
        <MapContainer
          center={[activeCenter.lat, activeCenter.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={true}
          scrollWheelZoom
          zoomAnimation={true}
          zoomSnap={1}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
          />

          {!showDirections && <RecenterMap position={activeCenter} zoom={activeZoom} />}
          
          {routeLine && <FitRouteBounds routeLine={routeLine} />}

          {currentPosition && (
            <>
              <Marker position={[currentPosition.lat, currentPosition.lng]} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
              <Circle
                center={[currentPosition.lat, currentPosition.lng]}
                radius={400}
                pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.08 }}
              />
            </>
          )}

          {/* Route line showing directions with animation */}
          {routeLine && (
            <>
              {/* Shadow/glow effect for the route */}
              <Polyline
                positions={routeLine}
                pathOptions={{
                  color: '#166534',
                  weight: 10,
                  opacity: 0.2,
                  dashArray: '20, 10',
                }}
              />
              <AnimatedPolyline
                positions={routeLine}
                pathOptions={{
                  color: '#166534',
                  weight: 6,
                  opacity: 0.9,
                  dashArray: '20, 10',
                }}
              />
            </>
          )}

          {landmarks.map((landmark) => {
            // Hide popup for destination when directions are active
            const isDestination = showDirections?.id === landmark.id
            
            return (
              <Marker
                key={landmark.id}
                position={[Number(landmark.latitude), Number(landmark.longitude)]}
                icon={pinIcons[landmark.category] || pinIcons.default}
                eventHandlers={{
                  click: () => setSelected(landmark),
                }}
              >
                {!isDestination && (
                  <Popup>
                    <div className="space-y-2 min-w-[180px]">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#1a3a2e]">{landmark.name}</p>
                        {landmark.distanceKm != null && (
                          <p className="text-xs text-gray-600">~{landmark.distanceKm.toFixed(1)} km away</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDirections(landmark)
                        }}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-1.5 ${
                          showDirections?.id === landmark.id
                            ? 'bg-[#1a3a2e] text-white hover:bg-[#2a4a3e]'
                            : 'bg-[#c5f274] text-[#1a3a2e] hover:bg-[#b5e264]'
                        }`}
                      >
                        <span>📍</span>
                        {showDirections?.id === landmark.id ? 'Hide Directions' : 'Show Directions'}
                      </button>
                    </div>
                  </Popup>
                )}
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Overlay: Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-5 pt-6 pb-4 flex items-center justify-between gap-3 bg-gradient-to-b from-white/95 via-white/90 to-transparent backdrop-blur-sm pointer-events-auto">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-600">Discover around you</p>
          <h1 className="text-2xl font-bold text-[#1a3a2e] leading-tight">Map & Landmarks</h1>
        </div>
        <button
          className="px-3 py-2 rounded-full text-sm font-semibold bg-[#c5f274] text-[#1a3a2e] shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => {
            if (navigator?.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setCurrentPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                  setLocationError(null)
                  refetch()
                },
                () => setLocationError('Unable to refresh your location.'),
                { enableHighAccuracy: true, timeout: 8000 },
              )
            }
          }}
        >
          Refresh GPS
        </button>
      </header>

      {/* Overlay: Status Message */}
      <div className="absolute top-20 left-0 right-0 z-40 px-5 pointer-events-auto">
        {locationError ? (
          <div className="p-3 rounded-xl bg-orange-50/95 text-orange-700 backdrop-blur-sm shadow-lg border border-orange-200">
            {locationError}
          </div>
        ) : null}
      </div>

      {/* Overlay: Legend */}
      <div className={`absolute ${locationError ? 'top-32' : 'top-20'} left-0 right-0 z-40 px-5 pointer-events-auto`}>
        <div className="p-3 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 flex items-center gap-3 flex-wrap text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-[#f97316]" /> Historic
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-[#6366f1]" /> Cultural
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-[#0ea5e9]" /> Viewpoint
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-[#d946ef]" /> Special
          </span>
        </div>
      </div>

      {/* Overlay: Done Button (shown when directions are active) */}
      {showDirections && (
        <section className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white/98 via-white/95 to-transparent backdrop-blur-md border-t border-gray-200 shadow-2xl pb-20 pointer-events-auto">
          <div className="px-5 pt-6 pb-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#1a3a2e]">{showDirections.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">Following route to destination</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDirections(null)
                  setSelected(null)
                }}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#1a3a2e] text-white hover:bg-[#2a4a3e] transition-colors shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Overlay: Landmarks Cards (Swipeable Bottom Carousel) - Hidden when directions are active */}
      {!showDirections && (
        <section className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white/98 via-white/95 to-transparent backdrop-blur-md border-t border-gray-200 shadow-2xl pb-20 pointer-events-auto">
          <div className="px-5 pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#1a3a2e]">Nearby highlights</h2>
              {isLoading || isFetching ? <span className="text-xs text-gray-500">Refreshing...</span> : null}
            </div>

            {/* Horizontal Swipeable Cards */}
            <div className="overflow-x-auto pb-2 -mx-5 px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
              <div className="flex gap-4">
                {landmarks.map((landmark) => (
                  <button
                    key={landmark.id}
                    onClick={() => setSelected(landmark)}
                    className={`flex-shrink-0 w-[280px] text-left p-4 rounded-2xl border transition-all snap-start ${
                      selected?.id === landmark.id
                        ? 'border-[#c5f274] bg-[#f9ffe8] shadow-lg scale-105'
                        : 'border-gray-200 bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                          {landmark.category}
                        </p>
                        {landmark.distanceKm != null && (
                          <span className="text-xs font-semibold text-[#1a3a2e] bg-[#c5f274] px-2 py-1 rounded-full whitespace-nowrap">
                            {landmark.distanceKm.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#1a3a2e] leading-tight">{landmark.name}</h3>
                      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{landmark.description}</p>
                    </div>
                  </button>
                ))}

                {landmarks.length === 0 && !isLoading && (
                  <div className="flex-shrink-0 w-full p-6 rounded-2xl border border-dashed border-gray-300 text-sm text-gray-600 bg-white/95 backdrop-blur-sm text-center">
                    No landmarks found nearby yet. Try refreshing your location.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

