import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/is-admin'
import { getAllRooms, getAllUsers } from '@/server/queries/admin'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const session = await requireAdmin()
  if (!session) redirect('/dashboard')

  const rooms = await getAllRooms()
  const users = await getAllUsers()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Super-admin</p>
        <h1 className="text-2xl font-medium">Admin dashboard</h1>
      </div>

      <div className="rounded-lg border p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Privacy notice</p>
        <p>
          This dashboard shows real voter identities including display names and email addresses.
          This data is visible only to the super-admin and is disclosed in the site privacy policy.
        </p>
      </div>

      <Link
        href="/admin/dashboard/community"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors block"
      >
        Manage community presets →
      </Link>

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
                View votes
              </Link>
            </div>
          )
        })}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">All users ({users.length})</h2>
        {users.length === 0 && (
          <p className="text-sm text-muted-foreground">No users yet.</p>
        )}
        {users.map(u => (
          <div
            key={u.id}
            className="flex items-center justify-between rounded-lg border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                u.siteRole === 'super_admin'
                  ? 'border-primary/20 text-primary bg-primary/10'
                  : 'border-border text-muted-foreground'
              }`}>
                {u.siteRole === 'super_admin' ? 'Admin' : 'User'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}