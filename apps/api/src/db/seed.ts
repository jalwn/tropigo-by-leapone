// Seed script - Run this to populate the database with sample data
import { db, users, experiences, bookings, wishlist, reviews, conversations, aiTripPlans } from './index'
import { generateId } from '@tropigo/utils'

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Clear existing data (for fresh seed) - in order of foreign key dependencies
    console.log('🗑️  Clearing existing data...')
    await db.delete(reviews)
    await db.delete(bookings)
    await db.delete(wishlist)
    await db.delete(aiTripPlans)
    await db.delete(experiences)
    await db.delete(conversations)
    await db.delete(users)
    console.log('✅ Cleared existing data')

    // Create sample hosts
    const host1Id = generateId()
    const host2Id = generateId()
    const host3Id = generateId()

    await db.insert(users).values([
      {
        id: host1Id,
        email: 'ahmed@tropigo.mv',
        name: 'Ahmed Hassan',
        role: 'host',
        isGuest: false,
      },
      {
        id: host2Id,
        email: 'zara@tropigo.mv',
        name: 'Zara Mohamed',
        role: 'host',
        isGuest: false,
      },
      {
        id: host3Id,
        email: 'ibrahim@tropigo.mv',
        name: 'Ibrahim Ali',
        role: 'host',
        isGuest: false,
      },
      {
        id: generateId(),
        email: 'tourist@example.com',
        name: 'John Smith',
        role: 'tourist',
        isGuest: false,
      },
    ])

    console.log('✅ Created 4 users')

    // Create sample experiences
    // Categories: 'island' | 'diving' | 'boat-trip' | 'culture' | 'water-sport'
    await db.insert(experiences).values([
      // Boat Trips
      {
        id: generateId(),
        hostId: host1Id,
        title: 'Sunset Dolphin Cruise',
        description: 'Experience the magic of Maldivian sunsets while watching playful dolphins. Includes refreshments and traditional Maldivian snacks.',
        category: 'boat-trip',
        price: '85.00',
        island: 'Male Atoll',
        images: ['/images/experiences/sunset-cruise.jpg'],
        duration: '3 hours',
        maxGroupSize: '12',
        whatsIncluded: ['Dolphin watching', 'Sunset views', 'Refreshments', 'Traditional snacks'],
        rating: '4.8',
        reviewCount: '124',
      },
      {
        id: generateId(),
        hostId: host1Id,
        title: 'Private Sandbank Picnic',
        description: 'Exclusive sandbank experience with champagne, gourmet lunch, and crystal-clear waters. Perfect for couples and honeymooners.',
        category: 'boat-trip',
        price: '280.00',
        island: 'Ari Atoll',
        images: ['/images/experiences/sandbank-picnic.jpg'],
        duration: '4 hours',
        maxGroupSize: '4',
        whatsIncluded: ['Private boat transfer', 'Gourmet lunch', 'Champagne', 'Snorkeling gear'],
        rating: '5.0',
        reviewCount: '89',
      },
      {
        id: generateId(),
        hostId: host2Id,
        title: 'Full Day Island Hopping',
        description: 'Visit 3 beautiful local islands, swim in turquoise lagoons, and enjoy a traditional Maldivian BBQ lunch on a pristine beach.',
        category: 'boat-trip',
        price: '120.00',
        island: 'Hulhumale',
        images: ['/images/experiences/island-hopping.jpg'],
        duration: '8 hours',
        maxGroupSize: '16',
        whatsIncluded: ['3 island visits', 'BBQ lunch', 'Snorkeling', 'Island guide'],
        rating: '4.7',
        reviewCount: '156',
      },

      // Diving
      {
        id: generateId(),
        hostId: host2Id,
        title: 'Beginner Scuba Diving Experience',
        description: 'First-time diving? No problem! Professional PADI instructors will guide you through shallow reef diving with sea turtles.',
        category: 'diving',
        price: '150.00',
        island: 'Maafushi',
        images: ['/images/experiences/scuba-diving.jpg'],
        duration: '3 hours',
        maxGroupSize: '6',
        whatsIncluded: ['PADI instructor', 'All equipment', 'Underwater photos', 'Certificate'],
        rating: '4.9',
        reviewCount: '203',
      },
      {
        id: generateId(),
        hostId: host3Id,
        title: 'Manta Ray Diving Adventure',
        description: 'Dive with majestic manta rays at famous Manta Point. For certified divers only. Unforgettable underwater experience.',
        category: 'diving',
        price: '195.00',
        island: 'Baa Atoll',
        images: ['/images/experiences/manta-diving.jpg'],
        duration: '4 hours',
        maxGroupSize: '8',
        whatsIncluded: ['2 dives', 'Equipment', 'Boat transfer', 'Dive master'],
        rating: '5.0',
        reviewCount: '167',
      },
      {
        id: generateId(),
        hostId: host3Id,
        title: 'Shark Snorkeling Safari',
        description: 'Snorkel with harmless nurse sharks and reef sharks in their natural habitat. Safe and thrilling experience for all ages.',
        category: 'diving',
        price: '95.00',
        island: 'Fulidhoo',
        images: ['/images/experiences/shark-snorkel.jpg'],
        duration: '2.5 hours',
        maxGroupSize: '10',
        whatsIncluded: ['Snorkel gear', 'Life jackets', 'Guide', 'Waterproof photos'],
        rating: '4.8',
        reviewCount: '142',
      },

      // Island Experiences
      {
        id: generateId(),
        hostId: host1Id,
        title: 'Uninhabited Island Castaway',
        description: 'Spend the day on a deserted island paradise. Swim, sunbathe, explore untouched nature, and enjoy a beach BBQ.',
        category: 'island',
        price: '110.00',
        island: 'South Male Atoll',
        images: ['/images/experiences/uninhabited-island.jpg'],
        duration: '6 hours',
        maxGroupSize: '20',
        whatsIncluded: ['Boat transfer', 'BBQ lunch', 'Beach games', 'Snorkeling'],
        rating: '4.6',
        reviewCount: '98',
      },
      {
        id: generateId(),
        hostId: host2Id,
        title: 'Luxury Sandbank Experience',
        description: 'Private sandbank setup with cabana, butler service, and gourmet dining. The ultimate romantic getaway.',
        category: 'island',
        price: '450.00',
        island: 'North Male Atoll',
        images: ['/images/experiences/luxury-sandbank.jpg'],
        duration: '5 hours',
        maxGroupSize: '2',
        whatsIncluded: ['Private sandbank', 'Butler service', 'Fine dining', 'Champagne'],
        rating: '5.0',
        reviewCount: '45',
      },

      // Cultural Experiences
      {
        id: generateId(),
        hostId: host2Id,
        title: 'Maldivian Cooking Class',
        description: 'Learn to cook authentic Maldivian dishes with a local family. Visit the market, prepare traditional food, and enjoy your creations.',
        category: 'culture',
        price: '65.00',
        island: 'Maafushi',
        images: ['/images/experiences/cooking-class.jpg'],
        duration: '4 hours',
        maxGroupSize: '8',
        whatsIncluded: ['Market tour', 'Cooking lesson', 'Recipe book', 'Full meal'],
        rating: '4.9',
        reviewCount: '178',
      },
      {
        id: generateId(),
        hostId: host1Id,
        title: 'Traditional Boduberu Performance',
        description: 'Experience traditional Maldivian drumming and dance. Learn the history, watch a live performance, and try it yourself!',
        category: 'culture',
        price: '35.00',
        island: 'Thulusdhoo',
        images: ['/images/experiences/boduberu.jpg'],
        duration: '2 hours',
        maxGroupSize: '25',
        whatsIncluded: ['Live performance', 'Cultural guide', 'Try the drums', 'Traditional tea'],
        rating: '4.7',
        reviewCount: '92',
      },
      {
        id: generateId(),
        hostId: host3Id,
        title: 'Local Fishing Experience',
        description: 'Join local fishermen for traditional night fishing. Learn ancient techniques and enjoy your fresh catch cooked Maldivian style.',
        category: 'culture',
        price: '75.00',
        island: 'Guraidhoo',
        images: ['/images/experiences/local-fishing.jpg'],
        duration: '3 hours',
        maxGroupSize: '12',
        whatsIncluded: ['Fishing gear', 'Local guide', 'Fish cooking', 'Dinner'],
        rating: '4.8',
        reviewCount: '134',
      },

      // Water Sports
      {
        id: generateId(),
        hostId: host3Id,
        title: 'Jet Ski Adventure Tour',
        description: 'Speed across crystal waters on a guided jet ski tour. Explore hidden lagoons and secluded beaches at high speed!',
        category: 'water-sport',
        price: '180.00',
        island: 'Hulhumale',
        images: ['/images/experiences/jetski.jpg'],
        duration: '1.5 hours',
        maxGroupSize: '6',
        whatsIncluded: ['Jet ski rental', 'Safety gear', 'Guide', 'Photos'],
        rating: '4.9',
        reviewCount: '211',
      },
      {
        id: generateId(),
        hostId: host1Id,
        title: 'Surfing Lessons - Thulusdhoo',
        description: 'Learn to surf at one of the best surf breaks in the Maldives. Perfect for beginners and intermediate surfers.',
        category: 'water-sport',
        price: '90.00',
        island: 'Thulusdhoo',
        images: ['/images/experiences/surfing.jpg'],
        duration: '2 hours',
        maxGroupSize: '4',
        whatsIncluded: ['Surfboard', 'Instructor', 'Wetsuit', 'Photos'],
        rating: '4.8',
        reviewCount: '167',
      },
      {
        id: generateId(),
        hostId: host2Id,
        title: 'Parasailing Adventure',
        description: 'Soar above the turquoise waters and see the Maldives from a birds eye view. Breathtaking aerial experience!',
        category: 'water-sport',
        price: '125.00',
        island: 'Maafushi',
        images: ['/images/experiences/parasailing.jpg'],
        duration: '1 hour',
        maxGroupSize: '2',
        whatsIncluded: ['Parasailing flight', 'Safety equipment', 'Boat ride', 'Photos'],
        rating: '5.0',
        reviewCount: '145',
      },
      {
        id: generateId(),
        hostId: host3Id,
        title: 'Kayaking Through Mangroves',
        description: 'Peaceful kayaking tour through protected mangrove forests. See local wildlife and learn about the ecosystem.',
        category: 'water-sport',
        price: '55.00',
        island: 'Addu Atoll',
        images: ['/images/experiences/kayaking.jpg'],
        duration: '2.5 hours',
        maxGroupSize: '10',
        whatsIncluded: ['Kayak', 'Paddle', 'Life jacket', 'Nature guide'],
        rating: '4.7',
        reviewCount: '87',
      },
      {
        id: generateId(),
        hostId: host1Id,
        title: 'Stand-Up Paddleboarding Yoga',
        description: 'Combine yoga and SUP for a unique floating meditation experience. Suitable for beginners with basic balance.',
        category: 'water-sport',
        price: '70.00',
        island: 'Male Atoll',
        images: ['/images/experiences/sup-yoga.jpg'],
        duration: '1.5 hours',
        maxGroupSize: '8',
        whatsIncluded: ['SUP board', 'Yoga instructor', 'Paddle', 'Refreshments'],
        rating: '4.9',
        reviewCount: '76',
      },
    ])

    console.log('✅ Created 17 experiences across all categories')
    console.log('✨ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }

  process.exit(0)
}

seed()
