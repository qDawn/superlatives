import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getRoomBySlug, getRoomQuestions } from '@/server/queries/rooms'
import { getRoomMembers } from '@/server/queries/members'
import QuestionBuilder from './question-builder'
import OpenRoomButton from './open-room-button'
import CloseVotingButton from './close-voting-button'
import CompletionCount from './completion-count'
import ExportImport from './export-import'

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

  const members = await getRoomMembers(room.id)
  const approvedMemberCount = members.filter(m => m.status === 'approved').length
  const existingQuestions = await getRoomQuestions(room.id)

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium">{room.name}</h1>
        <p className="text-sm text-muted-foreground">
          Build your question set. Questions are locked once you open the room.
        </p>
      </div>
      <ExportImport roomId={room.id} roomStatus={room.status} />
      <QuestionBuilder
        roomId={room.id}
        roomSlug={slug}
        roomStatus={room.status}
        initialQuestions={existingQuestions}
      />
      <CompletionCount roomId={room.id} roomStatus={room.status} />
      <div className="flex gap-3 flex-wrap">
        <OpenRoomButton
          roomId={room.id}
          roomStatus={room.status}
          approvedMemberCount={approvedMemberCount}
        />
        <CloseVotingButton roomId={room.id} roomSlug={slug} roomStatus={room.status} />
      </div>
    </main>
  )
}