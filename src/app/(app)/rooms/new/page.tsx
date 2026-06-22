'use client'

import { useActionState } from 'react'
import { createRoom } from '@/server/actions/rooms'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewRoomPage() {
  const [state, action, pending] = useActionState(createRoom, null)

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader>
            <CardTitle>Create a room</CardTitle>
            <CardDescription>Set up your superlatives game.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Room name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Office Party 2026"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinMode">Who can join?</Label>
                <select
                  id="joinMode"
                  name="joinMode"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="auto">Anyone with the link</option>
                  <option value="manual">Requires my approval</option>
                </select>
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
                {pending ? 'Creating...' : 'Create room'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}