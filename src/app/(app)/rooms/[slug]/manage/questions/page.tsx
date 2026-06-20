import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getRoomBySlug } from '@/server/queries/rooms'
import QuestionBuilder from './question-builder'
import OpenRoomButton from './open-room-button'
import CloseVotingButton from './close-voting-button'

export default async function ManageQuestionsPage({
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

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium">{room.name}</h1>
        <p className="text-sm text-muted-foreground">
          Build your question set. Questions are locked once you open the room.
        </p>
      </div>
      <QuestionBuilder roomId={room.id} roomSlug={slug} />
      <div className="flex gap-3">
        <OpenRoomButton roomId={room.id} roomStatus={room.status} />
        <CloseVotingButton roomId={room.id} roomSlug={slug} roomStatus={room.status} />
      </div>
    </main>
  )
}