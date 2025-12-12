// Seed script - Run this to populate the database with sample data
import { db, users, experiences, bookings, wishlist, aiTripPlans, reviews, landmarks, landmarkTranslations } from './index'
import { generateId } from '@tropigo/utils'
import postgres from 'postgres'

// Get the raw postgres client for direct SQL
const connectionString = process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/tropigo'
const sql = postgres(connectionString)

async function clearDatabase() {
  console.log('🧹 Clearing existing data...')
  
  try {
    // Use TRUNCATE CASCADE to handle foreign key constraints efficiently
    await sql`
      TRUNCATE TABLE 
        landmark_translations,
        landmarks,
        ai_trip_plans,
        reviews,
        bookings,
        wishlist,
        experiences,
        users
      RESTART IDENTITY CASCADE
    `
    console.log('✅ Database cleared')
  } catch (error: any) {
    // If tables don't exist, that's okay - they'll be created
    if (error?.code === '42P01') {
      console.log('⚠️  Some tables do not exist yet (will be created)')
    } else {
      // Try individual deletes as fallback
      console.log('⚠️  TRUNCATE failed, trying individual deletes...')
      try {
        await db.delete(landmarkTranslations).catch(() => {})
        await db.delete(landmarks).catch(() => {})
        await db.delete(aiTripPlans).catch(() => {})
        await db.delete(reviews).catch(() => {})
        await db.delete(bookings).catch(() => {})
        await db.delete(wishlist).catch(() => {})
        await db.delete(experiences).catch(() => {})
        await db.delete(users).catch(() => {})
        console.log('✅ Database cleared (using individual deletes)')
      } catch (deleteError) {
        console.log('⚠️  Could not clear database:', deleteError)
      }
    }
  }
}

async function seedUsers() {
  console.log('👥 Seeding users...')
  
    const host1Id = generateId()
    const host2Id = generateId()
  const touristId = generateId()

    await db.insert(users).values([
      {
        id: host1Id,
        email: 'ahmed@tropigo.mv',
        name: 'Ahmed Hassan',
        role: 'host',
      },
      {
        id: host2Id,
        email: 'zara@tropigo.mv',
        name: 'Zara Mohamed',
        role: 'host',
      },
      {
      id: touristId,
        email: 'tourist@example.com',
        name: 'John Smith',
        role: 'tourist',
      },
    ])

    console.log('✅ Created 3 users')
  return { host1Id, host2Id, touristId }
}

