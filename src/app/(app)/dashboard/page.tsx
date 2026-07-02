import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/server/db'
import { rooms, roomMembers } from '@/server/db/schema/rooms'
import { user } from '@/server/db/schema/auth'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LeaveRoomButton from './leave-room-button'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  })

  const isAdmin = dbUser?.siteRole === 'super_admin'

  const myRooms = await db.query.rooms.findMany({
    where: eq(rooms.ownerId, session.user.id),
    orderBy: (rooms, { desc }) => [desc(rooms.createdAt)],
    with: { roomMembers: true },
  })

  const joinedMembers = await db.query.roomMembers.findMany({
    where: eq(roomMembers.userId, session.user.id),
    with: { room: true },
  })

  const pendingMembers = joinedMembers.filter(m => m.status === 'pending')

  
  const joinedRooms = joinedMembers
    .filter(m => m.status === 'approved' && !myRooms.find(r => r.id === m.roomId))

  function StatusBadge({ status }: { status: string }) {
    if (status === 'open') return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">Voting open</Badge>
    if (status === 'closed') return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">Closed</Badge>
    return <Badge variant="outline">Draft</Badge>
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{session.user.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/profile" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Profile
          </Link>
          <Link href="/rooms/new" className={buttonVariants({ size: 'sm' })}>
            Create room
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Your rooms</h2>
        {myRooms.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No rooms yet.</p>
              <Link href="/rooms/new" className={buttonVariants({ size: 'sm', className: 'mt-4 inline-flex' })}>
                Create your first room
              </Link>
            </CardContent>
          </Card>
        )}
        {myRooms.map(room => {
          const approved = room.roomMembers.filter(m => m.status === 'approved').length
          const pending = room.roomMembers.filter(m => m.status === 'pending').length
          return (
            <Card key={room.id} className="hover:bg-accent/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{room.name}</p>
                      <StatusBadge status={room.status} />
                      {pending > 0 && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          {pending} pending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{approved} member{approved !== 1 ? 's' : ''}</span>
                      {room.status === 'closed' && (
                        <Link href={`/rooms/${room.slug}/results`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          View results →
                        </Link>
                      )}
                    </div>
                  </div>
                  <Link href={`/rooms/${room.slug}/manage/questions`} className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' shrink-0'}>
                    Manage
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {pendingMembers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Pending approval</h2>
          {pendingMembers.map(m => (
            <Card key={m.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{m.room.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Waiting for the host to approve your request
                    </p>
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-300 shrink-0">
                    Pending
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {joinedRooms.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Rooms you've joined</h2>
          {joinedRooms.map(m => (
            <Card key={m.id} className="hover:bg-accent/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{m.room.name}</p>
                      <StatusBadge status={m.room.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {m.room.status === 'open' && 'Voting is open — go cast your votes'}
                      {m.room.status === 'closed' && 'Voting has closed — results available'}
                      {m.room.status === 'draft' && 'Waiting for host to open voting'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={m.room.status === 'closed' ? `/rooms/${m.room.slug}/results` : `/rooms/${m.room.slug}/vote`}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      {m.room.status === 'closed' ? 'Results' : 'Vote'}
                    </Link>
                    <LeaveRoomButton roomId={m.room.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="pt-2 border-t">
          <Link href="/admin/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Admin dashboard →
          </Link>
        </div>
      )}
    </main>
  )
}