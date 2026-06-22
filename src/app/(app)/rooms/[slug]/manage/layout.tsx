import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getRoomBySlug } from '@/server/queries/rooms'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function ManageLayout({
  children,
  params,
}: {
  children: React.ReactNode
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

  const statusColor =
    room.status === 'open' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' :
    room.status === 'closed' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' :
    ''

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight">{room.name}</h1>
          <Badge variant="outline" className={statusColor}>
            {room.status === 'draft' ? 'Draft' : room.status === 'open' ? 'Voting open' : 'Closed'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground capitalize">
          {room.joinMode === 'auto' ? 'Open join' : 'Manual approval'}
        </p>
      </div>

      <nav className="flex gap-1 border-b pb-0">
        {[
          { href: `/rooms/${slug}/manage/questions`, label: 'Questions' },
          { href: `/rooms/${slug}/manage/members`, label: 'Members' },
          { href: `/rooms/${slug}/results`, label: 'Results' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border transition-colors -mb-px"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  )
}