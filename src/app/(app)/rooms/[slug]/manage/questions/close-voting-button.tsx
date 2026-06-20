'use client'

import { useActionState } from 'react'
import { closeVoting } from '@/server/actions/rooms'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

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
  const [confirming, setConfirming] = useState(false)

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

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
        <form action={async (fd) => { await action(fd); toast.success('Voting closed') }}>
          <input type="hidden" name="roomId" value={roomId} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {pending ? 'Closing...' : 'Yes, close voting'}
          </button>
        </form>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md border border-destructive text-destructive px-4 py-2 text-sm hover:bg-destructive hover:text-destructive-foreground"
    >
      Close voting
    </button>
  )
}