'use client'

import { useActionState } from 'react'
import { closeVoting } from '@/server/actions/rooms'
import Link from 'next/link'

export default function CloseVotingButton({
  roomId,
  roomSlug,
  roomStatus,
}: {
  roomId: string
  roomSlug: string
  roomStatus: string
}) {
  const [state, action, pending] = useActionState(closeVoting, null)

  if (roomStatus === 'closed') {
    return (
      <Link
        href={`/rooms/${roomSlug}/results`}
        className="rounded-md border px-4 py-2 text-sm hover:bg-accent inline-block"
      >
        View results
      </Link>
    )
  }

  if (roomStatus !== 'open') return null

  return (
    <form action={action}>
      <input type="hidden" name="roomId" value={roomId} />
      {state?.error && (
        <p className="text-sm text-destructive mb-2">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-destructive text-destructive px-4 py-2 text-sm hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
      >
        {pending ? 'Closing...' : 'Close voting'}
      </button>
    </form>
  )
}