import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getRoomBySlug } from '@/server/queries/rooms'
import JoinForm from './join-form'

export default async function JoinRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect(`/login?redirect=/rooms/${slug}/join`)

  const room = await getRoomBySlug(slug)
  if (!room) redirect('/dashboard')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium">Join {room.name}</h1>
          <p className="text-sm text-muted-foreground">
            Choose a display name. This is the name others will vote for.
          </p>
        </div>
        <JoinForm roomId={room.id} roomSlug={slug} joinMode={room.joinMode} />
      </div>
    </main>
  )
}