'use server'

import { db } from '@/server/db'
import { rooms } from '@/server/db/schema/rooms'
import { coOwnerPermissions, permissionBundles } from '@/server/db/schema/permissions'
import { user } from '@/server/db/schema/auth'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const BUNDLE_PRESETS = {
  moderator: {
    name: 'Moderator',
    canApproveMembers: true,
    canCloseVoting: false,
    canViewCompletionCount: true,
    canManageQuestionSet: false,
  },
  co_host: {
    name: 'Co-host',
    canApproveMembers: true,
    canCloseVoting: true,
    canViewCompletionCount: true,
    canManageQuestionSet: true,
  },
}

export async function inviteCoOwner(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const roomId = formData.get('roomId') as string
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const bundleKey = formData.get('bundleKey') as keyof typeof BUNDLE_PRESETS

  if (!email) return { error: 'Email is required' }

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })
  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }

  const targetUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  })
  if (!targetUser) return { error: 'No account found with that email' }
  if (targetUser.id === session.user.id) return { error: "You can't add yourself as a co-owner" }

  const existing = await db.query.coOwnerPermissions.findFirst({
    where: and(
      eq(coOwnerPermissions.roomId, roomId),
      eq(coOwnerPermissions.userId, targetUser.id)
    ),
  })
  if (existing) return { error: 'This user is already a co-owner of this room' }

  const preset = BUNDLE_PRESETS[bundleKey] ?? BUNDLE_PRESETS.moderator

  const [bundle] = await db.insert(permissionBundles).values({
    createdBy: session.user.id,
    name: preset.name,
    isSystemPreset: true,
    canApproveMembers: preset.canApproveMembers,
    canCloseVoting: preset.canCloseVoting,
    canViewCompletionCount: preset.canViewCompletionCount,
    canManageQuestionSet: preset.canManageQuestionSet,
  }).returning()

  await db.insert(coOwnerPermissions).values({
    roomId,
    userId: targetUser.id,
    permissionBundleId: bundle.id,
  })

  revalidatePath(`/rooms/${room.slug}/manage/questions`)
  return { success: true, addedName: targetUser.name }
}

export async function removeCoOwner(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const coOwnerId = formData.get('coOwnerId') as string
  const roomId = formData.get('roomId') as string

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })
  if (!room || room.ownerId !== session.user.id) return { error: 'Unauthorized' }

  await db.delete(coOwnerPermissions).where(eq(coOwnerPermissions.id, coOwnerId))

  revalidatePath(`/rooms/${room.slug}/manage/questions`)
  return { success: true }
}