async function seedActivities(host1Id: string, host2Id: string) {
  console.log('🏝️  Seeding activities...')

  const activities = [
    {
      id: generateId(),
      hostId: host1Id,
      title: 'Manta Ray Diving Adventure',
      description: 'Dive with majestic manta rays in the crystal-clear waters of Baa Atoll, a UNESCO Biosphere Reserve. This unforgettable experience includes equipment, boat transfer, and refreshments. Our expert guides will take you to the best spots where manta rays gather to feed and clean. Perfect for both beginners and experienced divers.',
      category: 'diving',
      price: '145.00',
      island: 'Baa Atoll',
      images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
      rating: '4.9',
      reviewCount: '127',
      duration: '4 hours',
      maxGroupSize: '8',
      hostType: 'freelance',
      whatsIncluded: ['Full diving equipment', 'Boat transfers', 'Professional dive guide'],
    },
      {
        id: generateId(),
        hostId: host1Id,
      title: 'Sunset Fishing with Local Fisherman',
      description: 'Join experienced Maldivian fishermen for an authentic sunset fishing trip. Learn traditional techniques passed down through generations while enjoying the beautiful Maldivian sunset.',
      category: 'boat-trip',
      price: '65.00',
        island: 'Thulusdhoo',
      images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
      rating: '4.6',
      reviewCount: '89',
      duration: '3 hours',
      maxGroupSize: '6',
      hostType: 'local',
      whatsIncluded: ['Fishing equipment', 'Boat trip', 'Local guide', 'Refreshments'],
      },
      {
        id: generateId(),
        hostId: host1Id,
      title: 'Uninhabited Island Day Trip',
      description: 'Explore pristine uninhabited islands with private beaches, snorkeling, and local BBQ lunch. Perfect for those seeking untouched natural beauty.',
      category: 'island',
        price: '120.00',
        island: 'Male',
      images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
      rating: '4.9',
      reviewCount: '156',
      duration: '6 hours',
      maxGroupSize: '12',
      hostType: 'local',
      whatsIncluded: ['Boat transfer', 'Snorkeling equipment', 'BBQ lunch', 'Guide'],
      },
      {
        id: generateId(),
        hostId: host2Id,
      title: 'Traditional Maldivian Cooking Class',
      description: 'Learn to cook authentic Maldivian dishes with a local family. Market visit and ingredients included. Experience the true flavors of the Maldives.',
      category: 'culture',
        price: '45.00',
        island: 'Maafushi',
      images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'],
      rating: '4.7',
      reviewCount: '67',
      duration: '3 hours',
      maxGroupSize: '8',
      hostType: 'local',
      whatsIncluded: ['Market visit', 'All ingredients', 'Cooking instruction', 'Meal'],
      },
      {
        id: generateId(),
        hostId: host2Id,
      title: 'Dolphin Watching Cruise',
      description: 'Early morning boat trip to see dolphins in their natural habitat. Coffee and traditional breakfast onboard. A magical experience for all ages.',
      category: 'boat-trip',
      price: '55.00',
        island: 'Hulhumale',
      images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
      rating: '4.5',
      reviewCount: '98',
      duration: '2.5 hours',
      maxGroupSize: '15',
      hostType: 'local',
      whatsIncluded: ['Boat cruise', 'Breakfast', 'Guide', 'Refreshments'],
    },
    {
      id: generateId(),
      hostId: host1Id,
      title: 'Snorkeling Safari - 3 Spots',
      description: 'Visit three amazing snorkeling locations with diverse marine life. All equipment and guide included. Perfect for exploring the underwater world.',
      category: 'water-sport',
      price: '75.00',
      island: 'Ari Atoll',
      images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
      rating: '4.8',
      reviewCount: '203',
      duration: '5 hours',
      maxGroupSize: '10',
      hostType: 'freelance',
      whatsIncluded: ['Snorkeling equipment', 'Boat transfer', 'Professional guide', 'Refreshments'],
    },
    {
      id: generateId(),
      hostId: host2Id,
      title: 'Whale Shark Encounter',
      description: 'Swim alongside the gentle giants of the ocean. Professional guides ensure safe and respectful encounters with these magnificent creatures.',
      category: 'diving',
      price: '180.00',
      island: 'South Ari Atoll',
      images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
      rating: '4.9',
      reviewCount: '234',
      duration: '6 hours',
      maxGroupSize: '10',
      hostType: 'freelance',
      whatsIncluded: ['Snorkeling equipment', 'Boat transfer', 'Marine biologist guide', 'Lunch'],
    },
    {
      id: generateId(),
      hostId: host1Id,
      title: 'Sandbank Picnic Experience',
      description: 'Enjoy a private sandbank picnic in the middle of the ocean. Perfect for couples or small groups seeking a romantic and secluded experience.',
      category: 'island',
      price: '95.00',
      island: 'North Male Atoll',
      images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
      rating: '4.8',
      reviewCount: '145',
      duration: '4 hours',
      maxGroupSize: '6',
      hostType: 'local',
      whatsIncluded: ['Boat transfer', 'Picnic setup', 'Refreshments', 'Snorkeling gear'],
    },
  ]

  await db.insert(experiences).values(activities)
  console.log(`✅ Created ${activities.length} activities`)
  return activities
}

