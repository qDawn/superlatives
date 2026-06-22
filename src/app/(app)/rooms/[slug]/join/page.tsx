import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getRoomBySlug } from '@/server/queries/rooms'
import JoinForm from './join-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Join {room.name}</CardTitle>
            <CardDescription>
              Choose a display name. This is the name others will vote for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JoinForm roomId={room.id} roomSlug={slug} joinMode={room.joinMode} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}