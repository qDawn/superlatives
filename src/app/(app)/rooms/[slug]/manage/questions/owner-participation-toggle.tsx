'use client'

import { useActionState } from 'react'
import { toggleOwnerParticipation } from '@/server/actions/rooms'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useEffect } from 'react'

export default function OwnerParticipationToggle({
  roomId,
  ownerParticipates,
  roomStatus,
}: {
  roomId: string
  ownerParticipates: boolean
  roomStatus: string
}) {
  const [state, action, pending] = useActionState(toggleOwnerParticipation, null)

  useEffect(() => {
    if (state?.success) toast.success(ownerParticipates ? 'You will no longer be on the name list' : 'You will be added to the name list when voting opens')
    if (state?.error) toast.error(state.error)
  }, [state])

  if (roomStatus !== 'draft') return null

  return (
    <form action={action}>
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="participate" value={String(!ownerParticipates)} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {ownerParticipates ? '✓ You are participating — click to opt out' : 'Join as a participant'}
      </Button>
    </form>
  )
}