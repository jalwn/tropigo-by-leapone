import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Circle, MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Landmark } from '@tropigo/types'
import { fetchLandmarks } from '@/lib/api'

const FALLBACK_POSITION = { lat: 4.175, lng: 73.509 } // Male, Maldives

const createPin = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width: 26px;
      height: 26px;
      border-radius: 14px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 12px rgba(0,0,0,0.18);
      ">
        <span style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${color};
          display: block;
        "></span>
      </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  })

const pinIcons: Record<string, L.DivIcon> = {
  historic: createPin('#f97316'),
  cultural: createPin('#6366f1'),
  viewpoint: createPin('#0ea5e9'),
  special: createPin('#d946ef'),
  default: createPin('#22c55e'),
}

const userIcon = createPin('#0ea5e9')

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

  // Create route line coordinates (straight line from current position to destination)
  const routeLine = useMemo(() => {
    if (!showDirections) return null
    
    const origin = currentPosition || searchPosition
    const destination = {
      lat: Number(showDirections.latitude),
      lng: Number(showDirections.longitude),
    }
    
    return [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ] as [number, number][]
  }, [showDirections, currentPosition, searchPosition])

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
          zoomSnap={0.1}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          />

          <RecenterMap position={activeCenter} zoom={activeZoom} />

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

          {/* Route line showing directions */}
          {routeLine && (
            <Polyline
              positions={routeLine}
              pathOptions={{
                color: '#c5f274',
                weight: 5,
                opacity: 0.8,
                dashArray: '15, 10',
              }}
            />
          )}

          {landmarks.map((landmark) => (
            <Marker
              key={landmark.id}
              position={[Number(landmark.latitude), Number(landmark.longitude)]}
              icon={pinIcons[landmark.category] || pinIcons.default}
              eventHandlers={{
                click: () => setSelected(landmark),
              }}
            >
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
            </Marker>
          ))}
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
            <span className="inline-flex h-3 w-3 rounded-full bg-[#0ea5e9]" /> You
          </span>
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

      {/* Overlay: Landmarks Cards (Swipeable Bottom Carousel) */}
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
                    {showDirections?.id === landmark.id && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-xs text-[#c5f274] font-semibold flex items-center gap-1">
                          <span>📍</span>
                          Directions Active
                        </span>
                      </div>
                    )}
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
    </div>
  )
}

