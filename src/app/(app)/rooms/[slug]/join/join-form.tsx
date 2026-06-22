'use client'

import { useActionState } from 'react'
import { joinRoom } from '@/server/actions/members'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'motion/react'

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
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <p className="text-sm font-medium">
          {joinMode === 'auto'
            ? 'You have joined the room.'
            : 'Request sent. The host will approve you shortly.'}
        </p>
        {joinMode === 'auto' && (
          <Link href={`/rooms/${roomSlug}/vote`} className={buttonVariants() + ' w-full justify-center'}>
            Go to voting
          </Link>
        )}
      </motion.div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="roomSlug" value={roomSlug} />
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          required
          maxLength={50}
          placeholder="e.g. Alex"
        />
      </div>
      {state?.error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-destructive"
        >
          {state.error}
        </motion.p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Joining...' : 'Join room'}
      </Button>
    </form>
  )
}