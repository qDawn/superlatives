import { db } from '@/server/db'
import { rooms, roomMembers } from '@/server/db/schema/rooms'
import { votes, voteSelections, nameListEntries } from '@/server/db/schema/votes'
import { questions, questionSets } from '@/server/db/schema/questions'
import { user } from '@/server/db/schema/auth'
import { eq } from 'drizzle-orm'

export async function getAllRooms() {
  return db.query.rooms.findMany({
    orderBy: (rooms, { desc }) => [desc(rooms.createdAt)],
    with: {
      roomMembers: true,
    },
  })
}

export async function getAllUsers() {
  return db.query.user.findMany({
    orderBy: (u, { asc }) => [asc(u.createdAt)],
  })
}

export async function getRoomResultsWithIdentities(roomId: string) {
  const nameList = await db.query.nameListEntries.findMany({
    where: eq(nameListEntries.roomId, roomId),
  })

  const questionSet = await db.query.questionSets.findFirst({
    where: eq(questionSets.roomId, roomId),
    with: {
      questions: {
        orderBy: (q, { asc }) => [asc(q.displayOrder)],
      },
    },
  })

  if (!questionSet) return null

  const allMembers = await db.query.roomMembers.findMany({
    where: eq(roomMembers.roomId, roomId),
    with: {
      user: true,
    },
  })

  const memberMap: Record<string, { displayName: string; email: string; name: string }> = {}
  for (const member of allMembers) {
    memberMap[member.id] = {
      displayName: member.displayName,
      email: member.user?.email ?? 'unknown',
      name: member.user?.name ?? 'unknown',
    }
  }

  const results = []

  for (const question of questionSet.questions) {
    const questionVotes = await db.query.votes.findMany({
      where: eq(votes.questionId, question.id),
      with: {
        voteSelections: true,
      },
    })

    const voterDetails = questionVotes.map(vote => {
      const voter = memberMap[vote.voterMemberId]
      const selections = vote.voteSelections.map(sel => {
        const nameEntry = nameList.find(n => n.id === sel.nameEntryId)
        return nameEntry?.displayName ?? 'Unknown'
      })

      return {
        voterDisplayName: voter?.displayName ?? 'Unknown',
        voterEmail: voter?.email ?? 'Unknown',
        voterName: voter?.name ?? 'Unknown',
        selections,
        groupAnswerIndex: vote.voteSelections[0]?.groupAnswerIndex,
      }
    })

    results.push({ question, voterDetails })
  }

  return { results, memberMap }
}