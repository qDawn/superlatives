import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/is-admin'
import { getAnonymisedRoomResults } from '@/server/queries/admin'
import { getRoomById } from '@/server/queries/rooms'
import Link from 'next/link'

export default async function AdminRoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: roomId } = await params
  const session = await requireAdmin()
  if (!session) redirect('/dashboard')

  const room = await getRoomById(roomId)
  if (!room) redirect('/admin/dashboard')

  const data = await getAnonymisedRoomResults(roomId)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <Link
          href="/admin/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to admin
        </Link>
        <h1 className="text-2xl font-medium">{room.name}</h1>
        <p className="text-sm text-muted-foreground capitalize">
          Status: {room.status}
        </p>
      </div>

      {!data ? (
        <p className="text-sm text-muted-foreground">No question set found.</p>
      ) : (
        <div className="space-y-6">
          {data.results.map(({ question, anonymisedVotes }) => (
            <div key={question.id} className="rounded-lg border p-4 space-y-3">
              <p className="font-medium text-sm">{question.text}</p>
              {anonymisedVotes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No votes.</p>
              ) : (
                <div className="space-y-2">
                  {anonymisedVotes.map((vote, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <span className="text-muted-foreground w-24 flex-shrink-0">
                        {vote.voter}
                      </span>
                      <span>{vote.selections.join(' + ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}