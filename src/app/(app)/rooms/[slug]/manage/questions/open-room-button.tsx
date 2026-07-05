'use client'

import { openRoom } from '@/server/actions/rooms'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'

export default function OpenRoomButton({
  roomId,
  roomStatus,
  approvedMemberCount,
  ownerParticipates,
}: {
  roomId: string
  roomStatus: string
  approvedMemberCount: number
  ownerParticipates: boolean
}) {
  const [state, action, pending] = useActionState(openRoom, null)

  if (roomStatus === 'open') {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
        Voting is open. Share the join link with participants.
      </div>
    )
  }

  if (roomStatus === 'closed') {
    return (
      <div className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
        Voting is closed.
      </div>
    )
  }

  const effectiveCount = approvedMemberCount + (ownerParticipates ? 1 : 0)
  const isEmpty = effectiveCount === 0

  return (
    <form action={action}>
      <input type="hidden" name="roomId" value={roomId} />
      {isEmpty && (
        <p className="text-sm text-muted-foreground mb-2">
          No participants yet. Add yourself as a participant or share the join link before opening, otherwise the name list will be empty.
        </p>
      )}
      {!isEmpty && approvedMemberCount === 0 && ownerParticipates && (
        <p className="text-sm text-muted-foreground mb-2">
          Only you are on the name list. Share the join link so others can join before opening.
        </p>
      )}
      {state?.error && (
        <p className="text-sm text-destructive mb-2">{state.error}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Opening...' : 'Open voting'}
      </Button>
    </form>
  )
}