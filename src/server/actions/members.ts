'use server'

import { db } from '@/server/db'
import { roomMembers, rooms } from '@/server/db/schema/rooms'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function approveMember(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const memberId = formData.get('memberId') as string
  const roomId = formData.get('roomId') as string

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })

  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }

  await db
    .update(roomMembers)
    .set({ status: 'approved', approvedAt: new Date() })
    .where(and(eq(roomMembers.id, memberId), eq(roomMembers.roomId, roomId)))

  revalidatePath(`/rooms/${room.slug}/manage/members`)
}

export async function denyMember(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const memberId = formData.get('memberId') as string
  const roomId = formData.get('roomId') as string

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })

  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }

  await db
    .update(roomMembers)
    .set({ status: 'denied', autoDeniedAt: new Date() })
    .where(and(eq(roomMembers.id, memberId), eq(roomMembers.roomId, roomId)))

  revalidatePath(`/rooms/${room.slug}/manage/members`)
}

export async function joinRoom(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'You must be logged in to join a room' }

  const roomId = formData.get('roomId') as string
  const roomSlug = formData.get('roomSlug') as string
  const displayName = (formData.get('displayName') as string)?.trim()

  if (!displayName) return { error: 'Display name is required' }

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })

  if (!room) return { error: 'Room not found' }

  const existingName = await db.query.roomMembers.findFirst({
    where: and(
      eq(roomMembers.roomId, roomId),
      eq(roomMembers.displayName, displayName)
    ),
  })

  if (existingName) return { error: 'That name is already taken in this room' }

  const existingMember = await db.query.roomMembers.findFirst({
    where: and(
      eq(roomMembers.roomId, roomId),
      eq(roomMembers.userId, session.user.id)
    ),
  })

  if (existingMember) return { error: 'You have already joined this room' }

  const status = room.joinMode === 'auto' ? 'approved' : 'pending'

  await db.insert(roomMembers).values({
    roomId,
    userId: session.user.id,
    displayName,
    status,
  })

  revalidatePath(`/rooms/${roomSlug}/manage/members`)

  return { success: true }
}