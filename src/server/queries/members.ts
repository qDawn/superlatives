import { db } from '@/server/db'
import { roomMembers } from '@/server/db/schema/rooms'
import { eq } from 'drizzle-orm'

export async function getRoomMembers(roomId: string) {
  return db.query.roomMembers.findMany({
    where: eq(roomMembers.roomId, roomId),
    orderBy: (members, { asc }) => [asc(members.registeredAt)],
  })
}