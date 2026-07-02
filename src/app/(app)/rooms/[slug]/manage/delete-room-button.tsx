'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRoom } from '@/server/actions/rooms'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function DeleteRoomButton({ roomId }: { roomId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setPending(true)
    const fd = new FormData()
    fd.set('roomId', roomId)
    const result = await deleteRoom(fd)
    if (result?.success) {
      toast.success('Room deleted')
      router.push('/dashboard')
    } else if (result?.error) {
      toast.error(result.error)
      setPending(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">Delete this room permanently?</p>
        <Button size="sm" variant="destructive" disabled={pending} onClick={handleDelete}>
          {pending ? 'Deleting...' : 'Yes, delete'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="destructive" onClick={() => setConfirming(true)}>
      Delete room
    </Button>
  )
}