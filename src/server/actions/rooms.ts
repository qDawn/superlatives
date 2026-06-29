'use server'

import { db } from '@/server/db'
import { rooms, roomMembers } from '@/server/db/schema/rooms'
import { nameListEntries } from '@/server/db/schema/votes'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { eq , and } from 'drizzle-orm'
import { z } from 'zod'
import { resultViews } from '@/server/db/schema/votes'
import { user } from '@/server/db/schema/auth'
import { sendResultsReadyEmail } from '@/lib/email'

const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  joinMode: z.enum(['auto', 'manual']),
})

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Math.random().toString(36).slice(2, 7)
}

export async function createRoom(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const parsed = createRoomSchema.safeParse({
    name: formData.get('name'),
    joinMode: formData.get('joinMode'),
  })

  if (!parsed.success) {
    return { error: 'Invalid input' }
  }

  const { name, joinMode } = parsed.data
  const slug = slugify(name)

  const [room] = await db.insert(rooms).values({
    ownerId: session.user.id,
    name,
    slug,
    joinMode,
    status: 'draft',
  }).returning()

  redirect(`/rooms/${room.slug}/manage/questions`)
}
export async function openRoom(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const roomId = formData.get('roomId') as string

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      roomMembers: {
        where: (members, { eq: eqFn }) => eqFn(members.status, 'approved'),
      },
    },
  })

  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }
  if (room.status !== 'draft') return { error: 'Room already opened' }

  await db.update(rooms)
    .set({ status: 'open' })
    .where(eq(rooms.id, roomId))

  for (const member of room.roomMembers) {
    await db.insert(nameListEntries).values({
      roomId,
      memberId: member.id,
      displayName: member.displayName,
      sortOrder: 0,
    })
  }

  if (room.ownerParticipates) {
    const ownerUser = await db.query.user.findFirst({
      where: eq(user.id, room.ownerId),
    })

    const ownerMember = await db.query.roomMembers.findFirst({
      where: and(
        eq(roomMembers.roomId, roomId),
        eq(roomMembers.userId, room.ownerId)
      ),
    })

    if (!ownerMember && ownerUser) {
      const displayName = ownerUser.name

      const existingName = await db.query.roomMembers.findFirst({
        where: and(
          eq(roomMembers.roomId, roomId),
          eq(roomMembers.displayName, displayName)
        ),
      })

      const finalName = existingName ? `${displayName} (host)` : displayName

      const [newMember] = await db.insert(roomMembers).values({
        roomId,
        userId: room.ownerId,
        displayName: finalName,
        status: 'approved',
        approvedAt: new Date(),
      }).returning()

      await db.insert(nameListEntries).values({
        roomId,
        memberId: newMember.id,
        displayName: finalName,
        sortOrder: 0,
      })
    }
  }

  revalidatePath(`/rooms/${room.slug}/manage/questions`)
  return { success: true }
}
export async function closeVoting(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const roomId = formData.get('roomId') as string

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      roomMembers: {
        where: (members, { eq: eqFn }) => eqFn(members.status, 'approved'),
      },
    },
  })

  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }
  if (room.status !== 'open') return { error: 'Room is not open' }

  await db.update(rooms)
    .set({ status: 'closed', votingClosedAt: new Date() })
    .where(eq(rooms.id, roomId))

  for (const member of room.roomMembers) {
    const memberUser = await db.query.user.findFirst({
      where: eq(user.id, member.userId),
    })
    if (memberUser) {
      await sendResultsReadyEmail({
        to: memberUser.email,
        displayName: member.displayName,
        roomName: room.name,
        roomSlug: room.slug,
      }).catch(err => console.error('Failed to send results email:', err))
    }
  }

  revalidatePath(`/rooms/${room.slug}/manage/questions`)
  return { success: true }
}

export async function toggleOwnerParticipation(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const roomId = formData.get('roomId') as string
  const participate = formData.get('participate') === 'true'

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })

  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }
  if (room.status !== 'draft') return { error: 'Room is already open' }

  await db.update(rooms)
    .set({ ownerParticipates: participate })
    .where(eq(rooms.id, roomId))

  revalidatePath(`/rooms/${room.slug}/manage/questions`)
  return { success: true }
}

export async function reopenVoting(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const roomId = formData.get('roomId') as string

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })

  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }
  if (room.status !== 'closed') return { error: 'Room is not closed' }

  const hasViews = await db.query.resultViews.findFirst({
    where: eq(resultViews.roomId, roomId),
  })

  if (hasViews) return { error: 'Results have already been viewed — voting cannot be reopened' }

  await db.update(rooms)
    .set({ status: 'open', votingReopenedAt: new Date() })
    .where(eq(rooms.id, roomId))

  revalidatePath(`/rooms/${room.slug}/manage/questions`)
  return { success: true }
}