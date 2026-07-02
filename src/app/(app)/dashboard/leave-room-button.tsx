'use client'

import { useState } from 'react'
import { leaveRoom } from '@/server/actions/members'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function LeaveRoomButton({ roomId }: { roomId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleLeave() {
    setPending(true)
    const fd = new FormData()
    fd.set('roomId', roomId)
    const result = await leaveRoom(fd)
    if (result?.success) {
      toast.success('Left room')
      window.location.reload()
    } else if (result?.error) {
      toast.error(result.error)
      setPending(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="destructive" disabled={pending} onClick={handleLeave}>
          {pending ? 'Leaving...' : 'Confirm'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
      Leave
    </Button>
  )
}