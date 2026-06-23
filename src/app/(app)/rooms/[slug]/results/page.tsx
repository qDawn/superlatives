import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getRoomBySlug } from '@/server/queries/rooms'
import { getResults, recordResultView } from '@/server/queries/votes'
import { db } from '@/server/db'
import { roomMembers, rooms } from '@/server/db/schema/rooms'
import { votes, voteSelections } from '@/server/db/schema/votes'
import { eq, and } from 'drizzle-orm'
import ResultsCharts from './results-charts'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  const room = await getRoomBySlug(slug)
  if (!room) redirect('/dashboard')

  if (room.status !== 'closed') {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 px-4 text-center">
          <h1 className="text-2xl font-semibold">Results not available yet</h1>
          <p className="text-sm text-muted-foreground">
            The host hasn't closed voting yet.
          </p>
          <Link
            href={`/rooms/${slug}/vote`}
            className="text-xs text-muted-foreground hover:text-foreground block"
          >
            ← Back to voting
          </Link>
        </div>
      </main>
    )
  }

  const isOwner = room.ownerId === session.user.id

  if (!isOwner) {
    const member = await db.query.roomMembers.findFirst({
      where: and(
        eq(roomMembers.roomId, room.id),
        eq(roomMembers.userId, session.user.id)
      ),
    })
    if (!member || member.status !== 'approved') redirect('/dashboard')
  }

  await recordResultView(room.id, session.user.id)

  const results = await getResults(room.id)

  if (!results) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground">No results found.</p>
      </main>
    )
  }

  const member = await db.query.roomMembers.findFirst({
    where: and(
      eq(roomMembers.roomId, room.id),
      eq(roomMembers.userId, session.user.id)
    ),
  })

  const myVotes: Record<string, string[]> = {}

  if (member) {
    const myVoteRows = await db.query.votes.findMany({
      where: eq(votes.voterMemberId, member.id),
      with: { voteSelections: true },
    })

    for (const vote of myVoteRows) {
      const nameList = await db.query.nameListEntries.findMany({
        where: eq(votes.questionId, vote.questionId),
      })
      myVotes[vote.questionId] = vote.voteSelections.map(sel => {
        const entry = nameList.find(n => n.id === sel.nameEntryId)
        return entry?.displayName ?? sel.nameEntryId
      })
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div className="space-y-1">
        <Link
          href={isOwner ? `/rooms/${slug}/manage/questions` : '/dashboard'}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← {isOwner ? 'Back to room' : 'Back to dashboard'}
        </Link>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight">{room.name} — Results</h1>
          {isOwner && (
            <Link
              href={`/rooms/${slug}/results/stream`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Stream mode
            </Link>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Voting is closed.</p>
      </div>
      <ResultsCharts results={results} myVotes={myVotes} />
    </main>
  )
}