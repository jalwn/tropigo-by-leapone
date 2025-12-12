// Explore Page - Mobile-First Discovery Feed
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/figma/explore')({
  component: ExplorePage,
})

// Experience images
const experienceImages = {
  immersive: '/images/experience-immersive.png',
  naifaru: '/images/experience-naifaru.png',
  feevah: '/images/experience-feevah.png',
}

// Activity images
const activityImages = {
  shark: '/images/activity-shark.png',
  bio: '/images/activity-bio.png',
  dream1: '/images/activity-dream-1.png',
  dream2: '/images/activity-dream-2.png',
}

function ExplorePage() {
  return (
    <div className="bg-white min-h-screen max-w-[402px] mx-auto relative overflow-hidden">
      {/* Header with Gradient */}
      <div
        className="backdrop-blur-[10px] flex flex-col gap-3 items-center px-5 pt-12 pb-0"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% -34px, rgba(195, 240, 115, 1) 0%, rgba(225, 248, 185, 0.75) 50%, rgba(255, 255, 255, 0.5) 100%)`
        }}
      >
        {/* Logo */}
        <div className="flex gap-px items-center font-logo">
          <p className="text-[56.38px] leading-[67.982px] tracking-[2.1561px]">TR</p>
          <div className="w-10 h-10 bg-primary rounded-full"></div>
          <p className="text-[56.38px] leading-[67.982px] tracking-[2.1561px]">PI</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-7 px-5 pt-0 mt-6">
        {/* Category Tabs */}
        <div>
          <div className="flex gap-4 items-center overflow-x-auto pb-2">
            <CategoryTab label="Discover" active />
            <CategoryTab label="Activities" />
            <CategoryTab label="Discover" />
            <CategoryTab label="Discover" />
            <CategoryTab label="All" />
          </div>

          {/* Experience Section */}
          <div className="mt-2 flex gap-1 items-center">
            <h2 className="text-[20px] font-semibold leading-[25px] tracking-[-0.45px]">
              Experience
            </h2>
            <span className="text-gray text-[17px]">›</span>
          </div>

          {/* Experience Cards - Horizontal Scroll */}
          <div className="flex gap-2.5 overflow-x-auto mt-3 pb-2">
            <ExperienceCard location="B.Fehendhoo" image={experienceImages.immersive} immersive />
            <ExperienceCard location="Lh. Naifaru" image={experienceImages.naifaru} />
            <ExperienceCard location="Sh. Feevah" image={experienceImages.feevah} />
            <ExperienceCard location="B.Fehendhoo" image={experienceImages.immersive} />
          </div>
        </div>

        {/* Where to Section */}
        <div>
          <div className="flex gap-1 items-center">
            <h2 className="text-[20px] font-semibold leading-[25px] tracking-[-0.45px]">
              Where to
            </h2>
            <span className="text-gray text-[17px]">›</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto mt-3 pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-6 h-[79px] rounded-xl shrink-0 w-[113px]"></div>
            ))}
          </div>
        </div>

        {/* Activities Section */}
        <div className="pb-32">
          <div className="flex gap-1 items-center">
            <h2 className="text-[20px] font-semibold leading-[25px] tracking-[-0.45px]">
              Activities
            </h2>
            <span className="text-gray text-[17px]">›</span>
          </div>

          {/* Activity Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <ActivityCard
              title="Exploring Baa Atoll: Shark Dive"
              price={95}
              rating={2.5}
              tags={['Baa Atoll', 'Scuba Dive']}
              image={activityImages.shark}
              liked
            />
            <ActivityCard
              title="Vaadhoo Tour: Bioluminescent Shores"
              price={65}
              rating={4.2}
              tags={['Vaadhoo Island', 'Kayaking']}
              image={activityImages.bio}
            />
            <ActivityCard
              title="Exploring Baa Atoll: Dream Dive"
              price={95}
              rating={2.5}
              tags={['Baa Atoll', 'Scuba Dive']}
              image={activityImages.dream1}
            />
            <ActivityCard
              title="Exploring Baa Atoll: Dream Dive"
              price={95}
              rating={2.5}
              tags={['Baa Atoll', 'Scuba Dive']}
              image={activityImages.dream2}
            />
            <ActivityCard
              title="Exploring Baa Atoll: Dream Dive"
              price={95}
              rating={2.5}
              tags={['Baa Atoll', 'Scuba Dive']}
              image={activityImages.dream1}
            />
            <ActivityCard
              title="Exploring Baa Atoll: Dream Dive"
              price={95}
              rating={2.5}
              tags={['Baa Atoll', 'Scuba Dive']}
              image={activityImages.dream2}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Category Tab Component
function CategoryTab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="flex flex-col gap-1 items-center justify-center shrink-0">
      <div className="bg-gray-6 h-[59px] rounded-full w-[72px]"></div>
      <p className={`text-[11px] font-semibold leading-[13px] tracking-[0.06px] ${active ? 'text-black' : 'text-tertiary'}`}>
        {label}
      </p>
    </div>
  )
}

// Experience Card Component
function ExperienceCard({ location, image, immersive = false }: { location: string; image: string; immersive?: boolean }) {
  return (
    <div className="bg-gray-6 h-[201px] overflow-hidden relative rounded-xl shrink-0 w-[113px]">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2.5">
        <img
          src={image}
          alt={location}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Location Tag */}
      <div
        className="absolute bottom-0 left-0 w-full backdrop-blur-[25px] flex flex-col items-center p-1.5"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.75))' }}
      >
        <div className="flex gap-0.5 items-center justify-center mix-blend-luminosity">
          <span className="text-[11px] text-white">📍</span>
          <p className="font-normal text-[11px] text-white tracking-[0.06px]">
            {location}
          </p>
        </div>
      </div>

      {/* Immersive Badge */}
      {immersive && (
        <div className="absolute left-1/2 top-2 -translate-x-1/2 backdrop-blur-[10px] bg-black/20 flex gap-0.5 items-center justify-center px-1.5 py-0.5 rounded-full shadow-[0px_4px_24px_0px_rgba(0,0,0,0.15)]">
          <span className="text-[14px]">👁️</span>
          <p className="font-semibold text-[11px] text-white tracking-[0.06px]">
            Immersive
          </p>
        </div>
      )}
    </div>
  )
}

// Activity Card Component
function ActivityCard({
  title,
  price,
  rating,
  tags,
  image,
  liked = false,
}: {
  title: string
  price: number
  rating: number
  tags: string[]
  image: string
  liked?: boolean
}) {
  return (
    <div className="bg-gray-6 flex flex-col items-start justify-center overflow-hidden rounded-xl">
      {/* Image */}
      <div className="h-[127.5px] overflow-hidden relative w-full">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Heart Button */}
        <button className="absolute backdrop-blur-[7.5px] bg-gray-6/50 flex items-center justify-center h-7 p-0 rounded-full right-11 top-1.5 w-9">
          <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-7.5 items-center p-2.5 w-full">
        <div className="flex flex-col gap-1.5 items-start w-full">
          {/* Title */}
          <p className="font-semibold h-11 leading-[22px] line-clamp-2 text-[17px] text-black tracking-[-0.43px] w-full">
            {title}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 items-center w-full">
            {tags.map((tag, i) => (
              <span
                key={i}
                className={`flex items-center justify-center px-1.5 py-0.5 rounded-full ${
                  i === 0 ? 'bg-primary' : 'bg-accent-blue'
                }`}
              >
                <span className="font-normal text-[11px] text-secondary tracking-[0.06px]">
                  {tag}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Price & Rating */}
        <div className="flex items-center justify-between w-full">
          <p className="font-normal text-[16px] text-black tracking-[-0.31px]">
            ${price}
          </p>
          <div className="flex items-center justify-end gap-0.5">
            <span className="text-star">⭐</span>
            <p className="font-medium text-[10px] text-black">{rating}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
