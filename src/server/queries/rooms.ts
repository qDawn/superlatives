import { db } from '@/server/db'
import { rooms, roomMembers } from '@/server/db/schema/rooms'
import { eq } from 'drizzle-orm'

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