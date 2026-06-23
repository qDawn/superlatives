'use client'

import { useActionState } from 'react'
import { reopenVoting } from '@/server/actions/rooms'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useEffect } from 'react'

export default function ReopenVotingButton({
  roomId,
  roomStatus,
}: {
  roomId: string
  roomStatus: string
}) {
  const [state, action, pending] = useActionState(reopenVoting, null)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
  }, [state])

  if (roomStatus !== 'closed') return null

  return (
    <form action={action}>
      <input type="hidden" name="roomId" value={roomId} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? 'Reopening...' : 'Reopen voting'}
      </Button>
    </form>
  )
}