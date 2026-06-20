import { db } from '@/server/db'
import { rooms, roomMembers } from '@/server/db/schema/rooms'
import { eq, and } from 'drizzle-orm'

export async function getRoomBySlug(slug: string) {
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.slug, slug),
  })
  return room ?? null
}

export async function getRoomWithQuestions(slug: string) {
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.slug, slug),
    with: {
      questionSets: {
        with: {
          questions: {
            orderBy: (questions, { asc }) => [asc(questions.displayOrder)],
          },
        },
      },
    },
  })
  return room ?? null
}

export async function getRoomForVoting(slug: string, userId: string) {
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.slug, slug),
    with: {
      questionSets: {
        with: {
          questions: {
            orderBy: (questions, { asc }) => [asc(questions.displayOrder)],
          },
        },
      },
    },
  })

  if (!room) return null

  const member = await db.query.roomMembers.findFirst({
    where: and(
      eq(roomMembers.roomId, room.id),
      eq(roomMembers.userId, userId)
    ),
  })

  return { room, member: member ?? null }
}
export async function getRoomById(id: string) {
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, id),
  })
  return room ?? null
}