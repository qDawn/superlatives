'use client'

import { openRoom } from '@/server/actions/rooms'
import { useActionState } from 'react'

export default function OpenRoomButton({
  roomId,
  roomStatus,
}: {
  roomId: string
  roomStatus: string
}) {
  const [state, action, pending] = useActionState(openRoom, null)

  if (roomStatus === 'open') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
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

  return (
    <form action={action}>
      <input type="hidden" name="roomId" value={roomId} />
      {state?.error && (
        <p className="text-sm text-destructive mb-2">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? 'Opening...' : 'Open voting'}
      </button>
    </form>
  )
}