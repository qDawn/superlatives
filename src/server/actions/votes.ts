'use server'

import { db } from '@/server/db'
import { votes, voteSelections, nameListEntries } from '@/server/db/schema/votes'
import { rooms, roomMembers } from '@/server/db/schema/rooms'
import { questions, questionSets } from '@/server/db/schema/questions'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'

export async function submitVotes({
  answers,
  memberId,
  roomId,
}: {
  answers: Record<string, string[]>
  memberId: string
  roomId: string
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  })

  if (!room) return { error: 'Room not found' }
  if (room.status !== 'open') return { error: 'Voting is not open' }

  const member = await db.query.roomMembers.findFirst({
    where: and(
      eq(roomMembers.id, memberId),
      eq(roomMembers.userId, session.user.id)
    ),
  })

  if (!member || member.status !== 'approved') return { error: 'Not authorized to vote' }

  if (!room.joinLocked) {
    await db.update(rooms)
      .set({ joinLocked: true })
      .where(eq(rooms.id, roomId))
  }

  for (const [questionId, selections] of Object.entries(answers)) {
    if (!selections.length) continue

    const question = await db.query.questions.findFirst({
      where: eq(questions.id, questionId),
    })

    if (!question) continue

    const existing = await db.query.votes.findFirst({
      where: and(
        eq(votes.questionId, questionId),
        eq(votes.voterMemberId, memberId)
      ),
    })

    if (existing) continue

    const [vote] = await db.insert(votes).values({
      questionId,
      voterMemberId: memberId,
    }).returning()

    if (question.questionType === 'group_combination') {
      for (const key of selections) {
        const nameIds = key.split('|')
        const groupIndex = selections.indexOf(key)
        for (const nameId of nameIds) {
          await db.insert(voteSelections).values({
            voteId: vote.id,
            nameEntryId: nameId,
            groupAnswerIndex: groupIndex,
          })
        }
      }
    } else {
      for (const nameId of selections) {
        await db.insert(voteSelections).values({
          voteId: vote.id,
          nameEntryId: nameId,
          groupAnswerIndex: null,
        })
      }
    }
  }

  return { success: true }
}