async function seedLandmarks() {
  console.log('🗺️  Seeding landmarks...')

  const landmarkData = [
    {
      id: generateId(),
      name: 'Hukuru Miskiy (Friday Mosque)',
      category: 'historic',
      latitude: 4.175556,
      longitude: 73.508889,
      defaultLanguage: 'en',
      isFeatured: true,
    },
    {
      id: generateId(),
      name: 'National Museum',
      category: 'cultural',
      latitude: 4.175278,
      longitude: 73.509444,
      defaultLanguage: 'en',
      isFeatured: true,
    },
    {
      id: generateId(),
      name: 'Sinamale Bridge Viewpoint',
      category: 'viewpoint',
      latitude: 4.1756,
      longitude: 73.5328,
      defaultLanguage: 'en',
      isFeatured: false,
    },
    {
      id: generateId(),
      name: 'Tsunami Monument',
      category: 'special',
      latitude: 4.1633,
      longitude: 73.5106,
      defaultLanguage: 'en',
      isFeatured: false,
    },
  ]

  const translations = [
    {
      id: generateId(),
      landmarkId: landmarkData[0].id,
      language: 'en',
      name: 'Hukuru Miskiy (Friday Mosque)',
      description:
        'Coral stone mosque built in 1656 with intricate lacquer work and wood carvings, a historic landmark in Male.',
    },
    {
      id: generateId(),
      landmarkId: landmarkData[0].id,
      language: 'es',
      name: 'Mezquita del Viernes (Hukuru Miskiy)',
      description:
        'Mezquita de piedra coralina de 1656 con tallas de madera, uno de los sitios historicos mas importantes de Male.',
    },
    {
      id: generateId(),
      landmarkId: landmarkData[1].id,
      language: 'en',
      name: 'National Museum',
      description:
        'Museum showcasing Maldivian history, royal artifacts, and traditional craftsmanship inside Sultan Park.',
    },
    {
      id: generateId(),
      landmarkId: landmarkData[1].id,
      language: 'es',
      name: 'Museo Nacional',
      description:
        'Museo que muestra la historia de Maldivas con artefactos reales y artesania local dentro de Sultan Park.',
    },
    {
      id: generateId(),
      landmarkId: landmarkData[2].id,
      language: 'en',
      name: 'Sinamale Bridge Viewpoint',
      description:
        'Scenic spot to watch sunrise and sunset across the China-Maldives Friendship Bridge with ocean views.',
    },
    {
      id: generateId(),
      landmarkId: landmarkData[2].id,
      language: 'es',
      name: 'Mirador del Puente Sinamale',
      description:
        'Punto panoramico para ver el amanecer y atardecer sobre el puente de la Amistad China-Maldivas.',
    },
    {
      id: generateId(),
      landmarkId: landmarkData[3].id,
      language: 'en',
      name: 'Tsunami Monument',
      description:
        'Stainless steel monument with 20 spheres honoring the lives lost in the 2004 Indian Ocean tsunami.',
    },
    {
      id: generateId(),
      landmarkId: landmarkData[3].id,
      language: 'es',
      name: 'Monumento al Tsunami',
      description:
        'Monumento de acero con 20 esferas que honra a las vidas perdidas en el tsunami del Oceano Indico de 2004.',
    },
  ]

  await db.insert(landmarks).values(landmarkData)
  await db.insert(landmarkTranslations).values(translations)
  console.log(`✅ Created ${landmarkData.length} landmarks with translations`)
  return landmarkData
}

async function seedBookings(touristId: string, activities: Array<{ id: string; price: string }>) {
  console.log('📅 Seeding bookings...')

  if (activities.length < 2) {
    console.log('⚠️  Not enough activities for bookings')
    return
  }

  const bookingsData = [
    {
      id: generateId(),
      userId: touristId,
      experienceId: activities[0].id,
      bookingDate: new Date('2024-12-15'),
      numberOfGuests: '2',
      totalPrice: (parseFloat(activities[0].price) * 2).toFixed(2),
      status: 'confirmed' as const,
    },
    {
      id: generateId(),
      userId: touristId,
      experienceId: activities[2].id,
      bookingDate: new Date('2024-11-20'),
      numberOfGuests: '4',
      totalPrice: (parseFloat(activities[2].price) * 4).toFixed(2),
      status: 'completed' as const,
    },
  ]

  await db.insert(bookings).values(bookingsData)
  console.log(`✅ Created ${bookingsData.length} bookings`)
}

