import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getRoomForVoting } from '@/server/queries/rooms'
import { getNameList } from '@/server/queries/votes'
import VotingForm from './voting-form'

export default async function VotePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  const data = await getRoomForVoting(slug, session.user.id)

  if (!data) redirect('/dashboard')

  const { room, member } = data

  const isOwner = room.ownerId === session.user.id

  if (isOwner && !room.ownerParticipates) {
    redirect(`/rooms/${slug}/manage/questions`)
  }

  if (!member || member.status !== 'approved') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-2 px-4 text-center">
          <h1 className="text-2xl font-semibold">Approval pending</h1>
          <p className="text-sm text-muted-foreground">
            The host hasn't approved your request yet. You'll receive an email when approved. Requests expire after 7 days.
          </p>
        </div>
      </main>
    )
  }

  if (room.status === 'draft') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-2 px-4 text-center">
          <h1 className="text-2xl font-medium">Room not open yet</h1>
          <p className="text-sm text-muted-foreground">
            The host hasn't opened voting yet.
          </p>
        </div>
      </main>
    )
  }

  if (room.status === 'closed') {
    redirect(`/rooms/${slug}/results`)
  }

  const questionSet = room.questionSets?.[0]
  let questions = questionSet?.questions ?? []
  const nameList = await getNameList(room.id)

  if (questionSet?.shuffleQuestions) {
    questions = [...questions].sort(() => Math.random() - 0.5)
  }

  const nameListPerQuestion: Record<string, typeof nameList> = {}
  for (const q of questions) {
    nameListPerQuestion[q.id] = q.shuffleOptions
      ? [...nameList].sort(() => Math.random() - 0.5)
      : nameList
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <VotingForm
        questions={questions}
        memberId={member.id}
        roomSlug={slug}
        roomId={room.id}
        nameList={nameList}
        nameListPerQuestion={nameListPerQuestion}
      />
    </main>
  )
}