import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getRoomBySlug } from '@/server/queries/rooms'
import { getResults } from '@/server/queries/votes'
import { db } from '@/server/db'
import { roomMembers } from '@/server/db/schema/rooms'
import { eq, and } from 'drizzle-orm'
import ResultsCharts from './results-charts'
import Link from 'next/link'

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
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-4 px-4 text-center">
          <h1 className="text-2xl font-medium">Results not available yet</h1>
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

  const results = await getResults(room.id)

  if (!results) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground">No results found.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <Link
          href={`/rooms/${slug}/manage/questions`}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to room
        </Link>
        <h1 className="text-2xl font-medium">{room.name} — Results</h1>
        <p className="text-sm text-muted-foreground">Voting is closed.</p>
      </div>
      <ResultsCharts results={results} />
    </main>
  )
}