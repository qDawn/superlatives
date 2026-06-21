import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/server/db'
import { rooms, roomMembers } from '@/server/db/schema/rooms'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  const myRooms = await db.query.rooms.findMany({
    where: eq(rooms.ownerId, session.user.id),
    orderBy: (rooms, { desc }) => [desc(rooms.createdAt)],
    with: {
      roomMembers: true,
    },
  })

  const joinedMembers = await db.query.roomMembers.findMany({
    where: eq(roomMembers.userId, session.user.id),
    with: {
      room: true,
    },
  })

  const joinedRooms = joinedMembers
    .filter(m => m.status === 'approved' && !myRooms.find(r => r.id === m.roomId))

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Welcome, {session.user.name}</h1>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/profile"
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            Profile
          </Link>
          <Link
            href="/rooms/new"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Create room
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Your rooms</h2>
        {myRooms.length === 0 && (
          <p className="text-sm text-muted-foreground">No rooms yet. Create one to get started.</p>
        )}
        {myRooms.map(room => {
          const approved = room.roomMembers.filter(m => m.status === 'approved').length
          const pending = room.roomMembers.filter(m => m.status === 'pending').length
          const statusLabel = room.status === 'draft'
            ? 'Draft'
            : room.status === 'open'
            ? 'Voting open'
            : 'Voting closed'
          const statusColor = room.status === 'draft'
            ? 'text-muted-foreground'
            : room.status === 'open'
            ? 'text-green-600'
            : 'text-blue-600'

          return (
            <div
              key={room.id}
              className="rounded-lg border px-4 py-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{room.name}</p>
                <Link
                  href={`/rooms/${room.slug}/manage/questions`}
                  className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
                >
                  Manage
                </Link>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                <span className={statusColor}>{statusLabel}</span>
                <span>{approved} member{approved !== 1 ? 's' : ''}</span>
                {pending > 0 && (
                  <span className="text-amber-600">{pending} pending approval</span>
                )}
                {room.status === 'closed' && (
                  <Link
                    href={`/rooms/${room.slug}/results`}
                    className="text-blue-600 hover:underline"
                  >
                    View results →
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {joinedRooms.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Rooms you've joined</h2>
          {joinedRooms.map(m => {
            const statusLabel = m.room.status === 'draft'
              ? 'Not open yet'
              : m.room.status === 'open'
              ? 'Voting open'
              : 'Voting closed'
            const statusColor = m.room.status === 'draft'
              ? 'text-muted-foreground'
              : m.room.status === 'open'
              ? 'text-green-600'
              : 'text-blue-600'

            return (
              <div
                key={m.id}
                className="rounded-lg border px-4 py-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{m.room.name}</p>
                  <Link
                    href={m.room.status === 'closed'
                      ? `/rooms/${m.room.slug}/results`
                      : `/rooms/${m.room.slug}/vote`
                    }
                    className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
                  >
                    {m.room.status === 'closed' ? 'Results' : 'Vote'}
                  </Link>
                </div>
                <div className="flex gap-3 text-xs flex-wrap">
                  <span className={statusColor}>{statusLabel}</span>
                  {m.room.status === 'open' && (
                    <span className="text-muted-foreground">Voting is open — go cast your votes</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="pt-4 border-t">
        <Link
          href="/admin/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Admin dashboard →
        </Link>
      </div>
    </main>
  )
}