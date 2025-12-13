// User API Routes
import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import { db, users } from '../db'

const usersRouter = new Hono()

// POST /api/users/guest - Create a guest user
usersRouter.post('/guest', async (c) => {
  try {
    const guestId = `guest_${nanoid()}`
    const guestEmail = `${guestId}@temp.tropigo.com`

    const newUser = await db.insert(users).values({
      id: guestId,
      email: guestEmail,
      name: 'Guest User',
      role: 'guest',
      isGuest: true,
    }).returning()

    return c.json({
      success: true,
      data: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
      },
    })
  } catch (error) {
    console.error('Error creating guest user:', error)
    return c.json({
      success: false,
      error: 'Failed to create guest user',
    }, 500)
  }
})

export default usersRouter
