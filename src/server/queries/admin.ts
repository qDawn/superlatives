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

export async function getAnonymisedRoomResults(roomId: string) {
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

  const allVoters = await db.query.roomMembers.findMany({
    where: eq(roomMembers.roomId, roomId),
  })

  const voterMap: Record<string, string> = {}
  allVoters.forEach((member, i) => {
    voterMap[member.id] = `Participant ${String.fromCharCode(65 + i)}`
  })

  const results = []

  for (const question of questionSet.questions) {
    const questionVotes = await db.query.votes.findMany({
      where: eq(votes.questionId, question.id),
      with: {
        voteSelections: true,
      },
    })

    const anonymisedVotes = questionVotes.map(vote => ({
      voter: voterMap[vote.voterMemberId] ?? 'Unknown',
      selections: vote.voteSelections.map(sel => {
        const nameEntry = nameList.find(n => n.id === sel.nameEntryId)
        return nameEntry?.displayName ?? 'Unknown'
      }),
      groupAnswerIndex: vote.voteSelections[0]?.groupAnswerIndex,
    }))

    results.push({ question, anonymisedVotes })
  }

  return { results, voterMap }
}