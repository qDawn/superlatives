import { getCompletionCount } from '@/server/queries/members'

export default async function CompletionCount({ roomId, roomStatus }: { roomId: string, roomStatus: string }) {
  if (roomStatus !== 'open') return null

  const { completed, total } = await getCompletionCount(roomId)

  return (
    <div className="rounded-lg border px-4 py-3 text-sm space-y-1">
      <p className="font-medium">Responses</p>
      <p className="text-muted-foreground">{completed} of {total} participants have submitted</p>
    </div>
  )
}