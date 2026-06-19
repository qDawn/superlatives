import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoomBySlug } from '@/server/queries/rooms'
import { getRoomMembers } from '@/server/queries/members'
import MemberList from './member-list'

export default async function MembersPage({
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

  const members = await getRoomMembers(room.id)
  const joinUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/rooms/${slug}/join`

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm font-medium">Join link</p>
        <p className="text-sm text-muted-foreground break-all">{joinUrl}</p>
      </div>

      <MemberList
        members={members}
        roomId={room.id}
        joinMode={room.joinMode}
        roomStatus={room.status}
      />
    </div>
  )
}