'use server'

import { db } from '@/server/db'
import { user } from '@/server/db/schema/auth'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { rooms, roomMembers } from '@/server/db/schema/rooms'
import { coOwnerPermissions } from '@/server/db/schema/permissions'
import { votes, voteSelections, nameListEntries, resultViews } from '@/server/db/schema/votes'
import { questions, questionSets } from '@/server/db/schema/questions'
import { communityPresets, presetVotes, presetFollows, presetDrafts } from '@/server/db/schema/community'


export async function updateDisplayName(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const name = (formData.get('name') as string)?.trim()
  if (!name || name.length < 1 || name.length > 50) {
    return { error: 'Name must be between 1 and 50 characters' }
  }

  await db.update(user)
    .set({ name })
    .where(eq(user.id, session.user.id))

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateEmail(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email || !email.includes('@')) return { error: 'Invalid email' }

  await auth.api.changeEmail({
    body: { newEmail: email, callbackURL: '/profile' },
    headers: await headers(),
  })

  return { success: true, message: 'Verification email sent to your new address' }
}

export async function updatePassword(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' }
  }

  if (newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: false },
      headers: await headers(),
    })
    return { success: true }
  } catch {
    return { error: 'Current password is incorrect' }
  }
}
export async function deleteAccount(_prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const userId = session.user.id

  const ownedRooms = await db.query.rooms.findMany({
    where: eq(rooms.ownerId, userId),
    with: {
      questionSets: {
        with: { questions: true },
      },
    },
  })

  for (const room of ownedRooms) {
    for (const qs of room.questionSets) {
      for (const question of qs.questions) {
        const questionVotes = await db.query.votes.findMany({
          where: eq(votes.questionId, question.id),
        })
        for (const vote of questionVotes) {
          await db.delete(voteSelections).where(eq(voteSelections.voteId, vote.id))
        }
        await db.delete(votes).where(eq(votes.questionId, question.id))
      }
      await db.delete(questions).where(eq(questions.questionSetId, qs.id))
    }
    await db.delete(questionSets).where(eq(questionSets.roomId, room.id))
    await db.delete(nameListEntries).where(eq(nameListEntries.roomId, room.id))
    await db.delete(resultViews).where(eq(resultViews.roomId, room.id))
    await db.delete(coOwnerPermissions).where(eq(coOwnerPermissions.roomId, room.id))
    await db.delete(roomMembers).where(eq(roomMembers.roomId, room.id))
    await db.delete(rooms).where(eq(rooms.id, room.id))
  }

  const memberRows = await db.query.roomMembers.findMany({
    where: eq(roomMembers.userId, userId),
  })
  for (const member of memberRows) {
    await db.delete(nameListEntries).where(eq(nameListEntries.memberId, member.id))
    const memberVotes = await db.query.votes.findMany({
      where: eq(votes.voterMemberId, member.id),
    })
    for (const vote of memberVotes) {
      await db.delete(voteSelections).where(eq(voteSelections.voteId, vote.id))
    }
    await db.delete(votes).where(eq(votes.voterMemberId, member.id))
  }
  await db.delete(roomMembers).where(eq(roomMembers.userId, userId))

  await db.delete(presetVotes).where(eq(presetVotes.userId, userId))
  await db.delete(presetFollows).where(eq(presetFollows.userId, userId))
  await db.delete(presetDrafts).where(eq(presetDrafts.createdBy, userId))
  await db.delete(communityPresets).where(eq(communityPresets.createdBy, userId))
  await db.delete(coOwnerPermissions).where(eq(coOwnerPermissions.userId, userId))

  await auth.api.deleteUser({
    body : {},
    headers: await headers(),
  })

  return { success: true }
}