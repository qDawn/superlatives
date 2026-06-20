import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/is-admin'
import { getAllRooms } from '@/server/queries/admin'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const session = await requireAdmin()
  if (!session) redirect('/dashboard')

  const rooms = await getAllRooms()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Super-admin</p>
        <h1 className="text-2xl font-medium">Admin dashboard</h1>
      </div>

      <div className="rounded-lg border p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Privacy notice</p>
        <p>
          This dashboard shows anonymised vote data across all rooms.
          Participants are shown as Participant A, B, C etc.
          As the site operator, you have access to the underlying database
          and could technically cross-reference this data — this is disclosed
          in the site privacy policy.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">All rooms ({rooms.length})</h2>
        {rooms.length === 0 && (
          <p className="text-sm text-muted-foreground">No rooms yet.</p>
        )}
        {rooms.map(room => {
          const approved = room.roomMembers.filter(m => m.status === 'approved').length
          const total = room.roomMembers.length
          return (
            <div
              key={room.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{room.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {room.status} · {approved}/{total} members approved
                </p>
              </div>
              <Link
                href={`/admin/dashboard/rooms/${room.id}`}
                className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
              >
                View data
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}