async function seedWishlist(touristId: string, activities: Array<{ id: string }>) {
  console.log('❤️  Seeding wishlist...')

  if (activities.length < 3) {
    console.log('⚠️  Not enough activities for wishlist')
    return
  }

  const wishlistData = [
    {
      id: generateId(),
      userId: touristId,
      experienceId: activities[1].id,
    },
    {
      id: generateId(),
      userId: touristId,
      experienceId: activities[3].id,
    },
    {
      id: generateId(),
      userId: touristId,
      experienceId: activities[5].id,
    },
  ]

  await db.insert(wishlist).values(wishlistData)
  console.log(`✅ Created ${wishlistData.length} wishlist items`)
}

async function seedReviews(touristId: string, activities: Array<{ id: string }>) {
  console.log('⭐ Seeding reviews...')

  if (activities.length < 2) {
    console.log('⚠️  Not enough activities for reviews')
    return
  }

  const reviewsData = [
    {
      id: generateId(),
      userId: touristId,
      experienceId: activities[0].id,
      rating: '5.0',
      comment: 'Absolutely incredible experience! The manta rays were so close we could almost touch them. Ahmed was knowledgeable and made sure everyone felt safe.',
    },
    {
      id: generateId(),
      userId: touristId,
      experienceId: activities[0].id,
      rating: '4.5',
      comment: 'Amazing diving experience. The water was crystal clear and we saw multiple manta rays. Highly recommend!',
    },
  ]

  await db.insert(reviews).values(reviewsData)
  console.log(`✅ Created ${reviewsData.length} reviews`)
}

async function seedAITripPlans(touristId: string) {
  console.log('🤖 Seeding AI trip plans...')

  const tripPlans = [
    {
      id: generateId(),
      userId: touristId,
      title: '5 Days Adventure Itinerary',
      itinerary: JSON.stringify({
        day1: 'Manta Ray Diving Adventure',
        day2: 'Uninhabited Island Day Trip',
        day3: 'Snorkeling Safari',
        day4: 'Sunset Fishing',
        day5: 'Sandbank Picnic',
      }),
      preferences: JSON.stringify({
        budget: 'medium',
        interests: ['diving', 'island-hopping'],
        duration: '5 days',
      }),
    },
    {
      id: generateId(),
      userId: touristId,
      title: 'Honeymoon Romantic Getaway',
      itinerary: JSON.stringify({
        day1: 'Sandbank Picnic Experience',
        day2: 'Dolphin Watching Cruise',
        day3: 'Traditional Cooking Class',
      }),
      preferences: JSON.stringify({
        budget: 'high',
        interests: ['romantic', 'cultural'],
        duration: '3 days',
      }),
    },
  ]

  await db.insert(aiTripPlans).values(tripPlans)
  console.log(`✅ Created ${tripPlans.length} AI trip plans`)
}

async function seed() {
  console.log('🌱 Starting database seeding...\n')

  try {
    // Clear existing data
    await clearDatabase()

    // Seed in order of dependencies
    const { host1Id, host2Id, touristId } = await seedUsers()
    const activities = await seedActivities(host1Id, host2Id)
    const landmarksSeeded = await seedLandmarks()
    await seedBookings(touristId, activities)
    await seedWishlist(touristId, activities)
    await seedReviews(touristId, activities)
    await seedAITripPlans(touristId)

    console.log('\n✨ Database seeded successfully!')
    console.log(`\n📊 Summary:`)
    console.log(`   - Users: 3`)
    console.log(`   - Activities: ${activities.length}`)
    console.log(`   - Landmarks: ${landmarksSeeded.length}`)
    console.log(`   - Bookings: 2`)
    console.log(`   - Wishlist items: 3`)
    console.log(`   - Reviews: 2`)
    console.log(`   - AI Trip Plans: 2`)
  } catch (error) {
    console.error('\n❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    // Close the SQL connection
    await sql.end()
  }

  process.exit(0)
}

seed()
