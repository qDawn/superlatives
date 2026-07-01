import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getRoomBySlug } from '@/server/queries/rooms'
import { getCoOwners } from '@/server/queries/members'
import CoOwnerManager from './co-owner-manager'

export default async function CoOwnersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const room = await getRoomBySlug(slug)
  if (!room) redirect('/dashboard')
  if (room.ownerId !== session.user.id) redirect('/dashboard')

  const coOwners = await getCoOwners(room.id)

  return (
    <div className="space-y-6">
      <CoOwnerManager roomId={room.id} coOwners={coOwners} />
    </div>
  )
}