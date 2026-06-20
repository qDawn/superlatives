'use client'

import { useActionState } from 'react'
import { joinRoom } from '@/server/actions/members'
import Link from 'next/link'

export default function JoinForm({
  roomId,
  roomSlug,
  joinMode,
}: {
  roomId: string
  roomSlug: string
  joinMode: string
}) {
  const [state, action, pending] = useActionState(joinRoom, null)

  if (state?.success) {
    return (
      <div className="rounded-lg border p-4 space-y-4">
        <p className="text-sm font-medium">
          {joinMode === 'auto'
            ? 'You have joined the room.'
            : 'Request sent. The host will approve you shortly.'}
        </p>
        {joinMode === 'auto' && (
        <Link
            href={`/rooms/${roomSlug}/vote`}
            className="block w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 text-center"
        >
            Go to voting
        </Link>
        )}
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="roomSlug" value={roomSlug} />

      <div className="space-y-1">
        <label htmlFor="displayName" className="text-sm font-medium">
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          maxLength={50}
          placeholder="e.g. Alex"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? 'Joining...' : 'Join room'}
      </button>
    </form>
  )
}