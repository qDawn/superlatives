import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getRoomBySlug } from '@/server/queries/rooms'
import { getResults } from '@/server/queries/votes'
import StreamCharts from './stream-charts'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default async function StreamPage({
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
  if (room.ownerId !== session.user.id) redirect('/dashboard')
  if (room.status !== 'closed') redirect(`/rooms/${slug}/manage/questions`)

  const results = await getResults(room.id)

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Stream mode</p>
          <h1 className="text-2xl font-semibold tracking-tight">{room.name}</h1>
          <p className="text-xs text-muted-foreground">
            Safe to share — no individual vote attribution shown.
          </p>
        </div>
        <Link
          href={`/rooms/${slug}/results`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Exit stream mode
        </Link>
      </div>

      {!results || results.length === 0 ? (
        <p className="text-sm text-muted-foreground">No results yet.</p>
      ) : (
        <StreamCharts results={results} />
      )}
    </main>
  )
}