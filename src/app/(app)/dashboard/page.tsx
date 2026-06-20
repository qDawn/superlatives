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
  })

  const joinedMembers = await db.query.roomMembers.findMany({
    where: eq(roomMembers.userId, session.user.id),
    with: {
      room: true,
    },
  })

  const joinedRooms = joinedMembers
    .filter(m => m.status === 'approved' && m.roomId !== undefined)
    .filter(m => !myRooms.find(r => r.id === m.roomId))

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Welcome, {session.user.name}</h1>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <Link
          href="/rooms/new"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Create room
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Your rooms</h2>
        {myRooms.length === 0 && (
          <p className="text-sm text-muted-foreground">No rooms yet.</p>
        )}
        {myRooms.map(room => (
          <div
            key={room.id}
            className="flex items-center justify-between rounded-lg border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{room.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {room.status} · {room.joinMode === 'auto' ? 'Open join' : 'Manual approval'}
              </p>
            </div>
            <Link
              href={`/rooms/${room.slug}/manage/questions`}
              className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
            >
              Manage
            </Link>
          </div>
        ))}
      </div>

      {joinedRooms.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Rooms you've joined</h2>
          {joinedRooms.map(m => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{m.room.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {m.room.status}
                </p>
              </div>
              <Link
                href={`/rooms/${m.room.slug}/vote`}
                className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
              >
                {m.room.status === 'closed' ? 'Results' : 'Vote'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}