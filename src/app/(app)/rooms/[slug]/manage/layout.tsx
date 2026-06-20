import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getRoomBySlug } from '@/server/queries/rooms'
import Link from 'next/link'

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium">{room.name}</h1>
        <p className="text-sm text-muted-foreground capitalize">
          Status: {room.status} · Join mode: {room.joinMode}
        </p>
      </div>

      <nav className="flex gap-4 border-b pb-2 text-sm">
        <Link
          href={`/rooms/${slug}/manage/questions`}
          className="hover:text-foreground text-muted-foreground"
        >
          Questions
        </Link>
        <Link
          href={`/rooms/${slug}/manage/members`}
          className="hover:text-foreground text-muted-foreground"
        >
          Members
        </Link>
        <Link
            href={`/rooms/${slug}/results`}
            className="hover:text-foreground text-muted-foreground"
        >
            Results
        </Link>
      </nav>

      {children}
    </div>
  )
}