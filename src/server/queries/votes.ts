import { db } from '@/server/db'
import { nameListEntries, votes, voteSelections } from '@/server/db/schema/votes'
import { eq, and, inArray } from 'drizzle-orm'
import { questions, questionSets } from '@/server/db/schema/questions'
import { rooms } from '@/server/db/schema/rooms'
import { resultViews } from '@/server/db/schema/votes'
import { createId } from '@paralleldrive/cuid2'

export async function recordResultView(roomId: string, userId: string) {
  const existing = await db.query.resultViews.findFirst({
    where: and(
      eq(resultViews.roomId, roomId),
      eq(resultViews.userId, userId)
    ),
  })

  if (!existing) {
    await db.insert(resultViews).values({
      id: createId(),
      roomId,
      userId,
    })
  }
}

export async function hasResultBeenViewed(roomId: string) {
  const view = await db.query.resultViews.findFirst({
    where: eq(resultViews.roomId, roomId),
  })
  return !!view
}


export async function getNameList(roomId: string) {
  return db.query.nameListEntries.findMany({
    where: eq(nameListEntries.roomId, roomId),
    orderBy: (entries, { asc }) => [asc(entries.sortOrder)],
  })
}

export async function getResults(roomId: string) {
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

  const results = []

  for (const question of questionSet.questions) {
    const questionVotes = await db.query.votes.findMany({
      where: eq(votes.questionId, question.id),
      with: {
        voteSelections: true,
      },
    })

    if (question.questionType === 'group_combination') {
      const tally: Record<string, number> = {}

      for (const vote of questionVotes) {
        const groups: Record<number, string[]> = {}
        for (const sel of vote.voteSelections) {
          const idx = sel.groupAnswerIndex ?? 0
          if (!groups[idx]) groups[idx] = []
          groups[idx].push(sel.nameEntryId)
        }
        for (const group of Object.values(groups)) {
          const key = [...group].sort().join('|')
          tally[key] = (tally[key] ?? 0) + 1
        }
      }

      const tallyWithNames = Object.entries(tally).map(([key, count]) => ({
        label: key.split('|').map(id =>
          nameList.find(n => n.id === id)?.displayName ?? id
        ).join(' + '),
        count,
      })).sort((a, b) => b.count - a.count)

      results.push({ question, tally: tallyWithNames })
    } else {
      const tally: Record<string, number> = {}

      for (const vote of questionVotes) {
        for (const sel of vote.voteSelections) {
          tally[sel.nameEntryId] = (tally[sel.nameEntryId] ?? 0) + 1
        }
      }

      const tallyWithNames = Object.entries(tally).map(([id, count]) => ({
        label: nameList.find(n => n.id === id)?.displayName ?? id,
        count,
      })).sort((a, b) => b.count - a.count)

      results.push({ question, tally: tallyWithNames })
    }
  }

  return results
}