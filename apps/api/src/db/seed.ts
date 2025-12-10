// Seed script - Run this to populate the database with sample data
import { db, users, experiences } from './index'
import { generateId } from '@tropigo/utils'

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Create sample hosts
    const host1Id = generateId()
    const host2Id = generateId()

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
        id: generateId(),
        email: 'tourist@example.com',
        name: 'John Smith',
        role: 'tourist',
      },
    ])

    console.log('✅ Created 3 users')

    // Create sample experiences
    await db.insert(experiences).values([
      {
        id: generateId(),
        hostId: host1Id,
        title: 'Traditional Fishing with Local Fishermen',
        description: 'Join experienced Maldivian fishermen for an authentic fishing trip. Learn traditional techniques passed down through generations.',
        category: 'fishing',
        price: '50.00',
        island: 'Thulusdhoo',
        images: ['fishing1.jpg', 'fishing2.jpg'],
      },
      {
        id: generateId(),
        hostId: host1Id,
        title: 'Uninhabited Island Adventure',
        description: 'Explore pristine uninhabited islands that resorts cannot take you to. Private beaches, snorkeling, and local BBQ lunch.',
        category: 'island-hopping',
        price: '120.00',
        island: 'Male',
        images: ['island1.jpg'],
      },
      {
        id: generateId(),
        hostId: host2Id,
        title: 'Maldivian Cooking Class',
        description: 'Learn to cook authentic Maldivian dishes with a local family. Market visit included.',
        category: 'cultural',
        price: '45.00',
        island: 'Maafushi',
        images: ['cooking1.jpg', 'cooking2.jpg'],
      },
      {
        id: generateId(),
        hostId: host2Id,
        title: 'Sunrise Dolphin Watching',
        description: 'Early morning boat trip to see dolphins in their natural habitat. Coffee and traditional breakfast onboard.',
        category: 'island-hopping',
        price: '35.00',
        island: 'Hulhumale',
        images: ['dolphin1.jpg'],
      },
    ])

    console.log('✅ Created 4 experiences')
    console.log('✨ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }

  process.exit(0)
}

seed()
